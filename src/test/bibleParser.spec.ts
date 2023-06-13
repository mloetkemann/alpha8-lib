import { assert } from 'chai'
import Bible, {BibleParser, BiblePassage} from '../lib/bible/bible'

describe('bible', () => {

  it('get book by id', async () => {
    const bible = new Bible("de", "de_slt")

    assert.equal(bible.getBook(3).getName(), "4. Mose")
    assert.equal(bible.getBook(5).getName(), "Josua")
    assert.equal(bible.getBook(65).getName(), "Offenbarung")
  })

  it('find book',async () => {
    const bible = new Bible("de", "de_slt")
    assert.equal(bible.findBook("ex")?.getName(), "2. Mose")
    assert.equal(bible.findBook("3. Mose")?.getName(), "3. Mose")
    assert.equal(bible.findBook("off")?.getName(), "Offenbarung")
  })

  it('format passage', async () => {
    
    const bible = new Bible("de", "de_slt")
    assert.equal(new BiblePassage(
      bible.getBook(5),
      1,
      1,
      2,
      5
    ).toString(),
    "Josua 1, 1 - 2, 5"
    )
  })

  const assertBibleParser = (passage: string) => {

    const bible = new Bible("de", "de_slt")
    const bibleParser = new BibleParser(passage, bible)
    assert.equal(bibleParser.getPassage().toString(), passage)
  }

  it('parsing passage verse', async () => {
    assertBibleParser("2. Mose 2, 3")
    assertBibleParser("Josua 4, 3")
  })

  it('parsing passage chapter to chapter', async () => {
    assertBibleParser("2. Samuel 2 - 3")
  })

  it('parsing passage chapter only', async () => {
    assertBibleParser("Psalm 23")
  })

  it('parsing passage chapter, verse to verse', async () => {
    assertBibleParser("Matthäus 3, 1 - 10")
  })


})
