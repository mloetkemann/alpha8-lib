import BibleRegularExpression from './bibleRegularExpression'

const dataPath = '../../data/'

function readFileAsync(filename: string): Promise<any> {
  const filePpath = `${dataPath}${filename}`
  return import(filePpath, { assert: { type: 'json' } }).then(
    mod => mod.default
  )

}

interface translationPath {
  id: number
  chapters: { id: number; verses: number }[]
}

interface BiblePassageRaw {
  book: number
  chapter: number
  verse?: number
  toChapter?: number
  toVerse?: number
  translation: string
  language: string
}

interface BookName {
  id: number
  abbrev: string[]
  name: string
}

export class Book {
  constructor(
    private id: number,
    private language: string,
    private name: string,
    private abbrev: string[]
  ) {}

  getName(): string {
    return this.name
  }

  getId(): number {
    return this.id
  }

  getLanguage(): string {
    return this.language
  }

  getabbrev(): string[] {
    return this.abbrev
  }
}

class TranslationDataProvider {
  private translationData!: translationPath[]
  private static instances = new Map<string, TranslationDataProvider>()

  private constructor(private language: string, private translation: string) {}

  private async init() {
    const filename = `translation_${this.translation}.json`
    return readFileAsync(filename).then(
      content => (this.translationData = content)
    )

  }

  public static async getDataProvider(
    language: string,
    translation: string
  ): Promise<TranslationDataProvider> {
    let result = TranslationDataProvider.instances.get(translation)
    if (!result) {
      result = new TranslationDataProvider(language, translation)
      await result.init()
      TranslationDataProvider.instances.set(translation, result)
    }
    return result
  }

  getChapters(book: number): number {
    try {
      return this.translationData[book].chapters.length
    } catch (e) {
      throw Error('Chapter not found')
    }
  }

  getVerses(book: number, chapter: number): number {
    try {
      return this.translationData[book].chapters[chapter].verses
    } catch (e) {
      throw Error('Verses not found')
    }
  }
}

class BookNamesDataProvider {
  private static instances = new Map<string, BookNamesDataProvider>()
  private books!: BookName[]
  private bookIndex = new Map<string, number>()

  private constructor(private language: string) {}

  private async init() {
    const filename = `books_${this.language}.json`
    readFileAsync(filename).then(content => {
      this.books = content
      this.buildBookIndex()
    })
  }

  private buildBookIndex() {
    this.books.forEach(b => {
      this.bookIndex.set(b.name, b.id)
      b.abbrev.forEach(a => {
        this.bookIndex.set(a, b.id)
      })
    })
  }

  public static async getDataProvider(
    language: string
  ): Promise<BookNamesDataProvider> {
    let result = BookNamesDataProvider.instances.get(language)
    if (!result) {
      result = new BookNamesDataProvider(language)
      await result.init()
      BookNamesDataProvider.instances.set(language, result)
    }
    return result
  }

  getBooks(): BookName[] {
    return this.books
  }

  getBook(id: number): BookName {
    const book = this.books.find(b => b.id == id)
    if (!book) {
      throw Error('Book not found')
    }
    return book
  }

  findBook(val: string): BookName | undefined {
    const id = this.bookIndex.get(val)
    if (id) {
      return this.getBook(id)
    }
  }
}

export default class Bible {
  private bookDataProvider!: BookNamesDataProvider
  private translationDataProvider!: TranslationDataProvider
  providerLoadedPromise: Promise<
    [BookNamesDataProvider, TranslationDataProvider]
  >

  constructor(private language: string, private translation: string) {
    this.providerLoadedPromise = Promise.all([
      BookNamesDataProvider.getDataProvider(language).then(
        bookDataProvider => (this.bookDataProvider = bookDataProvider)
      ),
      TranslationDataProvider.getDataProvider(language, translation).then(
        translationDataProvider =>
          (this.translationDataProvider = translationDataProvider)
      ),
    ])
  }

  public async providerLoaded(): Promise<
    [BookNamesDataProvider, TranslationDataProvider]
  > {
    return this.providerLoadedPromise
  }

  private getBookDataProvider(): BookNamesDataProvider {
    if (!this.bookDataProvider) {
      throw Error('Provider not loaded')
    }
    return this.bookDataProvider
  }

  getBook(id: number): Book {
    return this.mapToBookObj(this.getBookDataProvider().getBook(id))
  }

