# react-fp-ts

A simple functional style React API for TypeScript.

This project started as a fork of [`purescript-react-basic`](https://github.com/lumihq/purescript-react-basic)
but has been rewritten completely in TypeScript.
The inspiration behind both is [Reason React](https://reasonml.github.io/reason-react/en/).

### Installation

```
npm install react-fp-ts
```

### Example

```typescript
import * as React from 'react'
import { Self, _capture, reducerComponent, make, update } from 'react-fp-ts'

type State = number
type Action = { type: 'increment' }

const increment = { type: 'increment' }

const component = reducerComponent('Counter')

export const Counter = make(component, {
  initialState: 0,

  reducer: (self, action) => {
    switch (action.type) {
      case 'increment': return update(self.state + 1)
    }
  },

  render: (self: Self<{}, State, Action>) =>
    <div>
      <span>{self.state}</span>
      <button onClick={_capture(self, increment)}>Click</button>
    </div>
})
```

### Writing a component

You write a component by first creating an empty component with a new identity
and a chosen name which is used in debugging as the component's `displayName`:

```typescript
const component = reducerComponent('Counter')
```

Note that this is an effectful operation – it creates a new component type each
time it is called.

`make` can then be called to provide the implementation for the component:

```
make<P, S, A>(component: ReducerComponent<P>, spec: ComponentSpec<P, S, A>): (props: P) => JSX
```

It is passed the newly created component type and the spec of type `ComponentSpec<P, S, A>`.
The type arguments are for props, state and the action respectively.
A spec is an object with keys of the following type:

* `initialState: S`: the initial state of the component

* `render: (self: Self<P, S, A>) => JSX,`: a function from `Self` to `JSX`.
  This is your normal React `render` function with an explicit `Self` argument.

* `reducer: (self: Self<P, S, A>, action: A) => StateUpdate<P, S, A>,`:
  A function from `Self` and action to some `StateUpdate`.
  This is where you put all your logic.
  The `reducer` should be a pure function, yet you can still do (and should do)
  side effects by wrapping them in a `StateUpdate`.
  A `SteteUpdate` can be one of:

    * `noUpdate: StateUpdate<P, S, A>`: a no-op.
    * `update<P, S, A>(state: S): StateUpdate<P, S, A>`: a simple state update.
    * `updateAndSideEffects<P, S, A>(state: S, fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A>`:
      update the state and then do a side effect.
    * `sideEffects<P, S, A>(fn: (self: Self<P, S, A>) => void): StateUpdate<P, S, A>`:
      perform some side-effects wrapped in function which receives the `Self` as argument.

* `didMount?: (self: Self<P, S, A>) => void`:
  An optional key that corresponds to react's componentDidMount life-cycle hook.

* `didUpdate?: (self: Self<P, S, A>) => void`
  An optional key that corresponds to react's componentDidUpdate life-cycle hook.

* `willUnmount?: (self: Self<P, S, A>) => void`:
  An optional key that corresponds to react's componentWillUnmount life-cycle hook.


### Why should I use this?

* You want a simpler API to React with more focus on functional programming.
* Have a single place to put all state changes and the domain logic (see `reducer` in `ComponentSpec`).
* Avoid using `this` and pass `self` around explicitly, which lends itself to easier abstraction and better reasoning.
* No other dependencies than react.

### Acknowledgements

* Elm
* ReasonReact
* `purescript-react-basic`
