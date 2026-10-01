## Subsets
difficulty: medium
faq: true
tags: array, backtracking, bit-manipulation

### Question
Given an integer array `nums` of **unique** elements, return all possible subsets (the power set), in any order, without duplicates.

**Example:** `nums = [1, 2, 3]` → `[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]`.

### Answer
Backtrack: at each index decide whether to **include** the element or not. Record the current subset at every step of the recursion that builds subsets in increasing index order. There are `2ⁿ` subsets, so any approach is O(n · 2ⁿ).

### Explanation
```
backtrack(start, current):
  record a copy of current
  for i from start to n - 1:
    current.push(nums[i])
    backtrack(i + 1, current)
    current.pop()            ← undo the choice
```

Only moving forward (`i + 1`) guarantees each subset is generated once, in one order. Since the output has `2ⁿ` subsets of average length `n/2`, O(n · 2ⁿ) is optimal — the approaches below differ in style, not complexity. The bitmask version maps each number `0 .. 2ⁿ - 1` to a subset.

### Solution
type: brute
name: Bitmask enumeration
time: O(n · 2ⁿ)
space: O(n) extra (output excluded)

Every integer from `0` to `2ⁿ - 1` is a subset: bit `i` set means `nums[i]` is included.

```javascript
function subsets(nums) {
  const result = [];
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    result.push(nums.filter((_, i) => mask & (1 << i)));
  }
  return result;
}
```

```java
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    for (int mask = 0; mask < 1 << nums.length; mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if ((mask & (1 << i)) != 0) subset.add(nums[i]);
        }
        result.add(subset);
    }
    return result;
}
```

```python
def subsets(nums):
    n = len(nums)
    return [[nums[i] for i in range(n) if mask & (1 << i)] for mask in range(1 << n)]
```

### Solution
type: optimal
name: Backtracking
time: O(n · 2ⁿ)
space: O(n) recursion (output excluded)

```javascript
function subsets(nums) {
  const result = [];
  const current = [];
  const backtrack = (start) => {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1);
      current.pop();
    }
  };
  backtrack(0);
  return result;
}
```

```java
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(nums, i + 1, current, result);
        current.remove(current.size() - 1);
    }
}
```

```python
def subsets(nums):
    result, current = [], []

    def backtrack(start):
        result.append(current[:])
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1)
            current.pop()

    backtrack(0)
    return result
```

### Solution
type: alternate
name: Iterative cascading
time: O(n · 2ⁿ)
space: O(1) extra (output excluded)

Start with `[[]]`; for each number, append a copy of every existing subset with that number added.

```javascript
function subsets(nums) {
  let result = [[]];
  for (const num of nums) result = result.concat(result.map((subset) => [...subset, num]));
  return result;
}
```

```java
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    result.add(new ArrayList<>());
    for (int num : nums) {
        int size = result.size();
        for (int i = 0; i < size; i++) {
            List<Integer> next = new ArrayList<>(result.get(i));
            next.add(num);
            result.add(next);
        }
    }
    return result;
}
```

```python
def subsets(nums):
    result = [[]]
    for num in nums:
        result += [subset + [num] for subset in result]
    return result
```

### Tests

```json
{
  "fn": "subsets",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[[1,2,3]],"expect":[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]},
    {"args":[[0]],"expect":[[],[0]]}
  ]
}
```

## Permutations
difficulty: medium
faq: true
tags: array, backtracking

### Question
Given an array `nums` of **distinct** integers, return all possible permutations, in any order.

**Example:** `nums = [1, 2, 3]` → `[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]`.

### Answer
Build permutations position by position. At each step, try every number not yet used, mark it used, recurse, then unmark it (backtrack). When the current permutation has `n` numbers, record it.

### Explanation
```
backtrack(current):
  if current.length == n: record a copy; return
  for each num not in used:
    used.add(num); current.push(num)
    backtrack(current)
    current.pop(); used.delete(num)
```

There are `n!` permutations, each copied in O(n), so O(n · n!) is the best possible. A `used` boolean array (or swapping elements in place) avoids an O(n) "is it already in current?" check.

### Solution
type: brute
name: Generate all n-length sequences, keep the distinct ones
time: O(n · nⁿ)
space: O(n)

