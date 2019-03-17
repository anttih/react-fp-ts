import * as React from 'react'
import * as Enzyme from 'enzyme'
import { mount, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { ReducerComponent, _capture, reducerComponent, make, Self, updateAndSideEffects } from '..'

Enzyme.configure({adapter: new Adapter()})

type State = number

type Action = { type: 'increment' }

const increment: Action = { type: 'increment' }

const component: ReducerComponent<{}, State, Action> = reducerComponent('Counter')

const Counter = make(component, {
  initialState: 0,

  reducer: (self, action) => {
    switch (action.type) {
      case 'increment': return updateAndSideEffects(self.state + 1, updatedSelf => { })
    }
  },

  render: (self) =>
    <div>
      <span>{self.state}</span>
      <button id="counter-button" onClick={_capture(self, increment)}>Click</button>
    </div>
})

test('Reducer can be used to update state', () => {
  const counter = mount(<Counter />)
  counter.find('button').simulate('click')
  counter.find('button').simulate('click')
  expect(counter.find('span').text()).toEqual("2")
})
