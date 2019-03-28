import { Component, EventHandler, ReactElement, SyntheticEvent, createElement } from 'react'

export type Self<props, state, action> = {
  readonly props: props
  readonly state: state
  readonly instance_: ReducerComponentInstance<props, state, action>
}

type NoUpdate = { type: 'NoUpdate' }
type Update<S> = { type: 'Update', state: S }
type SideEffects<P, S, A> = { type: 'SideEffects', fn: (self: Self<P, S, A>) => void }
type UpdateAndSideEffects<P, S, A> = {
  type: 'UpdateAndSideEffects',
  state: S,
  fn: (self: Self<P, S, A>) => void
}

type StateUpdate<P, S, A> =
  | NoUpdate
  | Update<S>
  | SideEffects<P, S, A>
  | UpdateAndSideEffects<P, S, A>

export const noUpdate: NoUpdate = { type: 'NoUpdate' }

export function update<P, S, A>(state: S): StateUpdate<P, S, A> {
  return { type: 'Update', state: state }
}

export function sideEffects<P, S, A>(fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A> {
  return { type: 'SideEffects', fn: fn }
}

export function updateAndSideEffects<P, S, A>(
  state: S,
  fn: (self: Self<P, S, A>) => void
): StateUpdate<P, S, A> {
  return { type: 'UpdateAndSideEffects', state: state, fn: fn }
}

// tslint:disable-next-line:no-any
export type JSX = Element | ReactElement<any> | null

export type ComponentSpec<P, S, A> = {
  initialState: S,
  reducer: (self: Self<P, S, A>, action: A) => StateUpdate<P, S, A>,
  render: (self: Self<P, S, A>) => JSX,
  shouldUpdate?: (self: Self<P, S, A>, props: P, state: S) => boolean,
  didMount?: (self: Self<P, S, A>) => void
  didUpdate?: (self: Self<P, S, A>) => void
  willUnmount?: (self: Self<P, S, A>) => void
}

interface Props<P, S, A> {
  __props: P
  __spec: ComponentSpec<P, S, A>
}

interface State<S> {
  __state: S
}

export interface ReducerComponent<P, S, A> {
  new (props: Props<P, S, A>): Component<Props<P, S, A>, State<S>>
  displayName: string
}

/**
 * The internal implementation of a `ReducerComponent`.
 *
 * Should not be used directly in `render`.
 */
class ReducerComponentInstance<P, S, A> extends Component<Props<P, S ,A>, State<S>> {
  __spec: ComponentSpec<P, S, A>
  __isMounted: boolean = false

  toSelf(): Self<P, S, A> {
    var self = {
      props: this.props.__props,
      state: this.state.__state,
      instance_: this
    }
    return self
  }

  shouldComponentUpdate(nextProps: Props<P, S, A>, nextState: State<S>) {
    var shouldUpdate = this.__spec.shouldUpdate
    return shouldUpdate === undefined
      ? true
      : shouldUpdate(
          this.toSelf(),
          nextProps.__props,
          nextState.__state
        )
  }

  componentDidMount() {
    this.__isMounted = true
    var didMount = this.__spec.didMount
    if (didMount !== undefined) {
      didMount(this.toSelf())
    }
  }

  componentDidUpdate() {
    var didUpdate = this.__spec.didUpdate
    if (didUpdate !== undefined) {
      didUpdate(this.toSelf())
    }
  }

  componentWillUnmount() {
    var willUnmount = this.__spec.willUnmount
    if (willUnmount !== undefined) {
      willUnmount(this.toSelf())
    }
    this.__isMounted = false
  }

  render() {
    return this.__spec.render(this.toSelf())
  }

  constructor(props: Props<P, S, A>) {
    super(props)

    this.__spec = props.__spec
    this.state = { __state: this.__spec.initialState }
  }
}

/**
 * Create a new empty reducer component. This is an effectful function
 * because it creates a component with it's own identity which React
 * uses in it's reconciliation algorithm to compare the trees. This component
 * doesn't really do anything if used directly in a React DOM tree.
 */
export function reducerComponent<P, S, A>(displayName: string): ReducerComponent<P, S, A> {
  const class_ = class extends ReducerComponentInstance<P, S, A> {
    static displayName: string
  }
  class_.displayName = displayName
  return class_
}

/**
 * Given a component and a spec, this returns a functional component that can
 * be used directly in a `render` function.
 *
 * Note that this is a pure function while `reducerComponent` is effectful.
 */
export function make<P, S, A>(
  component: ReducerComponent<P, S, A>,
  spec: ComponentSpec<P, S, A>
): React.FunctionComponent<P> {
  const specPadded: ComponentSpec<P, S, A> = {
    initialState: spec.initialState,
    reducer: spec.reducer,
    render: spec.render,
    shouldUpdate: spec.shouldUpdate,
    didMount: spec.didMount,
    didUpdate: spec.didUpdate,
    willUnmount: spec.willUnmount
  }
  return function(props) {
    var wrappedProps: Props<P, S, A> = {
      __props: props,
      __spec: specPadded as any
    }
    return createElement(component, wrappedProps)
  }
}

/**
 * Send an action to be received by the component `reducer` function.
 */
export function send<P, S, A, AA extends A>(self: Self<P, S, A>, action: AA): void {
  if (!self.instance_.__isMounted) {
    return
  }
  const res = self.instance_.__spec.reducer(self.instance_.toSelf(), action)
  switch (res.type) {
    case 'NoUpdate': return
    case 'Update':
      self.instance_.setState(function (prevState) {
        return {
          __state: res.state,
        }
      })
      return
    case 'UpdateAndSideEffects':
      self.instance_.setState(function (prevState) {
        return {
          __state: res.state
        }
      }, function(){
        var updatedSelf = self.instance_.toSelf()
        res.fn(updatedSelf)
      })
      return
    case 'SideEffects':
      res.fn(self.instance_.toSelf())
      return
  }
}

/**
 * Capture an event by stopping it's propagation and convert the event
 * to an action and send it.
 *
 * This also calls `preventDefault` on the event.
 */
export function capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  eventFn: (e: E) => A
): EventHandler<E> {
  return function (e) {
    e.preventDefault()
    e.stopPropagation()
    send(self, eventFn(e))
  }
}

/**
 * Like `capture` but ignores the event and just sends the given action.
 */
export function _capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  action: A
): EventHandler<E> {
  return capture(self, function () { return action })
}