Choose any number at every position (repeats allowed), then discard sequences that reuse a number. Explores `nⁿ` sequences to find `n!` permutations.

```javascript
function permute(nums) {
  const n = nums.length;
  const result = [];
  const build = (seq) => {
    if (seq.length === n) {
      if (new Set(seq).size === n) result.push([...seq]);
      return;
    }
    for (const num of nums) {
      seq.push(num);
      build(seq);
      seq.pop();
    }
  };
  build([]);
  return result;
}
```

```java
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    build(nums, new ArrayList<>(), result);
    return result;
}

private void build(int[] nums, List<Integer> seq, List<List<Integer>> result) {
    if (seq.size() == nums.length) {
        if (new HashSet<>(seq).size() == nums.length) result.add(new ArrayList<>(seq));
        return;
    }
    for (int num : nums) {
        seq.add(num);
        build(nums, seq, result);
        seq.remove(seq.size() - 1);
    }
}
```

```python
from itertools import product

def permute(nums):
    n = len(nums)
    return [list(seq) for seq in product(nums, repeat=n) if len(set(seq)) == n]
```

### Solution
type: optimal
name: Backtracking with a used[] array
time: O(n · n!)
space: O(n)

```javascript
function permute(nums) {
  const result = [];
  const current = [];
  const used = new Array(nums.length).fill(false);
  const backtrack = () => {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  };
  backtrack();
  return result;
}
```

```java
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, boolean[] used, List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        current.add(nums[i]);
        backtrack(nums, used, current, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}
```

```python
def permute(nums):
    result, current = [], []
    used = [False] * len(nums)

    def backtrack():
        if len(current) == len(nums):
            result.append(current[:])
            return
        for i, num in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            current.append(num)
            backtrack()
            current.pop()
            used[i] = False

    backtrack()
    return result
```

### Solution
type: alternate
name: In-place swapping
time: O(n · n!)
space: O(n) recursion

Fix position `start` by swapping each remaining element into it, recurse on `start + 1`, then swap back. No `used` array or separate `current` list needed.

```javascript
function permute(nums) {
  const arr = [...nums];
  const result = [];
  const backtrack = (start) => {
    if (start === arr.length) {
      result.push([...arr]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      backtrack(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  };
  backtrack(0);
  return result;
}
```

```java
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, result);
    return result;
}

private void backtrack(int[] nums, int start, List<List<Integer>> result) {
    if (start == nums.length) {
        List<Integer> perm = new ArrayList<>();
        for (int num : nums) perm.add(num);
        result.add(perm);
        return;
    }
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);
        backtrack(nums, start + 1, result);
        swap(nums, start, i);
    }
}

private void swap(int[] nums, int i, int j) {
    int tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
}
```

```python
def permute(nums):
    arr = list(nums)
    result = []

    def backtrack(start):
        if start == len(arr):
            result.append(arr[:])
            return
        for i in range(start, len(arr)):
            arr[start], arr[i] = arr[i], arr[start]
            backtrack(start + 1)
            arr[start], arr[i] = arr[i], arr[start]

    backtrack(0)
    return result
```

### Tests

```json
{
  "fn": "permute",
  "opts": {"norm":"sortOuter"},
  "cases": [
    {"args":[[1,2,3]],"expect":[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]},
    {"args":[[0,1]],"expect":[[0,1],[1,0]]},
    {"args":[[1]],"expect":[[1]]}
  ]
}
```

## Combination Sum
difficulty: medium
faq: true
tags: array, backtracking

### Question
Given an array of **distinct** positive integers `candidates` and a `target`, return all unique combinations of candidates that sum to `target`. The same number may be chosen **unlimited** times. Combinations are unique if their frequency of numbers differs; order doesn't matter.

**Example:** `candidates = [2, 3, 6, 7]`, `target = 7` → `[[2, 2, 3], [7]]`.

