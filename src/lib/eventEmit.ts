import amqp from 'amqplib'
import 'dotenv/config'

const ENV_EVENTEMITTER_DRIVER = 'npm_package_alpha8Config_eventDriver'

export type EventListenerFunc = (param: EventParameter) => void
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

  public static async getEmitter(): Promise<EventEmit> {
    const driver = process.env[ENV_EVENTEMITTER_DRIVER]
    if (!EventEmit.inst) {
      if (driver === 'rabbitmq') {
        EventEmit.inst = new RabbitMQEventEmitter()
      } else {
        EventEmit.inst = new EventEmit()
      }

      await EventEmit.inst.init()
    }
    return EventEmit.inst
  }

  protected async init() {
    //await this.registerEvent('__all') // Event which is triggered if any other event is triggerd
    //await this.registerEvent('__log') // Log Event which is triggered if any other event is triggerd
  }

  public async registerEvents(events: Array<string>) {
    return Promise.all(events.map(event => this.registerEvent(event)))
  }

  public async registerEvent(event: string) {
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
    this.triggerEvent('__all', parameter)

    await this.triggerEvent(event, parameter)

    this.triggerEvent('__log', {
      __message: `Event ${event} triggered`,
      __loglevel: 'info',
    })
  }

  private addParameter(param: EventParameter, key: string, value: unknown) {
    const paramValue = param.get(key)
    if (!paramValue) {
      param.set(key, value)
    }
  }

  protected triggerEvent(event: string, parameter?: object) {
    this.notify(event, parameter)
  }

  protected async notify(event: string, parameter?: object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parameterEntries = new Array<[string, any]>()
    if (parameter) {
      parameterEntries = Object.entries(parameter)
    }
    const param = new EventParameter(parameterEntries)
    const eventListener = this.events.get(event)
    if (eventListener) {
      eventListener.forEach(listener => listener(param))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async close() {}
}

class RabbitMQEventEmitter extends EventEmit {
  private channel: amqp.Channel | undefined
  private connection: amqp.Connection | undefined
  async connectQueue(): Promise<[amqp.Connection, amqp.Channel] | undefined> {
    try {
      const connection = await amqp.connect('amqp://192.168.99.100:5672')
      const channel = await connection.createChannel()
      return [connection, channel]
    } catch (error) {
      console.log(error)
    }
  }
  constructor() {
    super()
  }

  protected async init() {
    await super.init()
    return this.connectQueue().then(res => {
      if (res) {
        this.connection = res[0]
        this.channel = res[1]

        process.on('SIGINT', function () {
          res[1].close()
          res[0].close()
          process.exit()
        })
      }
    })
  }
  public async registerEvent(event: string) {
    await super.registerEvent(event)
    await this.channel?.assertQueue(event, { durable: false })
    await this.channel?.consume(
      event,
      msg => {
        if (msg) {
          const content = Buffer.from(msg.content).toString()
          this.notify(event, JSON.parse(content))
        }
      },
      {
        noAck: true,
      }
    )
  }
  protected triggerEvent(event: string, parameter?: object | undefined): void {
    this.sendData(event, parameter)
  }

  async sendData(event: string, data?: object) {
    await this.channel?.assertQueue(event, { durable: false })
    await this.channel?.sendToQueue(event, Buffer.from(JSON.stringify(data)))
  }

  public async close() {
    await this.channel?.close()
    await this.connection?.close()

    console.log('Closed')
  }
}
