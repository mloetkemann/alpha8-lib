export default class BibleRegularExpression {
  match(
    val: string
  ):
    | {
        book: string
        chapter: string
        verse: string
        toChapterOrVerse: string
        toVerse: string
      }
    | undefined {
    //const regExpTestBook = /(?<book>(\d. )?[a-zA-Züöäß ]*)[. ]?(((?<chapter>\d{1,3})[,:][. ]?(?<verse>\d{1,3}))|((?<chapterOnly>\d{1,3})(\s?-\s?(?<chapterTo>\d{1,3}))?))/i
    const regExpTestBook =
      /(?<book>(\d. )?[a-zA-Züöäß]*)[. ]?((?<chapter>\d{1,3})([,:][. ]?(?<verse>\d{1,3}))?((\s?-\s?)(?<toChapterOrVerse>\d{1,3})?([,:][. ]?(?<toVerse>\d{1,3}))?)?)/i
    //const regExpTestBook = /\d*$/i
    const groups = val.match(regExpTestBook)?.groups
    if (groups) {
      return {
        book: groups.book,
        chapter: groups.chapter,
        verse: groups.verse,
        toChapterOrVerse: groups.toChapterOrVerse,
        toVerse: groups.toVerse,
      }
    }
    return
  }
}