### Answer
Backtrack with a `start` index: at each step try candidates from `start` onward, and recurse with the **same** index (so a number can repeat) but never an earlier one (so `[2, 3]` and `[3, 2]` aren't both produced). Sort first and stop the loop as soon as a candidate exceeds the remaining target.

### Explanation
```
backtrack(start, remaining, current):
  if remaining == 0: record current
  for i from start:
    if candidates[i] > remaining: break      ← sorted, so all later ones are too big
    current.push(candidates[i])
    backtrack(i, remaining - candidates[i], current)   ← i, not i + 1: reuse allowed
    current.pop()
```

The recursion depth is at most `target / min(candidates)`. The exact bound depends on the input, but pruning with `break` cuts huge parts of the search tree.

### Solution
type: brute
name: Backtracking without sorting or pruning
time: O(n^(T/m)) — T = target, m = smallest candidate
space: O(T/m)

Tries every candidate at every level and only stops when the sum overshoots — explores many dead branches.

```javascript
function combinationSum(candidates, target) {
  const result = [];
  const current = [];
  const backtrack = (start, remaining) => {
    if (remaining < 0) return;
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(i, remaining - candidates[i]);
      current.pop();
    }
  };
  backtrack(0, target);
  return result;
}
```

```java
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, 0, target, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int start, int remaining, List<Integer> current, List<List<Integer>> result) {
    if (remaining < 0) return;
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int i = start; i < candidates.length; i++) {
        current.add(candidates[i]);
        backtrack(candidates, i, remaining - candidates[i], current, result);
        current.remove(current.size() - 1);
    }
}
```

```python
def combination_sum(candidates, target):
    result, current = [], []

    def backtrack(start, remaining):
        if remaining < 0:
            return
        if remaining == 0:
            result.append(current[:])
            return
        for i in range(start, len(candidates)):
            current.append(candidates[i])
            backtrack(i, remaining - candidates[i])
            current.pop()

    backtrack(0, target)
    return result
```

### Solution
type: optimal
name: Sorted backtracking with early break
time: O(n^(T/m)) worst case, far less in practice
space: O(T/m)

```javascript
function combinationSum(candidates, target) {
  const sorted = [...candidates].sort((a, b) => a - b);
  const result = [];
  const current = [];
  const backtrack = (start, remaining) => {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < sorted.length && sorted[i] <= remaining; i++) {
      current.push(sorted[i]);
      backtrack(i, remaining - sorted[i]);
      current.pop();
    }
  };
  backtrack(0, target);
  return result;
}
```

```java
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, 0, target, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int start, int remaining, List<Integer> current, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int i = start; i < candidates.length && candidates[i] <= remaining; i++) {
        current.add(candidates[i]);
        backtrack(candidates, i, remaining - candidates[i], current, result);
        current.remove(current.size() - 1);
    }
}
```

```python
def combination_sum(candidates, target):
    candidates = sorted(candidates)
    result, current = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(current[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            current.append(candidates[i])
            backtrack(i, remaining - candidates[i])
            current.pop()

    backtrack(0, target)
    return result
```

### Tests

```json
{
  "fn": "combinationSum",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[[2,3,6,7],7],"expect":[[2,2,3],[7]]},
    {"args":[[2,3,5],8],"expect":[[2,2,2,2],[2,3,3],[3,5]]},
    {"args":[[2],1],"expect":[]},
    {"args":[[7,3,2],7],"expect":[[2,2,3],[7]]}
  ]
}
```

## Generate Parentheses
difficulty: medium
faq: true
tags: string, backtracking

### Question
Given `n` pairs of parentheses, generate all combinations of well-formed parentheses.

**Example:** `n = 3` → `["((()))", "(()())", "(())()", "()(())", "()()()"]`.

### Answer
Build the string one character at a time, keeping counts of `open` and `close` used. You may add `(` while `open < n`, and `)` only while `close < open`. Every string built this way is valid, so no work is wasted on invalid prefixes.

### Explanation
A prefix can still become valid exactly when it never has more `)` than `(`. The two rules enforce that:

- `open < n` → room for another `(`.
- `close < open` → there's an unmatched `(` to close.

When the length reaches `2n`, record it. The number of results is the `n`-th Catalan number, ~`4ⁿ / (n√n)`, and the algorithm does O(n) work per result.

### Solution
type: brute
name: Generate all 2²ⁿ strings, keep valid ones
time: O(n · 2²ⁿ)
space: O(n)

```javascript
function generateParenthesis(n) {
  const result = [];
  const isValid = (s) => {
    let balance = 0;
    for (const ch of s) {
      balance += ch === '(' ? 1 : -1;
      if (balance < 0) return false;
    }
    return balance === 0;
  };
  const build = (s) => {
    if (s.length === 2 * n) {
      if (isValid(s)) result.push(s);
      return;
    }
    build(s + '(');
    build(s + ')');
  };
  build('');
  return result;
}
```

```java
public List<String> generateParenthesis(int n) {
    List<String> result = new ArrayList<>();
    build("", n, result);
    return result;
}

private void build(String s, int n, List<String> result) {
    if (s.length() == 2 * n) {
        if (isValid(s)) result.add(s);
        return;
    }
    build(s + "(", n, result);
    build(s + ")", n, result);
}

private boolean isValid(String s) {
    int balance = 0;
    for (char ch : s.toCharArray()) {
        balance += ch == '(' ? 1 : -1;
        if (balance < 0) return false;
    }
    return balance == 0;
}
```

```python
from itertools import product

def generate_parenthesis(n):
    def is_valid(s):
        balance = 0
        for ch in s:
            balance += 1 if ch == "(" else -1
            if balance < 0:
                return False
        return balance == 0

    return ["".join(p) for p in product("()", repeat=2 * n) if is_valid(p)]
```

### Solution
type: optimal
name: Backtracking with open/close counts
time: O(4ⁿ / √n)
space: O(n)

```javascript
function generateParenthesis(n) {
  const result = [];
  const backtrack = (s, open, close) => {
    if (s.length === 2 * n) {
      result.push(s);
      return;
    }
    if (open < n) backtrack(s + '(', open + 1, close);
    if (close < open) backtrack(s + ')', open, close + 1);
  };
  backtrack('', 0, 0);
  return result;
}
```

```java
public List<String> generateParenthesis(int n) {
    List<String> result = new ArrayList<>();
    backtrack(new StringBuilder(), 0, 0, n, result);
    return result;
}

private void backtrack(StringBuilder sb, int open, int close, int n, List<String> result) {
    if (sb.length() == 2 * n) {
        result.add(sb.toString());
        return;
    }
    if (open < n) {
        sb.append('(');
        backtrack(sb, open + 1, close, n, result);
        sb.deleteCharAt(sb.length() - 1);
    }
    if (close < open) {
        sb.append(')');
        backtrack(sb, open, close + 1, n, result);
        sb.deleteCharAt(sb.length() - 1);
    }
}
```

```python
def generate_parenthesis(n):
    result = []

    def backtrack(s, open_count, close_count):
        if len(s) == 2 * n:
            result.append(s)
            return
        if open_count < n:
            backtrack(s + "(", open_count + 1, close_count)
        if close_count < open_count:
            backtrack(s + ")", open_count, close_count + 1)

    backtrack("", 0, 0)
    return result
```

### Tests

```json
{
  "fn": "generateParenthesis",
  "opts": {"norm":"sortOuter"},
  "cases": [
    {"args":[3],"expect":["((()))","(()())","(())()","()(())","()()()"]},
    {"args":[1],"expect":["()"]}
  ]
}
```

## Word Search
difficulty: medium
faq: true
tags: matrix, backtracking, dfs

### Question
Given an `m × n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word must be built from sequentially adjacent cells (horizontal or vertical), and a cell may not be used more than once.

**Example:** `board = [["A","B","C","E"], ["S","F","C","S"], ["A","D","E","E"]]`, `word = "ABCCED"` → `true`; `word = "ABCB"` → `false`.

### Answer
Try every cell as a starting point and run a DFS that matches `word` one character at a time. Mark a cell as used while it's on the current path (e.g. overwrite it with `#`), and **restore it when backtracking** so other paths can use it.

### Explanation
```
dfs(r, c, i):                       // does word[i..] start at (r, c)?
  if i == word.length: return true
  if out of bounds or board[r][c] != word[i]: return false
  temp = board[r][c]; board[r][c] = '#'           ← mark visited
  found = dfs(r+1,c,i+1) || dfs(r-1,c,i+1) || dfs(r,c+1,i+1) || dfs(r,c-1,i+1)
  board[r][c] = temp                               ← unmark (backtrack)
  return found
```

Worst case O(m · n · 4ᴸ) for word length `L` (really `3ᴸ` after the first step, since you never go back). A cheap pre-check — does the board even contain enough of each letter? — rejects many impossible words instantly.

### Solution
type: brute
name: DFS with a copied visited set per path
time: O(m · n · 4ᴸ · L)
space: O(L²)

Carries an immutable set of visited cells, copying it at every step — correct, but each copy costs O(L).

```javascript
function exist(board, word) {
  const m = board.length;
  const n = board[0].length;
  const dfs = (r, c, i, visited) => {
    if (i === word.length) return true;
    if (r < 0 || r >= m || c < 0 || c >= n) return false;
    const key = r * n + c;
    if (visited.has(key) || board[r][c] !== word[i]) return false;
    const next = new Set(visited).add(key);
    return dfs(r + 1, c, i + 1, next) || dfs(r - 1, c, i + 1, next) || dfs(r, c + 1, i + 1, next) || dfs(r, c - 1, i + 1, next);
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) if (dfs(r, c, 0, new Set())) return true;
  }
  return false;
}
```

```java
public boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++) {
        for (int c = 0; c < board[0].length; c++) {
            if (dfs(board, word, r, c, 0, new HashSet<>())) return true;
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int r, int c, int i, Set<Integer> visited) {
    if (i == word.length()) return true;
    int n = board[0].length;
    if (r < 0 || r >= board.length || c < 0 || c >= n) return false;
    if (visited.contains(r * n + c) || board[r][c] != word.charAt(i)) return false;
    Set<Integer> next = new HashSet<>(visited);
    next.add(r * n + c);
    return dfs(board, word, r + 1, c, i + 1, next) || dfs(board, word, r - 1, c, i + 1, next)
        || dfs(board, word, r, c + 1, i + 1, next) || dfs(board, word, r, c - 1, i + 1, next);
}
```

```python
def exist(board, word):
    m, n = len(board), len(board[0])

    def dfs(r, c, i, visited):
        if i == len(word):
            return True
        if r < 0 or r >= m or c < 0 or c >= n or (r, c) in visited or board[r][c] != word[i]:
            return False
        nxt = visited | {(r, c)}
        return dfs(r + 1, c, i + 1, nxt) or dfs(r - 1, c, i + 1, nxt) or dfs(r, c + 1, i + 1, nxt) or dfs(r, c - 1, i + 1, nxt)

    return any(dfs(r, c, 0, frozenset()) for r in range(m) for c in range(n))
```

### Solution
type: optimal
name: Backtracking with in-place marking
time: O(m · n · 3ᴸ)
space: O(L) recursion

```javascript
function exist(board, word) {
  const m = board.length;
  const n = board[0].length;
  const dfs = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[i]) return false;
    const temp = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = temp;
    return found;
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
  }
  return false;
}
```

```java
public boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++) {
        for (int c = 0; c < board[0].length; c++) {
            if (dfs(board, word, r, c, 0)) return true;
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int r, int c, int i) {
    if (i == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(i)) return false;
    char temp = board[r][c];
    board[r][c] = '#';
    boolean found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1)
        || dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
    board[r][c] = temp;
    return found;
}
```

```python
def exist(board, word):
    m, n = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[i]:
            return False
        temp, board[r][c] = board[r][c], "#"
        found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)
        board[r][c] = temp
        return found

    return any(dfs(r, c, 0) for r in range(m) for c in range(n))
```

### Tests

```json
{
  "fn": "exist",
  "cases": [
    {"args":[[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"ABCCED"],"expect":true},
    {"args":[[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"SEE"],"expect":true},
    {"args":[[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"ABCB"],"expect":false},
    {"args":[[["a"]],"a"],"expect":true},
    {"args":[[["a","b"],["c","d"]],"abdc"],"expect":true},
    {"args":[[["a","b"],["c","d"]],"abcd"],"expect":false}
  ]
}
```

## N-Queens
difficulty: hard
faq: true
tags: backtracking, matrix

### Question
Place `n` queens on an `n × n` chessboard so that no two attack each other (no shared row, column or diagonal). Return all distinct solutions, each as a list of strings where `'Q'` is a queen and `'.'` is empty.

**Example:** `n = 4` → `[[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]`.

### Answer
Place one queen per row. For each row, try every column that isn't attacked, tracked with three sets: used **columns**, used **diagonals** (`row - col`) and used **anti-diagonals** (`row + col`). Recurse to the next row, then remove the queen (backtrack).

### Explanation
Cells on the same `\` diagonal share `row - col`; cells on the same `/` diagonal share `row + col`. So attack checks are O(1) set lookups.

```
place(row):
  if row == n: record board
  for col in 0..n-1:
    if col, row-col, or row+col is used: skip
    mark all three; queens[row] = col
    place(row + 1)
    unmark all three
```

Placing one queen per row removes row conflicts by construction. The search is bounded by `n!` placements, heavily pruned in practice.

### Solution
type: brute
name: Try every column permutation, check diagonals at the end
time: O(n! · n)
space: O(n)

Every permutation of columns already avoids row and column clashes; filter out the ones with diagonal clashes. No pruning — full permutations are built even when the first two queens already attack each other.

```javascript
function solveNQueens(n) {
  const result = [];
  const cols = [];
  const used = new Array(n).fill(false);
  const valid = () => {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) if (Math.abs(cols[i] - cols[j]) === j - i) return false;
    }
    return true;
  };
  const permute = () => {
    if (cols.length === n) {
      if (valid()) result.push(cols.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (used[c]) continue;
      used[c] = true;
      cols.push(c);
      permute();
      cols.pop();
      used[c] = false;
    }
  };
  permute();
  return result;
}
```

```java
public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    permute(n, new int[n], 0, new boolean[n], result);
    return result;
}

