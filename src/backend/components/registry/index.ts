import { appendFile, mkdir, writeFile } from 'fs/promises'

import { componentLogFilePath, logBasePath } from './paths'

import type { Component } from '../component'
import type { ComponentEvents } from './types'

type EventListenerList = Partial<{
  [eventName in keyof ComponentEvents]: [
    Component,
    ComponentEvents[eventName]
  ][]
}>

const components: Component[] = []
const eventListeners: EventListenerList = {}

async function init() {
  await initComponentLog()
}

async function initComponentLog() {
  await mkdir(logBasePath, { recursive: true })
  await writeFile(componentLogFilePath, '')
  await logComponentMessage('Component Registry', 'Initialized')
}

type ComponentMessageSeverity =
  | 'DEBUG'
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
const longestSeverityStrLength = 'CRITICAL'.length
async function logComponentMessage(
  componentName: string,
  message: string,
  severity: ComponentMessageSeverity = 'INFO'
) {
  // FIXME: 24 is an arbitrary value, but there's not really a good way to
  //        estimate one since we don't necessarily know which components
  //        we have when this function is called
  const namePortion = `[${componentName}]`.padEnd(24)
  const severityPortion = `[${severity}]`.padEnd(longestSeverityStrLength + 2)
  const fullMessage = `[${new Date().toISOString()}] ${severityPortion} ${namePortion} ${message}\n`
  await appendFile(componentLogFilePath, fullMessage)
}

async function registerComponent(component: Component) {
  components.push(component)
  return Promise.all([
    logComponentMessage(
      'Component Registry',
      `Initializing component ${component.name}`
    ),
    component
      .init()
      .then(() =>
        logComponentMessage(
          'Component Registry',
          `Initialized component ${component.name}`
        )
      )
  ])
}

async function addEventListener<T extends keyof ComponentEvents>(
  component: Component,
  eventName: T,
  callback: ComponentEvents[T]
): Promise<void> {
  await logComponentMessage(
    component.name,
    `Registering event callback for ${eventName}`,
    'DEBUG'
  )
  eventListeners[eventName] ||= []
  eventListeners[eventName]!.push([component, callback])
}

async function invokeEvent<T extends keyof ComponentEvents>(
  component: Component,
  eventName: T,
  ...args: Parameters<ComponentEvents[T]>
): Promise<void> {
  const listeners = eventListeners[eventName]
  if (!listeners) {
    await logComponentMessage(
      component.name,
      `Invoked ${eventName}, but no listeners were registered`,
      'WARNING'
    )
    return
  }

  await Promise.all(
    listeners.map(async ([listenerComponent, listener]) => {
      await logComponentMessage(
        component.name,
        `Invoking callback for event ${eventName} on ${
          listenerComponent.name
        } with (${args.join(', ')})`,
        'DEBUG'
      )
      listener(...args)
    })
  )
}

export { init, registerComponent, addEventListener, invokeEvent }
