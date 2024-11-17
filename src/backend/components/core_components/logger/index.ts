import { appendFile, writeFile } from 'fs/promises'
import { join } from 'path'

import { Component } from '../../component'
import { logBasePath } from '../../registry/paths'

declare module 'backend/components/registry/types' {
  interface ComponentEvents {
    'logger:logInfo': (...message: string[]) => void
  }
}

const logPath = join(logBasePath, 'logger-component.log')

export default class LoggerComponent extends Component {
  name = 'Logger'

  async init() {
    await writeFile(logPath, '')

    await this.addEventListener('logger:logInfo', async (...message) => {
      await appendFile(logPath, `${message.join(', ')}\n`)
    })

    await this.invokeEvent(
      'logger:logInfo',
      'This is an example of a component invoking an event. It is not that' +
        'groundbreaking (as only this one component exists right now), but you' +
        'can already notice that both the `addEventListener` and this method' +
        'are type-safe and use a single source of truth (the module' +
        'augmentation declared above). Splitting this into two different' +
        'components would now be trivial: Simply create another component' +
        'class, move the `invokeEvent` call into its initializer method, and' +
        'make sure to register the new component *after* the one adding the' +
        'event handler'
    )
  }
}