private void permute(int n, int[] cols, int row, boolean[] used, List<List<String>> result) {
    if (row == n) {
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (Math.abs(cols[i] - cols[j]) == j - i) return;
            }
        }
        List<String> board = new ArrayList<>();
        for (int c : cols) board.add(".".repeat(c) + "Q" + ".".repeat(n - c - 1));
        result.add(board);
        return;
    }
    for (int c = 0; c < n; c++) {
        if (used[c]) continue;
        used[c] = true;
        cols[row] = c;
        permute(n, cols, row + 1, used, result);
        used[c] = false;
    }
}
```

```python
from itertools import permutations

def solve_n_queens(n):
    result = []
    for cols in permutations(range(n)):
        if all(abs(cols[i] - cols[j]) != j - i for i in range(n) for j in range(i + 1, n)):
            result.append(["." * c + "Q" + "." * (n - c - 1) for c in cols])
    return result
```

### Solution
type: optimal
name: Row-by-row backtracking with column/diagonal sets
time: O(n!)
space: O(n)

```javascript
function solveNQueens(n) {
  const result = [];
  const queens = [];
  const cols = new Set();
  const diag = new Set();
  const anti = new Set();
  const place = (row) => {
    if (row === n) {
      result.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag.has(row - col) || anti.has(row + col)) continue;
      cols.add(col);
      diag.add(row - col);
      anti.add(row + col);
      queens.push(col);
      place(row + 1);
      queens.pop();
      cols.delete(col);
      diag.delete(row - col);
      anti.delete(row + col);
    }
  };
  place(0);
  return result;
}
```

```java
public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    place(0, n, new int[n], new boolean[n], new boolean[2 * n], new boolean[2 * n], result);
    return result;
}

