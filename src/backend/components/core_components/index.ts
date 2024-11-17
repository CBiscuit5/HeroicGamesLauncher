import * as Registry from '../registry'
import LoggerComponent from './logger'

async function registerCoreComponents() {
  await Registry.registerComponent(new LoggerComponent())
}

export { registerCoreComponents }
