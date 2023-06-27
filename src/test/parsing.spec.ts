import { assert } from 'chai'
import { parseToNumber, parseToObject, parseToString } from '../lib/parsing'

describe('parsing', () => {
  it('parse string', async () => {
    const val = 'Test'
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToString(anyValue)
    if (parsedValue) assert.equal(parsedValue, val)
    else assert.fail('Value undefined')
  })

  it('parse string undefined', async () => {
    const val = 100
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToString(anyValue)
    assert.isUndefined(parsedValue)
  })

  it('parse number', async () => {
    const val = 100
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToNumber(anyValue)
    if (parsedValue) assert.equal(parsedValue, val)
    else assert.fail('Value undefined')
  })

  it('parse number undefined', async () => {
    const val = 'string'
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToNumber(anyValue)
    assert.isUndefined(parsedValue)
  })

  it('parse object', async () => {
    const val = { prop: 'value' }
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToObject(anyValue)
    if (parsedValue) assert.equal(parsedValue, val)
    else assert.fail('Value undefined')
  })

  it('parse object null', async () => {
    const val = 'string'
    let anyValue: unknown
    // eslint-disable-next-line prefer-const
    anyValue = val

    const parsedValue = parseToObject(anyValue)
    assert.isNull(parsedValue)
  })
})