private void place(int row, int n, int[] queens, boolean[] cols, boolean[] diag, boolean[] anti, List<List<String>> result) {
    if (row == n) {
        List<String> board = new ArrayList<>();
        for (int c : queens) board.add(".".repeat(c) + "Q" + ".".repeat(n - c - 1));
        result.add(board);
        return;
    }
    for (int col = 0; col < n; col++) {
        int d = row - col + n, a = row + col; // offset d so it's never negative
        if (cols[col] || diag[d] || anti[a]) continue;
        cols[col] = diag[d] = anti[a] = true;
        queens[row] = col;
        place(row + 1, n, queens, cols, diag, anti, result);
        cols[col] = diag[d] = anti[a] = false;
    }
}
```

```python
def solve_n_queens(n):
    result, queens = [], []
    cols, diag, anti = set(), set(), set()

    def place(row):
        if row == n:
            result.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for col in range(n):
            if col in cols or row - col in diag or row + col in anti:
                continue
            cols.add(col)
            diag.add(row - col)
            anti.add(row + col)
            queens.append(col)
            place(row + 1)
            queens.pop()
            cols.remove(col)
            diag.remove(row - col)
            anti.remove(row + col)

    place(0)
    return result
```

### Tests

```json
{
  "fn": "solveNQueens",
  "opts": {"norm":"sortOuter"},
  "cases": [
    {"args":[4],"expect":[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]},
    {"args":[1],"expect":[["Q"]]},
    {"args":[3],"expect":[]}
  ]
}
```

## Letter Combinations of a Phone Number
difficulty: medium
faq: false
tags: string, backtracking, hash-map

### Question
Given a string of digits `2`–`9`, return all letter combinations the number could represent on a phone keypad (`2 → abc`, `3 → def`, …, `7 → pqrs`, `9 → wxyz`), in any order. Return an empty list for an empty input.

**Example:** `digits = "23"` → `["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]`.

### Answer
Backtrack over the digits: for the digit at position `i`, try each of its letters, append it to the current prefix, and recurse to `i + 1`. When the prefix has one letter per digit, record it.

### Explanation
The combinations form a tree of depth `n` with 3 or 4 branches per level, so there are up to `4ⁿ` results, each of length `n` — O(n · 4ⁿ) total, which no approach can beat since that's the output size.

Handle `digits = ""` explicitly: the natural recursion would otherwise return `[""]`.

### Solution
type: brute
name: Iterative expansion (BFS-style)
time: O(n · 4ⁿ)
space: O(n · 4ⁿ) for the intermediate lists

Start with `[""]` and, for each digit, replace the list with every existing string extended by each of the digit's letters. Same complexity, but keeps whole intermediate levels in memory.

```javascript
function letterCombinations(digits) {
  if (!digits) return [];
  const map = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  let result = [''];
  for (const d of digits) {
    result = result.flatMap((prefix) => [...map[d]].map((ch) => prefix + ch));
  }
  return result;
}
```

```java
public List<String> letterCombinations(String digits) {
    if (digits.isEmpty()) return new ArrayList<>();
    String[] map = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    List<String> result = new ArrayList<>(List.of(""));
    for (char d : digits.toCharArray()) {
        List<String> next = new ArrayList<>();
        for (String prefix : result) {
            for (char ch : map[d - '0'].toCharArray()) next.add(prefix + ch);
        }
        result = next;
    }
    return result;
}
```

```python
def letter_combinations(digits):
    if not digits:
        return []
    mapping = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    result = [""]
    for d in digits:
        result = [prefix + ch for prefix in result for ch in mapping[d]]
    return result
```

### Solution
type: optimal
name: Backtracking (DFS)
time: O(n · 4ⁿ)
space: O(n) recursion (output excluded)

```javascript
function letterCombinations(digits) {
  if (!digits) return [];
  const map = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const result = [];
  const backtrack = (i, prefix) => {
    if (i === digits.length) {
      result.push(prefix);
      return;
    }
    for (const ch of map[digits[i]]) backtrack(i + 1, prefix + ch);
  };
  backtrack(0, '');
  return result;
}
```

```java
private static final String[] KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

public List<String> letterCombinations(String digits) {
    List<String> result = new ArrayList<>();
    if (!digits.isEmpty()) backtrack(digits, 0, new StringBuilder(), result);
    return result;
}

private void backtrack(String digits, int i, StringBuilder prefix, List<String> result) {
    if (i == digits.length()) {
        result.add(prefix.toString());
        return;
    }
    for (char ch : KEYS[digits.charAt(i) - '0'].toCharArray()) {
        prefix.append(ch);
        backtrack(digits, i + 1, prefix, result);
        prefix.deleteCharAt(prefix.length() - 1);
    }
}
```

```python
def letter_combinations(digits):
    if not digits:
        return []
    mapping = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    result = []

    def backtrack(i, prefix):
        if i == len(digits):
            result.append(prefix)
            return
        for ch in mapping[digits[i]]:
            backtrack(i + 1, prefix + ch)

    backtrack(0, "")
    return result
```

### Tests

```json
{
  "fn": "letterCombinations",
  "opts": {"norm":"sortOuter"},
  "cases": [
    {"args":["23"],"expect":["ad","ae","af","bd","be","bf","cd","ce","cf"]},
    {"args":[""],"expect":[]},
    {"args":["2"],"expect":["a","b","c"]},
    {"args":["79"],"expect":["pw","px","py","pz","qw","qx","qy","qz","rw","rx","ry","rz","sw","sx","sy","sz"]}
  ]
}
```
