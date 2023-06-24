import { assert } from 'chai'
import EventEmit from '../index'

describe('Event Emitter', () => {
  let called = false

  it('register and trigger Event', async () => {
    called = false
    const emitter = EventEmit.getEmitter()
    emitter.registerEvent('event')
    emitter.on('event', () => (called = true))
    await emitter.trigger('event', { __message: 'Test Event' })
    assert.equal(called, true)
  })
  it('listener for "__all" event', async () => {
    called = false
    const emitter = EventEmit.getEmitter()
    emitter.on('__all', () => (called = true))
    await emitter.trigger('event', { __message: 'Test Event' })
    assert.equal(called, true)
  })
  it('listener for "__log" event', async () => {
    called = false
    const emitter = EventEmit.getEmitter()
    emitter.on('__log', param => {
      if (
        param.get('__message') == 'Test Error' &&
        param.get('__logLevel') == 'error'
      ) {
        called = true
      }
    })
    await emitter.trigger('error', {
      __message: 'Test Error',
      __logLevel: 'error',
    })
    assert.equal(called, true)
  })
})
