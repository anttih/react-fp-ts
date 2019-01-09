import { Component, EventHandler, ReactElement, SyntheticEvent, createElement } from 'react'

type Nullable<A> = { [K in keyof A]: A[K] | null }

type Refs<R extends {}> = Nullable<Partial<R>>

type Self<props, state, action, refs = {}> = {
  readonly props: props
  readonly state: state
  readonly refs: Refs<refs>
}

type NoUpdate = { type: 'NoUpdate' }
type Update<S> = { type: 'Update', state: S }
type SideEffects<P, S, A, R = {}> = { type: 'SideEffects', fn: (self: Self<P, S, A>) => void }
type UpdateAndSideEffects<P, S, A, R> = {
  type: 'UpdateAndSideEffects',
  state: S,
  fn: (self: Self<P, S, A, R>) => void
}

type StateUpdate<P, S, A, R = {}> =
  | NoUpdate
  | Update<S>
  | SideEffects<P, S, A, R>
  | UpdateAndSideEffects<P, S, A, R>

export const noUpdate: NoUpdate = { type: 'NoUpdate' };

export function update<P, S, A>(state: S): StateUpdate<P, S, A> {
  return { type: 'Update', state: state };
}

export function sideEffects<P, S, A>(fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A> {
  return { type: 'SideEffects', fn: fn };
}

export function updateAndSideEffects<P, S, A, R>(
  state: S,
  fn: (self: Self<P, S, A, R>) => void
): StateUpdate<P, S, A, R> {
  return { type: 'UpdateAndSideEffects', state: state, fn: fn };
}

// tslint:disable-next-line:no-any
export type JSX = Element | ReactElement<any> | null

type ComponentSpec<P, S, A, R> = {
  initialState: S,
  reducer: (self: Self<P, S, A, R>, action: A) => StateUpdate<P, S, A, R>,
  render: (self: Self<P, S, A, R>) => JSX,
  shouldUpdate?: (self: Self<P, S, A, R>, props: P, state: S) => boolean,
  didMount?: (self: Self<P, S, A, R>) => void
  didUpdate?: (self: Self<P, S, A, R>) => void
  willUnmount?: (self: Self<P, S, A, R>) => void
}

interface Props<P> {
  __props: P
  __spec: ComponentSpec<P, {}, {}, {}>
}

interface State<S> {
  __state: S
}

interface ReducerComponent<P> {
  new (props: Props<P>): Component<Props<P>, State<{}>>
  displayName: string
}

class ReducerComponentC<P> extends Component<Props<P>, State<{}>> {
  private __spec: ComponentSpec<P, {}, {}, {}>
  private __refs: {}

  toSelf() {
    var self = {
      props: this.props.__props,
      state: this.state === null ? null : this.state.__state,
      refs: this.__refs,
      instance_: this
    };
    return self;
  }

  shouldComponentUpdate(nextProps, nextState) {
    var shouldUpdate = this.__spec.shouldUpdate;
    return shouldUpdate === undefined
      ? true
      : shouldUpdate(
          this.toSelf(),
          nextProps.__props,
          nextState === null ? null : nextState.__state
        );
  }

  componentDidMount() {
    var didMount = this.__spec.didMount;
    if (didMount !== undefined) {
      didMount(this.toSelf());
    }
  }

  componentDidUpdate() {
    var didUpdate = this.__spec.didUpdate;
    if (didUpdate !== undefined) {
      didUpdate(this.toSelf());
    }
  }

  componentWillUnmount() {
    var willUnmount = this.__spec.willUnmount;
    if (willUnmount !== undefined) {
      willUnmount(this.toSelf());
    }
  }

  render() {
    return this.__spec.render(this.toSelf());
  }

  constructor(props: Props<P>) {
    super(props)

    this.__spec = props.__spec;
    this.state =
      this.__spec.initialState === undefined
        ? null
        : { __state: this.__spec.initialState };

    this.__refs = {};
  }
}

export function reducerComponent<P>(displayName: string): ReducerComponent<P> {
  const c = class extends ReducerComponentC<P> {
    static displayName: string
  }
  c.displayName = displayName;
  return c;
}

export function make<P, S, A, R = {}>(
  component: ReducerComponent<P>,
  spec: ComponentSpec<P, S, A, R>
): React.SFC<P> {
  const specPadded = {
    initialState: spec.initialState,
    reducer: spec.reducer,
    render: spec.render,
    shouldUpdate: spec.shouldUpdate,
    didMount: spec.didMount,
    didUpdate: spec.didUpdate,
    willUnmount: spec.willUnmount
  };
  return function(props) {
    var wrappedProps = {
      __props: props,
      __spec: specPadded
    };
    return createElement(component, wrappedProps);
  };
}
