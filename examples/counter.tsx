import * as React from 'react'

import { _capture, createComponent, make, Self, updateAndSideEffects } from '..'

type State = number

type Action = { type: 'increment' }

const increment = { type: 'increment' }

export const Counter = make(createComponent('Counter'), {
  initialState: 0,

  update: (self, action) => {
    switch (action.type) {
      case 'increment': return updateAndSideEffects(self.state + 1, updatedSelf => {
        console.log('State is: ', updatedSelf.state)
      })
    }
  },

  render: (self: Self<{}, State, Action>) =>
    <div>
      <span>{self.state}</span>
      <button onClick={_capture(self, increment)}>Click</button>
    </div>
})
