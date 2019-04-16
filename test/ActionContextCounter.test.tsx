import * as React from 'react'
import * as Enzyme from 'enzyme'
import { mount } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { ReducerComponent, _capture, make, updateAndSideEffects } from '..'
import { ActionContextualComponentProps, createActionContextual } from '../src/action-context'
import { ComponentSpec } from '../src/reducer-component'

Enzyme.configure({adapter: new Adapter()})

type State = number

type Action = { type: 'increment' }

const {reducerComponent, withContext} = createActionContextual<{}, State, Action>()

const component: ReducerComponent<{}, State, Action> = reducerComponent('Counter')

interface CounterButtonProps {
  label: string
}
const CounterButton = withContext((props: CounterButtonProps & ActionContextualComponentProps<Action>) => {
  return <button id="counter-button" onClick={() => {
    props.actionContext.sendAction({ type: "increment" })
  }}>{props.label}</button>
})

const componentSpec: ComponentSpec<{}, State, Action> = {
  initialState: 0,

  reducer(self, action) {
    switch (action.type) {
      case 'increment': return updateAndSideEffects(self.state + 1, updatedSelf => { })
    }
  },

  render(self) {
    return (
      <div>
        <span>{self.state}</span>
        <CounterButton label="Click" />
      </div>
    )
  }
}

const Counter = make(component, componentSpec)

test('Reducer can be used to update state', () => {
  const counter = mount(<Counter />)
  counter.find('button').simulate('click')
  counter.find('button').simulate('click')
  expect(counter.find('span').text()).toEqual("2")
})
