import * as React from 'react'

import { _capture, createComponent, make, Self, update } from '..'

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