import type {
  CheatsheetCategory,
  CheatsheetItem,
  CheatsheetTechnology,
  Difficulty,
  DsaProblem,
  DsaTopic,
  Language,
  Question,
  Topic,
} from '@/types/database'

/**
 * Small demo dataset served when Supabase is unreachable (see withFallback).
 * Ids are deliberately non-UUID so they can never collide with live rows.
 */

const TS = '2026-01-01T00:00:00.000Z'

export const mockLanguages: Language[] = [
  {
    id: 'mock-lang-javascript',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Core language concepts: closures, the event loop, prototypes and more.',
    icon: 'javascript',
    category: 'frontend',
    display_order: 1,
    created_at: TS,
  },
  {
    id: 'mock-lang-react',
    name: 'React',
    slug: 'react',
    description: 'Components, hooks, rendering and state management.',
    icon: 'react',
    category: 'frontend',
    display_order: 2,
    created_at: TS,
  },
  {
    id: 'mock-lang-nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    description: 'Server-side JavaScript, streams and the module system.',
    icon: 'nodejs',
    category: 'backend',
    display_order: 3,
    created_at: TS,
  },
  {
    id: 'mock-lang-sql',
    name: 'SQL',
    slug: 'sql',
    description: 'Querying, joins, indexes and transactions.',
    icon: 'sql',
    category: 'database',
    display_order: 4,
    created_at: TS,
  },
]

function topic(languageSlug: string, slug: string, name: string, description: string, order: number): Topic {
  return {
    id: `mock-topic-${languageSlug}-${slug}`,
    language_id: `mock-lang-${languageSlug}`,
    name,
    slug,
    description,
    display_order: order,
    created_at: TS,
  }
}

export const mockTopics: Topic[] = [
  topic('javascript', 'closures-scope', 'Closures & Scope', 'Lexical scope, closures and hoisting.', 1),
  topic('javascript', 'async', 'Asynchronous JavaScript', 'Promises, async/await and the event loop.', 2),
  topic('react', 'hooks', 'Hooks', 'useState, useEffect and custom hooks.', 1),
  topic('react', 'rendering', 'Rendering', 'Reconciliation, keys and memoization.', 2),
  topic('nodejs', 'core', 'Core Concepts', 'Event loop, modules and streams.', 1),
  topic('sql', 'joins', 'Joins', 'Combining rows across tables.', 1),
]

interface QuestionSeed {
  topic: string
  slug: string
  question: string
  answer: string
  code?: string
  codeLanguage?: string
  difficulty: Difficulty
  faq?: boolean
  tags?: string[]
}

const questionSeeds: QuestionSeed[] = [
  {
    topic: 'javascript-closures-scope',
    slug: 'what-is-a-closure',
    question: 'What is a closure?',
    answer:
      'A closure is a function bundled together with references to its surrounding lexical scope. It lets an inner function keep accessing variables of the outer function even after the outer function has returned.',
    code: 'function counter() {\n  let count = 0\n  return () => ++count\n}\n\nconst next = counter()\nnext() // 1\nnext() // 2',
    codeLanguage: 'javascript',
    difficulty: 'easy',
    faq: true,
    tags: ['closures', 'scope'],
  },
  {
    topic: 'javascript-closures-scope',
    slug: 'var-let-const-difference',
    question: 'What is the difference between var, let and const?',
    answer:
      '`var` is function-scoped and hoisted with an initial value of `undefined`. `let` and `const` are block-scoped and live in the temporal dead zone until declared. `const` bindings cannot be reassigned, though the value they point to may still be mutable.',
    difficulty: 'easy',
    faq: true,
    tags: ['scope', 'hoisting'],
  },
  {
    topic: 'javascript-async',
    slug: 'explain-the-event-loop',
    question: 'Explain the event loop.',
    answer:
      'JavaScript runs on a single thread. The event loop takes tasks from the macrotask queue one at a time and, after each task, drains the microtask queue (promise callbacks) completely before rendering and picking the next task.',
    code: "setTimeout(() => console.log('timeout'))\nPromise.resolve().then(() => console.log('microtask'))\nconsole.log('sync')\n// sync, microtask, timeout",
    codeLanguage: 'javascript',
    difficulty: 'medium',
    faq: true,
    tags: ['event-loop', 'promises'],
  },
  {
    topic: 'react-hooks',
    slug: 'useeffect-cleanup',
    question: 'When does the useEffect cleanup function run?',
    answer:
      'The cleanup runs before the effect re-runs (when its dependencies change) and once more when the component unmounts. Use it to cancel subscriptions, timers and in-flight requests.',
    code: 'useEffect(() => {\n  const id = setInterval(tick, 1000)\n  return () => clearInterval(id)\n}, [])',
    codeLanguage: 'javascript',
    difficulty: 'medium',
    faq: true,
    tags: ['hooks', 'effects'],
  },
  {
    topic: 'react-rendering',
    slug: 'why-keys-matter',
    question: 'Why are keys important when rendering lists?',
    answer:
      'Keys give each list item a stable identity so React can match elements between renders. Without stable keys React may reuse the wrong DOM nodes or component state when items are inserted, removed or reordered.',
    difficulty: 'easy',
    tags: ['lists', 'reconciliation'],
  },
  {
    topic: 'nodejs-core',
    slug: 'what-are-streams',
    question: 'What are streams in Node.js?',
    answer:
      'Streams process data piece by piece instead of loading it all into memory. Node provides readable, writable, duplex and transform streams, and `pipe()` connects them while handling backpressure.',
    difficulty: 'medium',
    tags: ['streams'],
  },
  {
    topic: 'sql-joins',
    slug: 'inner-vs-left-join',
    question: 'What is the difference between INNER JOIN and LEFT JOIN?',
    answer:
      'An INNER JOIN returns only rows with a match in both tables. A LEFT JOIN returns every row from the left table, filling columns from the right table with NULL when there is no match.',
    code: 'SELECT u.name, o.total\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;',
    codeLanguage: 'sql',
    difficulty: 'easy',
    faq: true,
    tags: ['joins'],
  },
]

