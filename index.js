var React = require("react");

exports.reducerComponent = (function () {
  function toSelf() {
    var self = {
      props: this.props.__props,
      state: this.state === null ? null : this.state.__state,
      refs: this.__refs,
      instance_: this
    };
    return self;
  }

  function shouldComponentUpdate(nextProps, nextState) {
    var shouldUpdate = this.__spec.shouldUpdate;
    return shouldUpdate === undefined
      ? true
      : shouldUpdate(
          this.toSelf(),
          nextProps.__props,
          nextState === null ? null : nextState.__state
        );
  }

  function componentDidMount() {
    var didMount = this.__spec.didMount;
    if (didMount !== undefined) {
      didMount(this.toSelf());
    }
  }

  function componentDidUpdate() {
    var didUpdate = this.__spec.didUpdate;
    if (didUpdate !== undefined) {
      didUpdate(this.toSelf());
    }
  }

  function componentWillUnmount() {
    this.$$mounted = false;
    var willUnmount = this.__spec.willUnmount;
    if (willUnmount !== undefined) {
      willUnmount(this.toSelf());
    }
  }

  function render() {
    return this.__spec.render(this.toSelf());
  }

  return function(displayName) {
    var Component = function constructor(props) {
      this.__mounted = true;
      this.__spec = props.__spec;
      this.state =
        this.__spec.initialState === undefined
          ? null
          : { __state: this.__spec.initialState };
      this.__refs = {};
      return this;
    };

    Component.displayName = displayName;
    Component.prototype = Object.create(React.Component.prototype);
    Component.prototype.constructor = Component;
    Component.prototype.toSelf = toSelf;
    Component.prototype.shouldComponentUpdate = shouldComponentUpdate;
    Component.prototype.componentDidMount = componentDidMount;
    Component.prototype.componentDidUpdate = componentDidUpdate;
    Component.prototype.componentWillUnmount = componentWillUnmount;
    Component.prototype.render = render;

    return Component;
  };
})();

var make = exports.make = function (component, spec) {
  var specPadded = {
    initialState: spec.initialState,
    reducer: spec.reducer,
    render: spec.render,
    shouldUpdate: spec.shouldUpdate,
    didMount: spec.didMount,
    didUpdate: spec.didUpdate,
    willUnmount: spec.willUnmount
  };
  return function(props) {
    var wrappedProps = {
      __props: props,
      __spec: specPadded
    };
    return React.createElement(component, wrappedProps);
  };
};

var send = exports.send = function (self, action) {
  var res = self.instance_.__spec.reducer(self, action)
  switch (res.type) {
    case 'NoUpdate': return;
    case 'Update':
      self.instance_.setState(function (prevState) {
        return {
          __state: res.state,
        }
      })
      return;
    case 'UpdateAndSideEffects':
      self.instance_.setState(function (prevState) {
        return {
          __state: res.state
        }
      }, function(){
        var updatedSelf = self.instance_.toSelf()
        res.fn(updatedSelf)
      })
      return;
    case 'SideEffects':
      res.fn(self)
      return;
  }
};

exports.sendAsync = function (self, fn) {
  fn(self).then(function (action) {
    var res = self.instance_.__spec.reducer(self, action)
    switch (res.type) {
      case 'NoUpdate': return;
      case 'Update':
        self.instance_.setState(function (prevState) {
          return {
            __state: res.state,
          }
        })
        return;
      case 'SideEffects':
        res.fn(self)
        return;
      case 'UpdateAndSideEffects':
        self.instance_.setState(function (prevState) {
          return {
            __state: res.state
          }
        }, function () {
          var updatedSelf = self.instance_.toSelf()
          res.reducer(updatedSelf).then(function (nextAction) {
            return send(updatedSelf, nextAction)
          })
        })
        return;
    }
  })
};

exports.updateRef = function(self, prop) {
  return function (refValue) {
    self.refs[prop] = refValue;
  };
}

exports.noUpdate = { type: 'NoUpdate' }

exports.update = function (state) {
  return { type: 'Update', state: state }
}

exports.sideEffects = function (fn) {
  return { type: 'SideEffects', fn: fn }
}

exports.updateAndSideEffects = function (state, fn) {
  return { type: 'UpdateAndSideEffects', state: state, fn: fn }
}

var capture = exports.capture = function (self, eventFn) {
  return function (e) {
    e.preventDefault();
    e.stopPropagation();
    send(self, eventFn(e))
  }
}

exports._capture = function (self, action) {
  return capture(self, function () { return action })
}
