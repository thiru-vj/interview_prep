# Cheatsheet seed data source files

Each `scripts/seed-data-cheatsheets/<technology-slug>/<category-slug>.json` file is a plain JSON array of cheatsheet item objects for that technology + category. `<category-slug>` must match an existing row in the `cheatsheet_categories` table for that technology (see `supabase/seed-cheatsheets.sql`).

Run `node scripts/generate-cheatsheet-seed.mjs` after editing any of these files to regenerate `supabase/seed-cheatsheets-items.sql`.

## Schema

```jsonc
{
  // The method/tag/concept name, exactly as it should appear in "Normal" mode.
  // Include parentheses for methods (e.g. "map()"), keep tags lowercase with
  // angle brackets (e.g. "<section>"), and keep concepts as short noun phrases
  // (e.g. "Closures").
  "name": "map()",

  // Optional. A short syntax line, shown as inline code in both modes. null if not applicable
  // (e.g. a conceptual entry like "Closures" may not need one).
  "syntax": "array.map(callback(item, index, array), thisArg)",

  // 1-3 sentences. What it does / what it is. Shown only in "Explanation" mode.
  "description": "Creates a new array by calling a function on every element of the original array, without mutating it.",

  // Optional. A short plain-language description of parameters/arguments. null if not applicable.
  "parameters": "callback — function invoked per element. thisArg — optional value to use as `this`.",

  // Optional. What the method/expression evaluates to. null if not applicable (e.g. HTML tags, CSS properties).
  "returns": "A new array with each element being the result of the callback.",

  // Optional. A short, runnable/illustrative code example. null if not needed.
  "example": "[1, 2, 3].map(x => x * 2); // [2, 4, 6]",

  // Required whenever "example" is set. One of: java | javascript | typescript | jsx | tsx | sql | html | css
  "codeLanguage": "javascript",

  // Optional. A short gotcha/tip worth calling out. null if not needed.
  "notes": "map() always returns a new array of the same length — use filter() first if you want to drop elements.",

  // Non-empty array of lowercase-kebab tags. Always include the technology slug as one tag.
  "tags": ["javascript", "array", "iteration"]
}
```

## Content rules

- **Real, commonly-used entries only.** Every entry should be something a developer would actually look up or be asked about — no filler, no obscure/deprecated APIs unless explicitly requested for a category (e.g. "all important HTML tags").
- **No duplicates** — within a file, across files in the same technology, or against existing entries already in `supabase/seed-cheatsheets-items.sql`.
- **Concise descriptions.** 1-3 sentences — this is a quick-reference, not a tutorial.
- **Vary coverage within a category.** Don't cluster near-identical entries; cover the real breadth implied by the category name.
- **`syntax`/`parameters`/`returns`/`example`/`notes` are all optional** — only include what's genuinely useful for that entry. A conceptual entry (e.g. "Closures", "Event bubbling") may have no `syntax`/`returns` at all, just a `description` and maybe an `example`.
- **Valid JSON.** No trailing commas, no comments, double-quoted strings, UTF-8.
