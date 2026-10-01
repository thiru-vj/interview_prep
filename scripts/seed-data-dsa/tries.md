## Implement Trie (Prefix Tree)
difficulty: medium
faq: true
tags: trie, design, string

### Question
Implement a `Trie` class with:

- `insert(word)` — insert a word.
- `search(word)` — `true` if the exact word was inserted.
- `startsWith(prefix)` — `true` if any inserted word starts with `prefix`.

**Example:** `insert("apple")`, `search("apple")` → `true`, `search("app")` → `false`, `startsWith("app")` → `true`, `insert("app")`, `search("app")` → `true`.

### Answer
Each trie node holds a map of **child nodes keyed by character** and an **end-of-word flag**. Insert walks the characters, creating missing children, and marks the last node. Search and startsWith walk the same way; search also requires the end flag on the final node.

### Explanation
```
insert(word):  node = root; for ch in word: node = node.children[ch] ??= new Node(); node.isEnd = true
walk(s):       node = root; for ch in s: node = node.children[ch] or return null; return node
search(word):  node = walk(word); return node != null && node.isEnd
startsWith(p): return walk(p) != null
```

Every operation is O(L) for a string of length `L`, independent of how many words are stored — that's the trie's advantage over scanning a list. Children can be a hash map (any alphabet) or a fixed 26-slot array (lowercase letters, slightly faster).

### Solution
type: brute
name: Store words in a list and scan
time: O(n · L) per search / startsWith, O(1) insert
space: O(total characters)

```javascript
class Trie {
  constructor() {
    this.words = [];
  }
  insert(word) {
    this.words.push(word);
  }
  search(word) {
    return this.words.includes(word);
  }
  startsWith(prefix) {
    return this.words.some((w) => w.startsWith(prefix));
  }
}
```

```java
class Trie {
    private final List<String> words = new ArrayList<>();

    public void insert(String word) { words.add(word); }

    public boolean search(String word) { return words.contains(word); }

    public boolean startsWith(String prefix) {
        for (String w : words) {
            if (w.startsWith(prefix)) return true;
        }
        return false;
    }
}
```

```python
class Trie:
    def __init__(self):
        self.words = []

    def insert(self, word):
        self.words.append(word)

    def search(self, word):
        return word in self.words

    def starts_with(self, prefix):
        return any(w.startswith(prefix) for w in self.words)
```

### Solution
type: optimal
name: Trie nodes with children map and end flag
time: O(L) per operation
space: O(total characters)

```javascript
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }
  walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word) {
    const node = this.walk(word);
    return node !== null && node.isEnd;
  }
  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }
}
```

```java
class Trie {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;
    }

    private TrieNode walk(String s) {
        TrieNode node = root;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }

    public boolean search(String word) {
        TrieNode node = walk(word);
        return node != null && node.isEnd;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }
}
```

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None
```

### Tests

```json
{
  "cls": "Trie",
  "cases": [
    {"args":[["new"],["insert","apple"],["search","apple"],["search","app"],["startsWith","app"],["insert","app"],["search","app"],["startsWith","b"]],"expect":[null,null,true,false,true,null,true,false]}
  ]
}
```

## Design Add and Search Words Data Structure
difficulty: medium
faq: false
tags: trie, design, dfs, string

### Question
Design a `WordDictionary` supporting:

- `addWord(word)` — add a word.
- `search(word)` — `true` if any added word matches `word`, where `word` may contain dots `.` that match **any single letter**.

**Example:** `addWord("bad")`, `addWord("dad")`, `addWord("mad")`, `search("pad")` → `false`, `search("bad")` → `true`, `search(".ad")` → `true`, `search("b..")` → `true`.

### Answer
Store words in a trie. Searching is a DFS over the pattern: a normal letter follows its one child; a `.` tries **every** child. A match requires reaching the end of the pattern on a node marked as the end of a word.

### Explanation
```
dfs(node, i):
  if i == word.length: return node.isEnd
  ch = word[i]
  if ch == '.': return any(dfs(child, i + 1) for child in node.children)
  child = node.children[ch]; return child != null && dfs(child, i + 1)
```

`addWord` is O(L). `search` is O(L) without dots; with dots it can branch up to 26 ways per dot, so the worst case is O(26ᵈ · L) for `d` dots — still far better than testing every stored word when the dictionary is large. Bucketing words by length is a simpler alternative that works well when patterns are mostly dots.

### Solution
type: brute
name: List of words, compare character by character
time: O(n · L) per search, O(1) addWord
space: O(total characters)

```javascript
class WordDictionary {
  constructor() {
    this.words = [];
  }
  addWord(word) {
    this.words.push(word);
  }
  search(word) {
    return this.words.some((w) => w.length === word.length && [...word].every((ch, i) => ch === '.' || ch === w[i]));
  }
}
```

```java
class WordDictionary {
    private final List<String> words = new ArrayList<>();

    public void addWord(String word) { words.add(word); }

    public boolean search(String word) {
        for (String w : words) {
            if (w.length() != word.length()) continue;
            boolean match = true;
            for (int i = 0; i < w.length() && match; i++) {
                match = word.charAt(i) == '.' || word.charAt(i) == w.charAt(i);
            }
            if (match) return true;
        }
        return false;
    }
}
```

```python
class WordDictionary:
    def __init__(self):
        self.words = []

    def add_word(self, word):
        self.words.append(word)

    def search(self, word):
        return any(
            len(w) == len(word) and all(p == "." or p == c for p, c in zip(word, w))
            for w in self.words
        )
```

### Solution
type: optimal
name: Trie + DFS for wildcards
time: O(L) addWord; O(L) search without dots, O(26ᵈ · L) worst case with d dots
space: O(total characters)

```javascript
class WordDictionary {
  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }
  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isEnd: false });
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }
  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return node.isEnd;
      const ch = word[i];
      if (ch === '.') {
        for (const child of node.children.values()) if (dfs(child, i + 1)) return true;
        return false;
      }
      const child = node.children.get(ch);
      return child !== undefined && dfs(child, i + 1);
    };
    return dfs(this.root, 0);
  }
}
```

```java
class WordDictionary {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    private final TrieNode root = new TrieNode();

    public void addWord(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(word, 0, root);
    }

    private boolean dfs(String word, int i, TrieNode node) {
        if (i == word.length()) return node.isEnd;
        char ch = word.charAt(i);
        if (ch == '.') {
            for (TrieNode child : node.children) {
                if (child != null && dfs(word, i + 1, child)) return true;
            }
            return false;
        }
        TrieNode child = node.children[ch - 'a'];
        return child != null && dfs(word, i + 1, child);
    }
}
```

```python
class WordDictionary:
    def __init__(self):
        self.root = {}  # nested dicts; "$" marks the end of a word

    def add_word(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i + 1) for key, child in node.items() if key != "$")
            return ch in node and dfs(node[ch], i + 1)

        return dfs(self.root, 0)
```

### Tests

```json
{
  "cls": "WordDictionary",
  "cases": [
    {"args":[["new"],["addWord","bad"],["addWord","dad"],["addWord","mad"],["search","pad"],["search","bad"],["search",".ad"],["search","b.."],["search","b..."],["search","..."]],"expect":[null,null,null,null,false,true,true,true,false,true]},
    {"args":[["new"],["addWord","a"],["addWord","ab"],["search","a."],["search","."],["search","..b"],["search","a"]],"expect":[null,null,null,true,true,false,true]}
  ]
}
```
