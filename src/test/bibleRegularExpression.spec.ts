import { assert } from 'chai'
import BibleRegularExpression from '../lib/bible/bibleRegularExpression'

describe('bible regular expression', () => {

  it('match book and chapter', async () => {
    const bibleRegExp = new BibleRegularExpression()
    assert.equal(bibleRegExp.match("2. Mose 6")?.book, "2. Mose")
    assert.equal(bibleRegExp.match("2. Mose 6")?.chapter, "6")
  })


  it('match book and chapter to chapter', async () => {
    const bibleRegExp = new BibleRegularExpression()
    let regularExpResult = bibleRegExp.match("2. Mose 6-7")
    assert.equal(regularExpResult?.book, "2. Mose")
    assert.equal(regularExpResult?.chapter, "6")
    assert.equal(regularExpResult?.toChapterOrVerse, "7")
    regularExpResult = bibleRegExp.match("2. Mose 6 - 7")
    assert.equal(regularExpResult?.book, "2. Mose")
    assert.equal(regularExpResult?.chapter, "6")
    assert.equal(regularExpResult?.toChapterOrVerse, "7")
    regularExpResult = bibleRegExp.match("2. Samuel 2 - 3")
    assert.equal(regularExpResult?.book, "2. Samuel")
    assert.equal(regularExpResult?.chapter, "2")
    assert.equal(regularExpResult?.toChapterOrVerse, "3")
  })
  
  it('match book and chapter and verse', async () => {
    const bibleRegExp = new BibleRegularExpression()
    const regularExpResult = bibleRegExp.match("Josua 5,52")
    assert.equal(regularExpResult?.book, "Josua")
    assert.equal(regularExpResult?.chapter, "5")
    assert.equal(regularExpResult?.verse, "52")

  })
  
  it('match book and chapter and verse to verse', async () => {
    const bibleRegExp = new BibleRegularExpression()
    let regularExpResult = bibleRegExp.match("Maleachi 4,1-10")
    assert.equal(regularExpResult?.book, "Maleachi")
    assert.equal(regularExpResult?.chapter, "4")
    assert.equal(regularExpResult?.verse, "1")
    assert.equal(regularExpResult?.toChapterOrVerse, "10")
    regularExpResult = bibleRegExp.match("Matthäus 3,1 - 10")
    assert.equal(regularExpResult?.book, "Matthäus")
    assert.equal(regularExpResult?.chapter, "3")
    assert.equal(regularExpResult?.verse, "1")
    assert.equal(regularExpResult?.toChapterOrVerse, "10")

  })

  it('match book and chapter and verse to chapter and verse', async () => {
    const bibleRegExp = new BibleRegularExpression()
    const regularExpResult = bibleRegExp.match("Johannes 5,1-6,10")
    assert.equal(regularExpResult?.book, "Johannes")
    assert.equal(regularExpResult?.chapter, "5")
    assert.equal(regularExpResult?.verse, "1")
    assert.equal(regularExpResult?.toChapterOrVerse, "6")
    assert.equal(regularExpResult?.toVerse, "10")

  })

})