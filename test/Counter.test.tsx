import * as React from 'react'
import * as Enzyme from 'enzyme'
import { mount, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({adapter: new Adapter()})

import { ReducerComponent, _capture, reducerComponent, make, Self, updateAndSideEffects } from '..'

type State = number

type Action = { type: 'increment' }

const increment = { type: 'increment' }

const component: ReducerComponent<{}> = reducerComponent('Counter')

export const Counter = make(component, {
  initialState: 0,

  reducer: (self, action) => {
    switch (action.type) {
      case 'increment': return updateAndSideEffects(self.state + 1, updatedSelf => {
        console.log('State is: ', updatedSelf.state)
      })
    }
  },

  render: (self: Self<{}, State, Action>) =>
    <div>
      <span>{self.state}</span>
      <button id="counter-button" onClick={_capture(self, increment)}>Click</button>
    </div>
})

test('basic', () => {
  const counter = mount(<Counter />)
  counter.find('button').simulate('click')
  counter.find('button').simulate('click')
  expect(counter.find('span').text()).toEqual("2")
})
