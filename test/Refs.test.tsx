import * as React from 'react'
import * as Enzyme from 'enzyme'
import { mount, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { _capture, reducerComponent, make, update, Ref } from '..'

Enzyme.configure({adapter: new Adapter()})

test('Ref is empty at first', () => {
  expect(Ref.create().isEmpty()).toEqual(true)
})

test('Ref can be written to and it becomes non-empty', () => {
  const r = Ref.create()
  r.write("boom")
  expect(r.isEmpty()).toEqual(false)
})

test('Ref can only be modified if it holds a value', () => {
  const r: Ref<number> = Ref.create()
  r.modify(n => n + 1)
  expect(r.isEmpty()).toEqual(true)

  let n = 1
  r.write(n)
  expect(r.isEmpty()).toEqual(false)

  r.modify(x => x + 1)
  r.withRef(x => { n = x })
  expect(n).toEqual(2)
})

const component = reducerComponent('Test')

const Test = make<{}, Ref<HTMLInputElement>, 'click'>(component, {
  initialState: Ref.create(),

  reducer: (self, action) => update(self.state),

  render: self => {
    // To test that method binding works
    let write = self.state.write
    return <>
      <span id="find-me">{self.state.isEmpty() ? "empty" : "not empty"}</span>
      <button id="click-me" onClick={_capture(self, 'rerender')}>Click me</button>
      <span ref={write}></span>
    </>
  }
})

test('A Ref can be updated with react ref prop', () => {
  const counter = mount(<Test />)
  expect(counter.find('#find-me').text()).toEqual("empty")
  counter.find('button').simulate('click')
  expect(counter.find('#find-me').text()).toEqual("not empty")
})
