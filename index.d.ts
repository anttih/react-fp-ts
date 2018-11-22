import { EventHandler, SyntheticEvent } from 'react'

type Self<props, state, action> = {
  readonly props: props
  readonly state: state
}

type NoUpdate = { type: 'NoUpdate' }
type Update<S> = { type: 'Update', state: S }
type SideEffects<P, S, A> = { type: 'SideEffects', fn: (self: Self<P, S, A>) => void }
type UpdateAndSideEffects<P, S, A> = {
  type: 'UpdateAndSideEffects',
  state: S,
  fn: (self: Self<P, S, A>) => void
}
type StateUpdate<P, S, A> = NoUpdate | Update<S> | SideEffects<P, S, A> | UpdateAndSideEffects<P, S, A>

export const noUpdate: NoUpdate
export function update<P, S, A>(state: S): StateUpdate<P, S, A>
export function sideEffects<P, S, A>(fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A>
export function updateAndSideEffects<P, S, A>(state: S, fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A>

type ComponentSpec<P, S, A> = {
  initialState: S,
  update: (self: Self<P, S, A>, action: A) => StateUpdate<P, S, A>,
  render: (self: Self<P, S, A>) => JSX.Element,
  shouldUpdate?: (self: Self<P, S, A>, props: P, state: S) => boolean,
  didMount?: (self: Self<P, S, A>) => void
  didUpdate?: (self: Self<P, S, A>) => void
  willUnmount?: (self: Self<P, S, A>) => void
}

interface Component<P> { }

export function createComponent<P>(displayName: string): Component<P>

export function make<P, S, A>(
  component: Component<P>,
  spec: ComponentSpec<P, S, A>
): React.SFC<P>

export function makeStateless<P>(
  component: Component<P>,
  render: (props: P) => JSX.Element
): React.SFC<P>

export function send<P, S, A>(self: Self<P, S, A>, action: A): void
export function sendAsync<P, S, A>(fn: (self: Self<P, S, A>) => Promise<A>): void

export function capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  eventFn: (e: E) => A
): EventHandler<E>

export function _capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  action: A
): EventHandler<E>
