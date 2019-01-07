# react-fp-ts

A simple functional style React API for TypeScript.

This is almost a direct port of [`purescript-react-basic`](https://github.com/lumihq/purescript-react-basic) for TypeScript. Which in turn is greatly inspired by [ReasonReact](https://reasonml.github.io/reason-react/en/).

### Istall

```
npm install react-fp-ts
```

### Example

```typescript
import * as React from 'react'

import { _capture, createComponent, make, Self, update } from 'react-basic-ts'

type State = number
type Action = { type: 'increment' }

const increment = { type: 'increment' }

export const Counter = make(createComponent('Counter'), {
  initialState: 0,

  update: (self, action) => {
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

### Why should I use this?

* have a single place to put all state changes and the domain logic (see `update` in `ComponentSpec`)
* avoid using `this`, pass `self` around explicitly, which lends itself to easier abstraction and better reasoning
* no other dependencies than react

### Acknowledgements

* Elm
* ReasonReact
* `purescript-react-basic`
