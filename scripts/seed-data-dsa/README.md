# DSA seed data source files

- `topics.json` — the DSA topics, in display order. Each topic's problems live in `<topic-slug>.md` next to it.
- `<topic-slug>.md` — one Markdown file per topic, one `## ` block per problem.

Run `npm run seed:dsa:generate` (i.e. `node scripts/generate-dsa-seed.mjs`) after editing any of these files to regenerate `supabase/seed-dsa.sql`, then run that file in the Supabase SQL Editor.

These are Markdown rather than JSON (unlike `scripts/seed-data/` and `scripts/seed-data-cheatsheets/`) because every problem carries several multi-line solutions in three languages — far easier to read and review as fenced code blocks than as escaped JSON strings.

## Format

````markdown
## Two Sum

difficulty: easy
faq: true
tags: array, hash-map

### Question

Markdown problem statement — include at least one example and the constraints that matter.

### Answer

The key idea in 1-3 sentences (Markdown). Shown by default, so it should stand on its own.

### Explanation

Step-by-step walkthrough of the optimal approach (Markdown — lists, `code`, **bold** all fine).
Don't use `###` headings in here; they'd be read as a new section.

### Solution

type: brute
name: Check every pair
time: O(n²)
space: O(1)

Optional one-or-two sentence note about this approach (Markdown).

```javascript
function twoSum(nums, target) { ... }
```

```java
public int[] twoSum(int[] nums, int target) { ... }
```

```python
def two_sum(nums, target): ...
```

### Solution

type: optimal
...
````

## Rules

- **Title** (`## ...`) must be unique across all topics — the problem slug is derived from it.
- **`difficulty`** is `easy`, `medium` or `hard`. **`faq`** (`true`/`false`, defaults `false`) marks classic, genuinely frequently asked problems. **`tags`** is a comma-separated list of lowercase-kebab tags.
- **`### Question`, `### Answer`, `### Explanation`** are required.
- **`### Solution`** blocks: exactly one `type: optimal`, at least one `type: brute`, and any number of `type: alternate`. Each needs `name`, `time`, `space`, and a `javascript`, `java` and `python` code block.
- **Code conventions:** use the same function name for every solution of a problem within a language (camelCase in JavaScript/Java, snake_case in Python). Java solutions are written as methods (or a class, for design problems) as they'd appear inside LeetCode's `class Solution`, assuming `java.util.*` is imported. Linked-list/tree problems assume the standard `ListNode` (`val`, `next`) and `TreeNode` (`val`, `left`, `right`) definitions.
- **`### Tests`** (optional — without it the problem has no Practice button) holds one `json` code block that drives the in-browser practice editor:

  ```jsonc
  {
    "fn": "twoSum",            // JS function name — or "cls": "LRUCache" for design problems
    "py": "two_sum",           // optional: Python name when it isn't just fn in snake_case
    "opts": { "in": ["list", null], "out": "list" },   // optional conversions / comparison
    "cases": [
      { "args": [[2, 7, 11, 15], 9], "expect": [0, 1] }
    ]
  }
  ```

  - Design problems (`cls`): each case's `args` is a list of calls, `["new", ...ctorArgs]` first, then `["method", ...args]`; `expect` lists each call's return value (`null` for none). Python method names are the snake_case of the JS ones.
  - `opts.in[i]` converts argument `i`: `list` (array → linked list), `lists`, `tree` (level order with nulls), `node` (a TreeNode with that value), `cycle` (`[values, pos]`), `graph` (1-indexed adjacency list).
  - `opts.out` converts the return value back (`list`, `tree`, `graph`, `val`); `opts.mutates` compares the mutated first argument instead (in-place problems; `self` = as-is); `opts.prefix` compares `[k, first k items of args[0]]`; `opts.intersect` builds two lists sharing a tail from `[aOnly, bOnly, shared]`.
  - `opts.norm` accepts answers in any order: `sortOuter`, `sortDeep`, `sortFlat`, `sortInner`, or `palin` (any palindrome of the right length).
  - Parameter names and starter code are derived from the reference solutions' signatures, so no need to write them. The generator rejects unknown options and cases whose argument count doesn't match.
