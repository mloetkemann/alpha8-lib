type EventListenerFunc = (param: EventParameter) => void
export class EventParameter extends Map<string, unknown> {
  getString(key: string): string | undefined {
    const value = this.get(key)
    if (value && typeof value == 'string') return value
    return
  }

  getObject(key: string): object | undefined {
    const value = this.get(key)
    if (value && typeof value == 'object') return value
    return
  }
}

export default class EventEmit {
  private events = new Map<string, Array<EventListenerFunc>>()
  private static inst: EventEmit

  public static getEmitter() {
    if (!EventEmit.inst) EventEmit.inst = new EventEmit()
    return EventEmit.inst
  }

  private constructor() {
    this.registerEvent('__all') // Event which is triggered if any other event is triggerd
    this.registerEvent('__log') // Log Event which is triggered if any other event is triggerd
  }

  public registerEvents(events: Array<string>) {
    events.forEach(event => this.registerEvent(event))
  }

  public registerEvent(event: string) {
    if (!this.events.has(event)) {
      this.events.set(event, new Array<EventListenerFunc>())
    } else {
      throw Error(`Event ${event} already registered`)
    }
  }

  on(event: string, listener: EventListenerFunc) {
    if (!this.events.has(event)) {
      throw Error(`Event ${event} not registered`)
    }
    this.events.get(event)?.push(listener)
  }

  async trigger(event: string, parameter?: object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parameterEntries = new Array<[string, any]>()
    if (parameter) {
      parameterEntries = Object.entries(parameter)
    }

    const param = new EventParameter(parameterEntries)

    this.triggerEvent('__all', param)

    await this.triggerEvent(event, param)

    this.addParameter(param, '__message', `Event ${event} triggered`)
    this.addParameter(param, '__logLevel', `info`)

    this.triggerEvent('__log', param)
  }

  private addParameter(param: EventParameter, key: string, value: unknown) {
    const paramValue = param.get(key)
    if (!paramValue) {
      param.set(key, value)
    }
  }

  private async triggerEvent(event: string, param: EventParameter) {
    const eventListener = this.events.get(event)
    if (eventListener) {
      eventListener.forEach(listener => listener(param))
    }
  }
}

EventEmit.getEmitter()
