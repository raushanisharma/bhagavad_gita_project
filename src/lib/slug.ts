/** "2.47" -> "2-47" (dots in URL segments can be mistaken for file extensions). */
export const verseSlug = (id: string) => id.replace(".", "-");

/** "2-47" -> "2.47" */
export const slugToVerseId = (slug: string) => slug.replace("-", ".");

export const verseHref = (id: string) => `/shlokas/${verseSlug(id)}`;
