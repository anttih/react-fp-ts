import { Component, EventHandler, ReactElement, SyntheticEvent, createElement } from 'react'

export type Self<props, state, action> = {
  readonly props: props
  readonly state: state
  readonly instance_: ReducerComponentC<props>
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

interface Props<P> {
  __props: P
  __spec: ComponentSpec<P, {}, {}>
}

interface State<S> {
  __state: S
}

export interface ReducerComponent<P> {
  new (props: Props<P>): Component<Props<P>, State<{}>>
  displayName: string
}

class ReducerComponentC<P> extends Component<Props<P>, State<{}>> {
  __spec: ComponentSpec<P, {}, {}>

  toSelf(): Self<P, {}, {}> {
    var self = {
      props: this.props.__props,
      state: this.state.__state,
      instance_: this
    }
    return self
  }

  shouldComponentUpdate(nextProps: Props<P>, nextState: State<{}>) {
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
  }

  render() {
    return this.__spec.render(this.toSelf())
  }

  constructor(props: Props<P>) {
    super(props)

    this.__spec = props.__spec
    this.state = { __state: this.__spec.initialState }
  }
}

export function reducerComponent<P>(displayName: string): ReducerComponent<P> {
  const c = class extends ReducerComponentC<P> {
    static displayName: string
  }
  c.displayName = displayName
  return c
}

export function make<P, S, A = {}>(
  component: ReducerComponent<P>,
  spec: ComponentSpec<P, S, A>
): React.SFC<P> {
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
    var wrappedProps: Props<P> = {
      __props: props,
      __spec: specPadded as any
    }
    return createElement(component, wrappedProps)
  }
}

export function send<P, S, A>(self: Self<P, S, A>, action: A): void {
  const res = self.instance_.__spec.reducer(self, action)
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
      res.fn(self)
      return
  }
}

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

export function _capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  action: A
): EventHandler<E> {
  return capture(self, function () { return action })
}

