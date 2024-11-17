import * as Registry from './registry'
import type { ComponentEvents } from './registry/types'

abstract class Component {
  public abstract name: string

  public abstract init(): Promise<void>

  protected async addEventListener<T extends keyof ComponentEvents>(
    name: T,
    callback: ComponentEvents[T]
  ): Promise<void> {
    return Registry.addEventListener(this, name, callback)
  }

  protected async invokeEvent<T extends keyof ComponentEvents>(
    name: T,
    ...args: Parameters<ComponentEvents[T]>
  ): Promise<void> {
    return Registry.invokeEvent(this, name, ...args)
  }
}

export { Component }
