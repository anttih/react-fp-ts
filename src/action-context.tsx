import * as React from "react"
import { ComponentSpec, send, Self } from "./reducer-component"

export interface ActionContextProps<A> {
  actionContext: ActionContext<A>
}

export interface ActionContext<A> {
  sendAction(a: A): void
}

export type ComponentActionContext<A> = ActionContext<A> | null

export interface ActionContextual<P, S, A> {
  wrapInContext(componentSpec: ComponentSpec<P, S, A>): ComponentSpec<P, S, A>
  withContext<PP>(WrappedComponent: React.ComponentType<PP & ActionContextProps<A>>): React.FunctionComponent<PP>
}

export function createActionContextual<P, S, A>(): ActionContextual<P, S, A> {
  const context = React.createContext<ComponentActionContext<A>>(null)
  return {
    wrapInContext: withProviderContextWrapper(context.Provider),
    withContext: withConsumerContext(context.Consumer)
  }
}

function withProviderContextWrapper<P, S, A>(ActionContextProvider: React.Provider<ComponentActionContext<A>>):
  (componentSpec: ComponentSpec<P, S, A>) => ComponentSpec<P, S, A> {
  return (componentSpec: ComponentSpec<P, S, A>) => {
    return {
      ...componentSpec,
      render(self) {
        const sendAction = createSendAction(self)
        return (
          <ActionContextProvider value={{ sendAction }}>
            {componentSpec.render(self)}
          </ActionContextProvider>
        )
      }
    }
  }
}

function withConsumerContext<P extends {}, A>(Consumer: React.Consumer<ComponentActionContext<A>>): (WrappedComponent: React.ComponentType<P & ActionContextProps<A>>) => React.FunctionComponent<P> {
  return (WrappedComponent) => {
    return (props: P) => {
      return (
        <Consumer>
          {(actionContext: ComponentActionContext<A>) => {
            if (!actionContext) {
              throw new Error("No action context provided!")
            } else {
              const wrappedProps: P & ActionContextProps<A> = { ...props, actionContext }
              return (<WrappedComponent {...wrappedProps} />)
            }
          }}
        </Consumer>
      )
    }
  }
}

function createSendAction<P, S, A>(self: Self<P, S, A>): (action: A) => void {
  return (action: A) => {
    send(self, action)
  }
}