export const mockQuestions: Question[] = questionSeeds.map((seed, index) => {
  const parent = mockTopics.find((t) => t.id === `mock-topic-${seed.topic}`)!
  return {
    id: `mock-question-${seed.slug}`,
    slug: seed.slug,
    language_id: parent.language_id,
    topic_id: parent.id,
    question: seed.question,
    answer: seed.answer,
    example: null,
    code: seed.code ?? null,
    code_language: seed.codeLanguage ?? null,
    difficulty: seed.difficulty,
    tags: seed.tags ?? null,
    is_frequently_asked: seed.faq ?? false,
    display_order: index + 1,
    created_at: TS,
    updated_at: TS,
  }
})

export const mockCheatsheetTechnologies: CheatsheetTechnology[] = [
  {
    id: 'mock-cs-javascript',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Everyday array and string methods.',
    icon: 'javascript',
    display_order: 1,
    created_at: TS,
  },
  {
    id: 'mock-cs-git',
    name: 'Git',
    slug: 'git',
    description: 'Common commands for daily version control.',
    icon: 'git',
    display_order: 2,
    created_at: TS,
  },
]

export const mockCheatsheetCategories: CheatsheetCategory[] = [
  {
    id: 'mock-cs-cat-js-arrays',
    technology_id: 'mock-cs-javascript',
    name: 'Arrays',
    slug: 'arrays',
    description: 'Transforming and querying arrays.',
    display_order: 1,
    created_at: TS,
  },
  {
    id: 'mock-cs-cat-git-basics',
    technology_id: 'mock-cs-git',
    name: 'Basics',
    slug: 'basics',
    description: 'Staging, committing and branching.',
    display_order: 1,
    created_at: TS,
  },
]

function cheatsheetItem(
  categoryId: string,
  technologyId: string,
  slug: string,
  fields: Pick<CheatsheetItem, 'name' | 'syntax' | 'description' | 'example' | 'code_language'>,
  order: number,
): CheatsheetItem {
  return {
    id: `mock-cs-item-${slug}`,
    category_id: categoryId,
    technology_id: technologyId,
    slug,
    parameters: null,
    returns: null,
    notes: null,
    tags: null,
    display_order: order,
    created_at: TS,
    updated_at: TS,
    ...fields,
  }
}

export const mockCheatsheetItems: CheatsheetItem[] = [
  cheatsheetItem(
    'mock-cs-cat-js-arrays',
    'mock-cs-javascript',
    'array-map',
    {
      name: 'Array.prototype.map()',
      syntax: 'array.map((element, index, array) => newValue)',
      description: 'Creates a new array with the results of calling a function on every element.',
      example: '[1, 2, 3].map((n) => n * 2) // [2, 4, 6]',
      code_language: 'javascript',
    },
    1,
  ),
  cheatsheetItem(
    'mock-cs-cat-js-arrays',
    'mock-cs-javascript',
    'array-filter',
    {
      name: 'Array.prototype.filter()',
      syntax: 'array.filter((element, index, array) => boolean)',
      description: 'Creates a new array containing only the elements that pass the test.',
      example: '[1, 2, 3, 4].filter((n) => n % 2 === 0) // [2, 4]',
      code_language: 'javascript',
    },
    2,
  ),
  cheatsheetItem(
    'mock-cs-cat-git-basics',
    'mock-cs-git',
    'git-commit',
    {
      name: 'git commit',
      syntax: 'git commit -m "message"',
      description: 'Records staged changes in the repository history.',
      example: 'git add .\ngit commit -m "feat: add login page"',
      code_language: 'bash',
    },
    1,
  ),
  cheatsheetItem(
    'mock-cs-cat-git-basics',
    'mock-cs-git',
    'git-switch',
    {
      name: 'git switch',
      syntax: 'git switch [-c] <branch>',
      description: 'Switches to a branch; `-c` creates it first.',
      example: 'git switch -c feature/search',
      code_language: 'bash',
    },
    2,
  ),
]

