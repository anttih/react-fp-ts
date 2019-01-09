import { Component, EventHandler, ReactElement, SyntheticEvent } from 'react'

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

export const noUpdate: NoUpdate
export function update<P, S, A>(state: S): StateUpdate<P, S, A>
export function sideEffects<P, S, A>(fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A>
export function updateAndSideEffects<P, S, A, R>(state: S, fn: (self: Self<P, S, A, R>) => void): StateUpdate<P, S, A, R>

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

// This "empty" component doesn't yet have any state,
// so we ignore the S type argument.
declare class ReducerComponent<P> extends Component<P, {}> { }

export function reducerComponent<P>(displayName: string): ReducerComponent<P>

export function make<P, S, A, R = {}>(
  component: ReducerComponent<P>,
  spec: ComponentSpec<P, S, A, R>
): React.SFC<P>

export function send<P, S, A>(self: Self<P, S, A>, action: A): void
export function sendAsync<P, S, A>(fn: (self: Self<P, S, A>) => Promise<A>): void
export function updateRef<P, S, A, R, K extends keyof R>(self: Self<P, S, A, R>, prop: K): (ref: R[K] | null) => void

export function capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  eventFn: (e: E) => A
): EventHandler<E>

export function _capture<P, S, A, E extends SyntheticEvent>(
  self: Self<P, S, A>,
  action: A
): EventHandler<E>
