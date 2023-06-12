import fs from 'fs'
import BibleRegularExpression from './bibleRegularExpression';

interface BookName {
    id: number;
    abbrev: string[];
    name: string;
}

interface ChapterMeta{
    id: number, 
    verses: number[]
}
interface BookMeta {
    id: number;
    chapters: ChapterMeta[];

}

class Book {

    constructor(private id: number, private language: string, private name: string, private abbrev: string[]) {

    }

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

class BookNamesDataProvider {
    
    private static instances = new Map<string, BookNamesDataProvider>()
    private books!: BookName[]; 
    private bookIndex = new Map<string, number>();

    private constructor(private language: string) {

    }

    private init() {
        this.books = JSON.parse(fs.readFileSync(`data/books_${this.language}.json`, 'utf-8'))
        this.buildBookIndex();
    }

    private buildBookIndex() {
        this.books.forEach(b => {
            this.bookIndex.set(b.name, b.id)
            b.abbrev.forEach(a => {
                this.bookIndex.set(a, b.id)
            })
        })
    }

    public static getDataProvider(language: string) : BookNamesDataProvider {
        let result = BookNamesDataProvider.instances.get(language)
        if(!result) {
            result = new BookNamesDataProvider(language)
            result.init()
        }
        return result
    }

    getBooks(): BookName[] {
        return this.books;
    }

    getBook(id: number) : BookName {
        const book = this.books.find(b => b.id == id)
        if(!book) {
            throw Error('Book not found')
        }
        return book

    }

    findBook(val: string): BookName  | undefined {
        const id = this.bookIndex.get(val)
        if(id) {
            return this.getBook(id)
        }
    }
}

export default class Bible {

    private bookDataProvider: BookNamesDataProvider | undefined


    constructor(private language: string, private translation: string) {
        this.bookDataProvider = BookNamesDataProvider.getDataProvider(language)
    }

    private getBookDataProvider(): BookNamesDataProvider {
        if(!this.bookDataProvider) {
            throw Error('Provider not loaded')
        }
        return this.bookDataProvider
    }

    getBook(id: number): Book {
        return this.mapToBookObj(this.getBookDataProvider().getBook(id))
    }

    findBook(val: string): Book | undefined{
        const book = this.getBookDataProvider().findBook(val)
        if(book) {
            return this.mapToBookObj(book)
        }
        return
    }

    private mapToBookObj(book: BookName): Book {
        return new Book(book.id, this.language, book.name, book.abbrev)
    }

}

export class BiblePassage {

    constructor(private book: Book, private chapter: number, private verse?: number, private toChapter?: number, private toVerse?: number) {

    }

    toString(): string {
        if(this.toChapter && this.toVerse) {
            return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${this.toChapter}, ${this.toVerse}`
        }else if(!this.toChapter && this.verse && this.toVerse) {
            return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${this.toVerse}`
        }else if(this.toChapter && !this.verse && !this.toVerse) {
            return `${this.book.getName()} ${this.chapter} - ${this.toChapter}`
        }else if(!this.toChapter && !this.verse && !this.toVerse) {
            return `${this.book.getName()} ${this.chapter}`
        }else if(!this.toChapter && this.verse && !this.toVerse) {
            return `${this.book.getName()} ${this.chapter}, ${this.verse}`
        }
        return `${this.book.getName()} ${this.chapter}, ${this.verse} - ${this.toChapter}, ${this.toVerse}`
    }
}

export class BibleParser {

    constructor(private value: string, private bible: Bible) {

    }

    getPassage(): BiblePassage {
        const regularExpResult = new BibleRegularExpression().match(this.value)
        if(regularExpResult) {
            if(regularExpResult.book) {
                const book = this.bible.findBook(regularExpResult.book)
                if(!book) {
                    throw Error(`Could not find book ${regularExpResult.book}`)
                }
                if(regularExpResult.verse && !regularExpResult.toVerse) {
                return new BiblePassage(
                    book,
                    parseInt(regularExpResult.chapter),
                    parseInt(regularExpResult.verse),
                    undefined,
                    parseInt(regularExpResult.toChapterOrVerse)
                )
                }else {
                    return new BiblePassage(
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