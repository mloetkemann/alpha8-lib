import { assert } from 'chai'
import Bible, { BiblePassage } from '../lib/bible/bible'

describe('bible', () => {
  it('get book by id', async () => {
    const bible = new Bible('de', 'de_slt')

    assert.equal(bible.getBook(3).getName(), '4. Mose')
    assert.equal(bible.getBook(5).getName(), 'Josua')
    assert.equal(bible.getBook(65).getName(), 'Offenbarung')
  })

  it('find book', async () => {
    const bible = new Bible('de', 'de_slt')
    assert.equal(bible.findBook('ex')?.getName(), '2. Mose')
    assert.equal(bible.findBook('3. Mose')?.getName(), '3. Mose')
    assert.equal(bible.findBook('off')?.getName(), 'Offenbarung')
  })

  it('format passage', async () => {
    const bible = new Bible('de', 'de_slt')
    assert.equal(
      new BiblePassage(bible, bible.getBook(5), 1, 1, 2, 5).toString(),
      'Josua 1, 1 - 2, 5'
    )
  })

  it('map to json', async () => {
    const bible = new Bible('de', 'de_slt')
    assert.equal(
      bible.parse('2. Mose 3, 1').toJson(),
      '{"book":1,"chapter":3,"verse":1,"toVerse":null,"language":"de","translation":"de_slt"}'
    )
  })

  it('json map to obj', async () => {
    const value =
      '{"book":1,"chapter":3,"verse":1,"toVerse":null,"language":"de","translation":"de_slt"}'
    assert.equal(BiblePassage.convertToObject(value).toString(), '2. Mose 3, 1')
  })

  const assertBibleParser = (passage: string) => {
    const bible = new Bible('de', 'de_slt')
    assert.equal(bible.parse(passage).toString(), passage)
  }

  const assertParserFailed = (passage: string) => {
    const bible = new Bible('de', 'de_slt')
    try {
      assert.equal(bible.parse(passage).toString(), passage)
      assert.fail('No exception')
    } catch (e) {
      /* empty */
    }
  }

  it('parsing passage verse', async () => {
    assertBibleParser('2. Mose 2, 3')
    assertBibleParser('Josua 4, 3')
  })
  it('parsing passage wrong verse', async () => {
    assertParserFailed('2. Mose 2, 300')
    assertParserFailed('Josua 4, 9000')
    assertParserFailed('Josua 4, 1 - 9000')
  })

  it('parsing passage wrong chapter', async () => {
    assertParserFailed('2. Mose 200, 3')
    assertParserFailed('Josua 400, 2')
    assertParserFailed('Josua 4 - 50')
  })

  it('parsing passage chapter to chapter', async () => {
    assertBibleParser('2. Samuel 2 - 3')
  })

  it('parsing passage chapter only', async () => {
    assertBibleParser('Psalm 23')
  })

  it('parsing passage chapter, verse to verse', async () => {
    assertBibleParser('Matthäus 3, 1 - 10')
  })
})
