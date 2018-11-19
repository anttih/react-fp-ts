# react-basic-ts

A simple functional style API to React for TypeScript.

This is almost a direct port of [`purescript-react-basic`](https://github.com/lumihq/purescript-react-basic) for TypeScript. Which in turn is greatly inspired by [ReasonReact](https://reasonml.github.io/reason-react/en/).

### Goals

* avoid using `this`, pass `self` around explicitly
* have a single place to put all state changes and the domain logic (see `update` in `ComponentSpec`)
* no other dependencies than react