  findBook(val: string): Book | undefined {
    const book = this.getBookDataProvider().findBook(val)
    if (book) {
      return this.mapToBookObj(book)
    }
    return
  }

  checkChapter(book: number, chapter: number) {
    if (chapter > this.translationDataProvider.getChapters(book) || chapter < 0)
      throw new Error(`Chapter ${chapter} (book ID: ${book})not found`)
  }

  checkVerse(book: number, chapter: number, verse: number) {
    if (
      verse > this.translationDataProvider.getVerses(book, chapter) ||
      verse < 0
    )
      throw new Error(
        `Verse ${verse} (book ID: ${book}, chapter: ${chapter}) not found`
      )
  }

  getTranslation(): string {
    return this.translation
  }

  getLanguage(): string {
    return this.language
  }

  private mapToBookObj(book: BookName): Book {
    return new Book(book.id, this.language, book.name, book.abbrev)
  }

  parse(value: string): BiblePassage {
    const parser = new BibleParser(value, this)
    return parser.getPassage()
  }
}

export class BiblePassage {
  private book: Book
  constructor(
    private bible: Bible,
    private _book: Book | number,
    private chapter: number,
    private verse?: number,
    private toChapter?: number,
    private toVerse?: number
  ) {
    const book = typeof _book === 'number' ? bible.getBook(_book) : _book
    if (!book) throw new Error(`Could not find book ${_book}`)
    this.book = book

    bible.checkChapter(this.book.getId(), this.chapter)
    if (this.toChapter) {
      bible.checkChapter(this.book.getId(), this.toChapter)
      if (this.toVerse)
        bible.checkVerse(this.book.getId(), this.toChapter, this.toVerse)
    } else {
      if (this.toVerse)
        bible.checkVerse(this.book.getId(), this.chapter, this.toVerse)
    }

    if (this.verse)
      bible.checkVerse(this.book.getId(), this.chapter, this.verse)
  }

  toString(): string {
    if (this.toChapter && this.toVerse) {
      return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${
        this.toChapter
      }, ${this.toVerse}`
    } else if (!this.toChapter && this.verse && this.toVerse) {
      return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${
        this.toVerse
      }`
    } else if (this.toChapter && !this.verse && !this.toVerse) {
      return `${this.book.getName()} ${this.chapter} - ${this.toChapter}`
    } else if (!this.toChapter && !this.verse && !this.toVerse) {
      return `${this.book.getName()} ${this.chapter}`
    } else if (!this.toChapter && this.verse && !this.toVerse) {
      return `${this.book.getName()} ${this.chapter}, ${this.verse}`
    }
    return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${
      this.toChapter
    }, ${this.toVerse}`
  }

  toRaw(): BiblePassageRaw {
    return {
      book: this.book.getId(),
      chapter: this.chapter,
      verse: this.verse,
      toChapter: this.toChapter,
      toVerse: this.toVerse,
      language: this.bible.getLanguage(),
      translation: this.bible.getTranslation(),
    }
  }

  toJson(): string {
    return JSON.stringify(this.toRaw())
  }

  static async convertToObject(
    value: BiblePassageRaw | string
  ): Promise<BiblePassage> {
    if (typeof value === 'string') {
      return BiblePassage.convertToObject(JSON.parse(value))
    }
    const bible = new Bible(value.language, value.translation)
    await bible.providerLoaded()
    return new BiblePassage(
      bible,
      value.book,
      value.chapter,
      value.verse,
      value.toChapter,
      value.toVerse
    )
  }
}

class BibleParser {
  constructor(private value: string, private bible: Bible) {}

  getPassage(): BiblePassage {
    const regularExpResult = new BibleRegularExpression().match(this.value)
    if (regularExpResult) {
      if (regularExpResult.book) {
        const book = this.bible.findBook(regularExpResult.book)
        if (!book) {
          throw Error(`Could not find book ${regularExpResult.book}`)
        }
        if (regularExpResult.verse && !regularExpResult.toVerse) {
          return new BiblePassage(
            this.bible,
            book,
            parseInt(regularExpResult.chapter),
            parseInt(regularExpResult.verse),
            undefined,
            parseInt(regularExpResult.toChapterOrVerse)
          )
        } else {
          return new BiblePassage(
            this.bible,
            book,
            parseInt(regularExpResult.chapter),
            parseInt(regularExpResult.verse),
            parseInt(regularExpResult.toChapterOrVerse),
            parseInt(regularExpResult.toVerse)
          )
        }
      }
    }
    throw Error(`Could not find book`)
  }
}
