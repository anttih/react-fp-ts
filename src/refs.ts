
export class Ref<A> {
  private value: A | null
  private constructor() {
    this.value = null
  }

  static create<A>(): Ref<A> {
    return new Ref()
  }

  modify = (fn: (a: A) => A): void => {
    if (this.value !== null) {
      this.value = fn(this.value)
    }
  }

  write = (a: A | null): void => {
    this.value = a
  }

  isEmpty = (): boolean => {
    if (this.value === null) {
      return true
    } else {
      return false
    }
  }
  withRef = (fn: (a: A) => void): void => {
    if (this.value !== null) {
      fn(this.value)
    }
  }
}
