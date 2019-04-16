import * as React from "react"
import { ComponentSpec, send, Self, ReducerComponent, providerReducerComponent } from "./reducer-component"

export interface ActionContextualComponentProps<A> {
  actionContext: ActionContext<A>
}

export interface ActionContext<A> {
  sendAction(a: A): void
}

export type ComponentActionContext<A> = ActionContext<A> | null

export interface ActionContextual<P, S, A> {
  reducerComponent(displayName: string): ReducerComponent<P, S, A>
  withContext<PP>(WrappedComponent: React.ComponentType<PP & ActionContextualComponentProps<A>>): React.FunctionComponent<PP>
}

export function createActionContextual<P, S, A>(): ActionContextual<P, S, A> {
  const context = React.createContext<ComponentActionContext<A>>(null)
  return {
    reducerComponent: createReducerComponentFn(context.Provider),
    withContext: withConsumerContext(context.Consumer)
  }
}

function createReducerComponentFn<P, S, A>(provider: React.Provider<ComponentActionContext<A>>): (displayName: string) => ReducerComponent<P,S,A> {
  return displayName => {
    return providerReducerComponent(displayName, provider, self => ({ sendAction: createSendAction(self) }))
  }
}

function withConsumerContext<P extends {}, A>(Consumer: React.Consumer<ComponentActionContext<A>>): (WrappedComponent: React.ComponentType<P & ActionContextualComponentProps<A>>) => React.FunctionComponent<P> {
  return (WrappedComponent) => {
    return (props: P) => {
      return (
        <Consumer>
          {(actionContext: ComponentActionContext<A>) => {
            if (!actionContext) {
              throw new Error("No action context provided!")
            } else {
              const wrappedProps: P & ActionContextualComponentProps<A> = { ...props, actionContext }
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

