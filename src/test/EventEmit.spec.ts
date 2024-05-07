import { assert } from 'chai'
import EventEmit from '../lib/eventEmit.js'

describe('Event Emitter', () => {
  let called = false

  it('register and trigger Event', async () => {
    called = false
    const emitter = await EventEmit.getEmitter()
    await emitter.registerEvent('event')
    emitter.on('event', async () => { called = true } )
    await emitter.trigger('event', { __message: 'Test Event' })
    assert.equal(called, true)
  })
  it('listener for "__all" event', async () => {
    called = false
    const emitter = await EventEmit.getEmitter()
    await emitter.registerEvent('__all')
    emitter.on('__all', async  () => { called = true })
    await emitter.trigger('event', { __message: 'Test Event' })
    assert.equal(called, true)
  })
  it('listener for "__log" event', async () => {
    called = false
    const emitter = await EventEmit.getEmitter()
    await emitter.registerEvent('__log')
    emitter.on('__log', async  param => {
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