export const mockDsaTopics: DsaTopic[] = [
  {
    id: 'mock-dsa-arrays-hashing',
    name: 'Arrays & Hashing',
    slug: 'arrays-hashing',
    description: 'Hash maps and sets for constant-time lookups.',
    display_order: 1,
    created_at: TS,
  },
  {
    id: 'mock-dsa-two-pointers',
    name: 'Two Pointers',
    slug: 'two-pointers',
    description: 'Walking an array from both ends.',
    display_order: 2,
    created_at: TS,
  },
]

export const mockDsaProblems: DsaProblem[] = [
  {
    id: 'mock-dsa-two-sum',
    topic_id: 'mock-dsa-arrays-hashing',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    question:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.',
    answer: 'Store each number’s index in a hash map and look up the complement as you go.',
    explanation:
      'For each element `x`, the partner we need is `target - x`. If it is already in the map we have the answer; otherwise record `x` and continue. One pass, O(n) time.',
    solutions: [
      {
        type: 'brute',
        name: 'Check every pair',
        description: 'Try all pairs with two nested loops.',
        time: 'O(n²)',
        space: 'O(1)',
        code: {
          javascript:
            'function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j]\n    }\n  }\n  return []\n}',
          java: 'int[] twoSum(int[] nums, int target) {\n  for (int i = 0; i < nums.length; i++)\n    for (int j = i + 1; j < nums.length; j++)\n      if (nums[i] + nums[j] == target) return new int[]{i, j};\n  return new int[0];\n}',
          python:
            'def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []',
        },
      },
      {
        type: 'optimal',
        name: 'Hash map',
        description: 'One pass, looking up each complement in a map.',
        time: 'O(n)',
        space: 'O(n)',
        code: {
          javascript:
            'function twoSum(nums, target) {\n  const seen = new Map()\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i]\n    if (seen.has(need)) return [seen.get(need), i]\n    seen.set(nums[i], i)\n  }\n  return []\n}',
          java: 'int[] twoSum(int[] nums, int target) {\n  Map<Integer, Integer> seen = new HashMap<>();\n  for (int i = 0; i < nums.length; i++) {\n    int need = target - nums[i];\n    if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n    seen.put(nums[i], i);\n  }\n  return new int[0];\n}',
          python:
            'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n    return []',
        },
      },
    ],
    practice: {
      fn: 'twoSum',
      py: 'two_sum',
      params: ['nums', 'target'],
      opts: {},
      cases: [
        { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
        { args: [[3, 2, 4], 6], expect: [1, 2] },
        { args: [[3, 3], 6], expect: [0, 1] },
      ],
      starter: {
        javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n}',
        python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
      },
    },
    tags: ['array', 'hash-map'],
    is_frequently_asked: true,
    display_order: 1,
    created_at: TS,
    updated_at: TS,
  },
  {
    id: 'mock-dsa-valid-palindrome',
    topic_id: 'mock-dsa-two-pointers',
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'easy',
    question:
      'Given a string `s`, return `true` if it is a palindrome after lowercasing and removing all non-alphanumeric characters.',
    answer: 'Move two pointers inward from both ends, skipping non-alphanumeric characters.',
    explanation:
      'Compare characters at the left and right pointers (case-insensitively), skipping anything that is not a letter or digit. Any mismatch means it is not a palindrome.',
    solutions: [
      {
        type: 'optimal',
        name: 'Two pointers',
        description: 'Compare from both ends without building a new string.',
        time: 'O(n)',
        space: 'O(1)',
        code: {
          javascript:
            'function isPalindrome(s) {\n  const ok = (c) => /[a-z0-9]/i.test(c)\n  let l = 0, r = s.length - 1\n  while (l < r) {\n    if (!ok(s[l])) l++\n    else if (!ok(s[r])) r--\n    else if (s[l++].toLowerCase() !== s[r--].toLowerCase()) return false\n  }\n  return true\n}',
          java: 'boolean isPalindrome(String s) {\n  int l = 0, r = s.length() - 1;\n  while (l < r) {\n    if (!Character.isLetterOrDigit(s.charAt(l))) l++;\n    else if (!Character.isLetterOrDigit(s.charAt(r))) r--;\n    else if (Character.toLowerCase(s.charAt(l++)) != Character.toLowerCase(s.charAt(r--))) return false;\n  }\n  return true;\n}',
          python:
            'def is_palindrome(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        if not s[l].isalnum():\n            l += 1\n        elif not s[r].isalnum():\n            r -= 1\n        elif s[l].lower() != s[r].lower():\n            return False\n        else:\n            l, r = l + 1, r - 1\n    return True',
        },
      },
    ],
    practice: null,
    tags: ['string', 'two-pointers'],
    is_frequently_asked: true,
    display_order: 1,
    created_at: TS,
    updated_at: TS,
  },
]
