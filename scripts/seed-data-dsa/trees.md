## Maximum Depth of Binary Tree
difficulty: easy
faq: true
tags: tree, dfs, bfs, recursion

### Question
Given the `root` of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `3`.

### Answer
Recursively: the depth of a tree is `1 + max(depth(left), depth(right))`, and an empty tree has depth `0`.

### Explanation
Each node asks its children for their depths and adds one for itself — a post-order DFS that visits every node once.

Iterative alternatives: BFS counting levels (useful when the tree is very deep and recursion might overflow the stack), or a DFS stack of `(node, depth)` pairs.

### Solution
type: brute
name: Enumerate every root-to-leaf path
time: O(n · h) (copying paths)
space: O(n · h)

Build every root-to-leaf path explicitly and return the longest. Correct but wasteful — it copies the path at every node.

```javascript
function maxDepth(root) {
  if (!root) return 0;
  const paths = [];
  const walk = (node, path) => {
    const next = [...path, node.val];
    if (!node.left && !node.right) paths.push(next);
    if (node.left) walk(node.left, next);
    if (node.right) walk(node.right, next);
  };
  walk(root, []);
  return Math.max(...paths.map((p) => p.length));
}
```

```java
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    List<List<Integer>> paths = new ArrayList<>();
    walk(root, new ArrayList<>(), paths);
    int best = 0;
    for (List<Integer> path : paths) best = Math.max(best, path.size());
    return best;
}

private void walk(TreeNode node, List<Integer> path, List<List<Integer>> paths) {
    List<Integer> next = new ArrayList<>(path);
    next.add(node.val);
    if (node.left == null && node.right == null) paths.add(next);
    if (node.left != null) walk(node.left, next, paths);
    if (node.right != null) walk(node.right, next, paths);
}
```

```python
def max_depth(root):
    if not root:
        return 0
    paths = []

    def walk(node, path):
        path = path + [node.val]
        if not node.left and not node.right:
            paths.append(path)
        if node.left:
            walk(node.left, path)
        if node.right:
            walk(node.right, path)

    walk(root, [])
    return max(len(p) for p in paths)
```

### Solution
type: optimal
name: Recursive DFS
time: O(n)
space: O(h) recursion stack

```javascript
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

```java
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

```python
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

### Solution
type: alternate
name: Level-order BFS
time: O(n)
space: O(w) — widest level

```javascript
function maxDepth(root) {
  if (!root) return 0;
  let level = [root];
  let depth = 0;
  while (level.length) {
    depth++;
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return depth;
}
```

```java
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    int depth = 0;
    while (!queue.isEmpty()) {
        depth++;
        for (int i = queue.size(); i > 0; i--) {
            TreeNode node = queue.poll();
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return depth;
}
```

```python
from collections import deque

def max_depth(root):
    if not root:
        return 0
    queue = deque([root])
    depth = 0
    while queue:
        depth += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth
```

### Tests

```json
{
  "fn": "maxDepth",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[3,9,20,null,null,15,7]],"expect":3},
    {"args":[[1,null,2]],"expect":2},
    {"args":[[]],"expect":0}
  ]
}
```

## Invert Binary Tree
difficulty: easy
faq: true
tags: tree, dfs, recursion

### Question
Given the `root` of a binary tree, invert it (mirror it left-to-right) and return its root.

**Example:** `[4, 2, 7, 1, 3, 6, 9]` → `[4, 7, 2, 9, 6, 3, 1]`.

### Answer
At every node, swap its left and right children, then invert both subtrees recursively. Every node is visited once.

### Explanation
Mirroring a tree means mirroring each subtree and swapping them. The recursion is:

```
invert(node):
  if node is null: return null
  swap(node.left, node.right)
  invert(node.left); invert(node.right)
  return node
```

Order doesn't matter — pre-order, post-order or BFS all work, as long as every node gets its children swapped exactly once.

### Solution
type: brute
name: Build a mirrored copy
time: O(n)
space: O(n) new nodes

Creates a brand-new mirrored tree instead of modifying in place — same time, but allocates n new nodes.

```javascript
function invertTree(root) {
  if (!root) return null;
  return new TreeNode(root.val, invertTree(root.right), invertTree(root.left));
}
```

```java
public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    return new TreeNode(root.val, invertTree(root.right), invertTree(root.left));
}
```

```python
def invert_tree(root):
    if not root:
        return None
    return TreeNode(root.val, invert_tree(root.right), invert_tree(root.left))
```

### Solution
type: optimal
name: Swap children recursively (in place)
time: O(n)
space: O(h) recursion stack

```javascript
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
```

```java
public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    TreeNode tmp = root.left;
    root.left = root.right;
    root.right = tmp;
    invertTree(root.left);
    invertTree(root.right);
    return root;
}
```

```python
def invert_tree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)
    return root
```

### Solution
type: alternate
name: Iterative BFS
time: O(n)
space: O(w)

```javascript
function invertTree(root) {
  const queue = root ? [root] : [];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    [node.left, node.right] = [node.right, node.left];
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return root;
}
```

```java
public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        TreeNode tmp = node.left;
        node.left = node.right;
        node.right = tmp;
        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
    return root;
}
```

```python
from collections import deque

def invert_tree(root):
    queue = deque([root] if root else [])
    while queue:
        node = queue.popleft()
        node.left, node.right = node.right, node.left
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return root
```

### Tests

```json
{
  "fn": "invertTree",
  "opts": {"in":["tree"],"out":"tree"},
  "cases": [
    {"args":[[4,2,7,1,3,6,9]],"expect":[4,7,2,9,6,3,1]},
    {"args":[[2,1,3]],"expect":[2,3,1]},
    {"args":[[]],"expect":[]}
  ]
}
```

## Same Tree
difficulty: easy
faq: false
tags: tree, dfs, recursion

### Question
Given the roots of two binary trees `p` and `q`, return `true` if they are structurally identical and every corresponding node has the same value.

**Example:** `p = [1, 2, 3]`, `q = [1, 2, 3]` → `true`; `p = [1, 2]`, `q = [1, null, 2]` → `false`.

### Answer
Compare recursively: two empty trees are equal; if exactly one is empty or the root values differ, they're not; otherwise both left subtrees and both right subtrees must be the same.

### Explanation
```
same(p, q):
  if both null → true
  if one null or p.val != q.val → false
  return same(p.left, q.left) and same(p.right, q.right)
```

Short-circuiting stops at the first difference. This helper is also the building block for *Subtree of Another Tree* and *Symmetric Tree*.

### Solution
type: brute
name: Serialize both trees and compare
time: O(n + m)
space: O(n + m)

Serialize with explicit null markers (otherwise different shapes can produce the same string) and compare the strings.

```javascript
function isSameTree(p, q) {
  const serialize = (node) => (node ? `(${node.val},${serialize(node.left)},${serialize(node.right)})` : '#');
  return serialize(p) === serialize(q);
}
```

```java
public boolean isSameTree(TreeNode p, TreeNode q) {
    return serialize(p).equals(serialize(q));
}

private String serialize(TreeNode node) {
    if (node == null) return "#";
    return "(" + node.val + "," + serialize(node.left) + "," + serialize(node.right) + ")";
}
```

```python
def is_same_tree(p, q):
    def serialize(node):
        if not node:
            return "#"
        return f"({node.val},{serialize(node.left)},{serialize(node.right)})"

    return serialize(p) == serialize(q)
```

### Solution
type: optimal
name: Simultaneous recursive comparison
time: O(min(n, m))
space: O(min(h1, h2)) recursion stack

```javascript
function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

```java
public boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null || p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

```python
def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)
```

### Tests

```json
{
  "fn": "isSameTree",
  "opts": {"in":["tree","tree"]},
  "cases": [
    {"args":[[1,2,3],[1,2,3]],"expect":true},
    {"args":[[1,2],[1,null,2]],"expect":false},
    {"args":[[1,2,1],[1,1,2]],"expect":false},
    {"args":[[],[]],"expect":true},
    {"args":[[12],[1,2]],"expect":false}
  ]
}
```

## Diameter of Binary Tree
difficulty: easy
faq: true
tags: tree, dfs, recursion

### Question
Given the `root` of a binary tree, return the length of its diameter — the number of **edges** on the longest path between any two nodes. The path may or may not pass through the root.

**Example:** `root = [1, 2, 3, 4, 5]` → `3` (path `4 → 2 → 1 → 3` or `5 → 2 → 1 → 3`).

### Answer
The longest path through a node is `height(left) + height(right)`. Compute heights bottom-up in a single DFS, and at each node update a global best with `leftHeight + rightHeight`.

### Explanation
Every path has a single highest node where it "bends". For that node, the longest path bending there goes down the tallest left branch and the tallest right branch.

DFS returns the height of each subtree (in nodes). At each node:
1. `left = dfs(node.left)`, `right = dfs(node.right)`.
2. `best = max(best, left + right)` — edges through this node.
3. Return `1 + max(left, right)`.

Computing height separately at every node (the brute force) repeats work, giving O(n²).

### Solution
type: brute
name: Recompute heights at every node
time: O(n²) worst case
space: O(h)

```javascript
function diameterOfBinaryTree(root) {
  const height = (node) => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0);
  if (!root) return 0;
  const through = height(root.left) + height(root.right);
  return Math.max(through, diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right));
}
```

```java
public int diameterOfBinaryTree(TreeNode root) {
    if (root == null) return 0;
    int through = height(root.left) + height(root.right);
    return Math.max(through, Math.max(diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right)));
}

private int height(TreeNode node) {
    return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
}
```

```python
def diameter_of_binary_tree(root):
    def height(node):
        return 1 + max(height(node.left), height(node.right)) if node else 0

    if not root:
        return 0
    through = height(root.left) + height(root.right)
    return max(through, diameter_of_binary_tree(root.left), diameter_of_binary_tree(root.right))
```

### Solution
type: optimal
name: Single DFS returning height
time: O(n)
space: O(h)

```javascript
function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}
```

```java
private int best;

public int diameterOfBinaryTree(TreeNode root) {
    best = 0;
    height(root);
    return best;
}

private int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
}
```

```python
def diameter_of_binary_tree(root):
    best = 0

    def height(node):
        nonlocal best
        if not node:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)

    height(root)
    return best
```

### Tests

```json
{
  "fn": "diameterOfBinaryTree",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[1,2,3,4,5]],"expect":3},
    {"args":[[1,2]],"expect":1},
    {"args":[[1,2,null,3,4,5,null,null,6,7,null,null,8]],"expect":6}
  ]
}
```

## Balanced Binary Tree
difficulty: easy
faq: false
tags: tree, dfs, recursion

### Question
Given a binary tree, determine whether it is **height-balanced**: for every node, the heights of its left and right subtrees differ by at most one.

**Example:** `[3, 9, 20, null, null, 15, 7]` → `true`; `[1, 2, 2, 3, 3, null, null, 4, 4]` → `false`.

### Answer
Compute heights bottom-up and propagate a sentinel (`-1`) as soon as any subtree is unbalanced. Each node is visited once, so it's O(n) instead of recomputing heights top-down.

### Explanation
`check(node)` returns the subtree's height, or `-1` if it's unbalanced:

1. Empty node → `0`.
2. `left = check(node.left)`; if `-1`, return `-1`. Same for `right`.
3. If `|left - right| > 1`, return `-1`.
4. Otherwise return `1 + max(left, right)`.

The tree is balanced iff `check(root) != -1`. The top-down version calls `height` from every node, redoing the same work — O(n²) on skewed trees.

### Solution
type: brute
name: Top-down height checks
time: O(n²) worst case
space: O(h)

```javascript
function isBalanced(root) {
  const height = (node) => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0);
  if (!root) return true;
  return Math.abs(height(root.left) - height(root.right)) <= 1 && isBalanced(root.left) && isBalanced(root.right);
}
```

```java
public boolean isBalanced(TreeNode root) {
    if (root == null) return true;
    return Math.abs(height(root.left) - height(root.right)) <= 1 && isBalanced(root.left) && isBalanced(root.right);
}

private int height(TreeNode node) {
    return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
}
```

```python
def is_balanced(root):
    def height(node):
        return 1 + max(height(node.left), height(node.right)) if node else 0

    if not root:
        return True
    return abs(height(root.left) - height(root.right)) <= 1 and is_balanced(root.left) and is_balanced(root.right)
```

### Solution
type: optimal
name: Bottom-up height with early exit
time: O(n)
space: O(h)

```javascript
function isBalanced(root) {
  const check = (node) => {
    if (!node) return 0;
    const left = check(node.left);
    if (left === -1) return -1;
    const right = check(node.right);
    if (right === -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  };
  return check(root) !== -1;
}
```

```java
public boolean isBalanced(TreeNode root) {
    return check(root) != -1;
}

private int check(TreeNode node) {
    if (node == null) return 0;
    int left = check(node.left);
    if (left == -1) return -1;
    int right = check(node.right);
    if (right == -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
}
```

```python
def is_balanced(root):
    def check(node):
        if not node:
            return 0
        left = check(node.left)
        if left == -1:
            return -1
        right = check(node.right)
        if right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)

    return check(root) != -1
```

### Tests

```json
{
  "fn": "isBalanced",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[3,9,20,null,null,15,7]],"expect":true},
    {"args":[[1,2,2,3,3,null,null,4,4]],"expect":false},
    {"args":[[]],"expect":true},
    {"args":[[1,2,2,3,null,null,3,4,null,null,4]],"expect":false}
  ]
}
```

## Binary Tree Level Order Traversal
difficulty: medium
faq: true
tags: tree, bfs

### Question
Given the `root` of a binary tree, return the level-order traversal of its nodes' values — left to right, level by level — as a list of lists.

**Example:** `[3, 9, 20, null, null, 15, 7]` → `[[3], [9, 20], [15, 7]]`.

### Answer
BFS with a queue, processing one level at a time: record the queue's size at the start of each level, pop exactly that many nodes into the level's list, and enqueue their children for the next level.

### Explanation
1. Start with `queue = [root]`.
2. While the queue isn't empty: `size = queue.length`; pop `size` nodes, append their values to `level`, push their non-null children.
3. Append `level` to the result.

Snapshotting `size` is what separates levels — children added during the loop belong to the next level. A DFS that passes `depth` and appends to `result[depth]` also works.

### Solution
type: brute
name: One pass per level
time: O(n · h)
space: O(h)

Compute the height, then for each depth `d` walk the tree and collect nodes at depth `d`. Revisits the upper levels repeatedly.

```javascript
function levelOrder(root) {
  const height = (node) => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0);
  const collect = (node, depth, out) => {
    if (!node) return;
    if (depth === 0) out.push(node.val);
    collect(node.left, depth - 1, out);
    collect(node.right, depth - 1, out);
  };
  const result = [];
  for (let d = 0; d < height(root); d++) {
    const level = [];
    collect(root, d, level);
    result.push(level);
  }
  return result;
}
```

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    int h = height(root);
    for (int d = 0; d < h; d++) {
        List<Integer> level = new ArrayList<>();
        collect(root, d, level);
        result.add(level);
    }
    return result;
}

private int height(TreeNode node) {
    return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
}

private void collect(TreeNode node, int depth, List<Integer> out) {
    if (node == null) return;
    if (depth == 0) out.add(node.val);
    collect(node.left, depth - 1, out);
    collect(node.right, depth - 1, out);
}
```

```python
def level_order(root):
    def height(node):
        return 1 + max(height(node.left), height(node.right)) if node else 0

    def collect(node, depth, out):
        if not node:
            return
        if depth == 0:
            out.append(node.val)
        collect(node.left, depth - 1, out)
        collect(node.right, depth - 1, out)

    result = []
    for d in range(height(root)):
        level = []
        collect(root, d, level)
        result.append(level)
    return result
```

### Solution
type: optimal
name: BFS level by level
time: O(n)
space: O(w)

```javascript
function levelOrder(root) {
  const result = [];
  let level = root ? [root] : [];
  while (level.length) {
    result.push(level.map((node) => node.val));
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return result;
}
```

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int i = queue.size(); i > 0; i--) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}
```

```python
from collections import deque

def level_order(root):
    result = []
    queue = deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
```

### Tests

```json
{
  "fn": "levelOrder",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[3,9,20,null,null,15,7]],"expect":[[3],[9,20],[15,7]]},
    {"args":[[1]],"expect":[[1]]},
    {"args":[[]],"expect":[]}
  ]
}
```

## Binary Tree Right Side View
difficulty: medium
faq: false
tags: tree, bfs, dfs

### Question
Imagine standing on the right side of a binary tree. Return the values of the nodes you can see, ordered from top to bottom — i.e. the last node of every level.

**Example:** `[1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`.

### Answer
Do a level-order BFS and take the **last** node of each level. Equivalently, DFS visiting the right child first and record the first node seen at each new depth.

### Explanation
**BFS:** process level by level; after popping all nodes of a level, the last one popped is the rightmost visible node.

**DFS (right-first):** `dfs(node, depth)` — if `depth == result.length`, this is the first node reached at this depth, and since we go right first it's the rightmost one; push it. Then recurse `right`, then `left`.

Note the view isn't just the right spine: a deeper left node is visible when the right side is shorter (`4` below `5` in some trees).

### Solution
type: brute
name: Full level order, then take each level's last value
time: O(n)
space: O(n) — stores every level

```javascript
function rightSideView(root) {
  const levels = [];
  const walk = (node, depth) => {
    if (!node) return;
    (levels[depth] ??= []).push(node.val);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  return levels.map((level) => level[level.length - 1]);
}
```

```java
public List<Integer> rightSideView(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    walk(root, 0, levels);
    List<Integer> result = new ArrayList<>();
    for (List<Integer> level : levels) result.add(level.get(level.size() - 1));
    return result;
}

private void walk(TreeNode node, int depth, List<List<Integer>> levels) {
    if (node == null) return;
    if (levels.size() == depth) levels.add(new ArrayList<>());
    levels.get(depth).add(node.val);
    walk(node.left, depth + 1, levels);
    walk(node.right, depth + 1, levels);
}
```

```python
def right_side_view(root):
    levels = []

    def walk(node, depth):
        if not node:
            return
        if len(levels) == depth:
            levels.append([])
        levels[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return [level[-1] for level in levels]
```

### Solution
type: optimal
name: BFS, keep the last node per level
time: O(n)
space: O(w)

```javascript
function rightSideView(root) {
  const result = [];
  let level = root ? [root] : [];
  while (level.length) {
    result.push(level[level.length - 1].val);
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return result;
}
```

```java
public List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) result.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return result;
}
```

```python
from collections import deque

def right_side_view(root):
    result = []
    queue = deque([root] if root else [])
    while queue:
        size = len(queue)
        for i in range(size):
            node = queue.popleft()
            if i == size - 1:
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return result
```

### Solution
type: alternate
name: Right-first DFS
time: O(n)
space: O(h)

```javascript
function rightSideView(root) {
  const result = [];
  const dfs = (node, depth) => {
    if (!node) return;
    if (depth === result.length) result.push(node.val);
    dfs(node.right, depth + 1);
    dfs(node.left, depth + 1);
  };
  dfs(root, 0);
  return result;
}
```

```java
public List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    dfs(root, 0, result);
    return result;
}

private void dfs(TreeNode node, int depth, List<Integer> result) {
    if (node == null) return;
    if (depth == result.size()) result.add(node.val);
    dfs(node.right, depth + 1, result);
    dfs(node.left, depth + 1, result);
}
```

```python
def right_side_view(root):
    result = []

    def dfs(node, depth):
        if not node:
            return
        if depth == len(result):
            result.append(node.val)
        dfs(node.right, depth + 1)
        dfs(node.left, depth + 1)

    dfs(root, 0)
    return result
```

### Tests

```json
{
  "fn": "rightSideView",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[1,2,3,null,5,null,4]],"expect":[1,3,4]},
    {"args":[[1,2,3,4]],"expect":[1,3,4]},
    {"args":[[]],"expect":[]}
  ]
}
```

## Validate Binary Search Tree
difficulty: medium
faq: true
tags: tree, bst, dfs

### Question
Given the `root` of a binary tree, determine whether it is a valid binary search tree: every node's left subtree contains only values **strictly less** than the node, its right subtree only values **strictly greater**, and both subtrees are BSTs themselves.

**Example:** `[2, 1, 3]` → `true`; `[5, 1, 4, null, null, 3, 6]` → `false` (4 is in 5's right subtree but less than 5).

### Answer
Pass down an allowed range `(low, high)`. The root can be anything; going left tightens the upper bound to the parent's value, going right tightens the lower bound. Every node must lie strictly inside its range.

### Explanation
Checking only `left.val < node.val < right.val` is the classic mistake — it misses a deep node that violates an ancestor (like `3` under `4` under `5` above).

```
valid(node, low, high):
  if node is null → true
  if not (low < node.val < high) → false
  return valid(node.left, low, node.val) and valid(node.right, node.val, high)
```

Start with `(-∞, +∞)`. Alternative: an in-order traversal of a BST is strictly increasing, so compare each value with the previous one.

### Solution
type: brute
name: Compare every node against its whole subtrees
time: O(n²) worst case
space: O(h)

For each node, check that the max of its left subtree is smaller and the min of its right subtree is larger.

```javascript
function isValidBST(root) {
  const min = (node) => (node ? Math.min(node.val, min(node.left), min(node.right)) : Infinity);
  const max = (node) => (node ? Math.max(node.val, max(node.left), max(node.right)) : -Infinity);
  if (!root) return true;
  if (max(root.left) >= root.val || min(root.right) <= root.val) return false;
  return isValidBST(root.left) && isValidBST(root.right);
}
```

```java
public boolean isValidBST(TreeNode root) {
    if (root == null) return true;
    if (max(root.left) >= root.val || min(root.right) <= root.val) return false;
    return isValidBST(root.left) && isValidBST(root.right);
}

private long min(TreeNode node) {
    return node == null ? Long.MAX_VALUE : Math.min(node.val, Math.min(min(node.left), min(node.right)));
}

private long max(TreeNode node) {
    return node == null ? Long.MIN_VALUE : Math.max(node.val, Math.max(max(node.left), max(node.right)));
}
```

```python
def is_valid_bst(root):
    def lo(node):
        return min(node.val, lo(node.left), lo(node.right)) if node else float("inf")

    def hi(node):
        return max(node.val, hi(node.left), hi(node.right)) if node else float("-inf")

    if not root:
        return True
    if hi(root.left) >= root.val or lo(root.right) <= root.val:
        return False
    return is_valid_bst(root.left) and is_valid_bst(root.right)
```

### Solution
type: optimal
name: Recursive range (min/max bounds)
time: O(n)
space: O(h)

```javascript
function isValidBST(root, low = -Infinity, high = Infinity) {
  if (!root) return true;
  if (root.val <= low || root.val >= high) return false;
  return isValidBST(root.left, low, root.val) && isValidBST(root.right, root.val, high);
}
```

```java
public boolean isValidBST(TreeNode root) {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean valid(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
}
```

```python
def is_valid_bst(root, low=float("-inf"), high=float("inf")):
    if not root:
        return True
    if not low < root.val < high:
        return False
    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)
```

### Solution
type: alternate
name: In-order traversal must be strictly increasing
time: O(n)
space: O(h)

```javascript
function isValidBST(root) {
  const stack = [];
  let prev = -Infinity;
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (node.val <= prev) return false;
    prev = node.val;
    node = node.right;
  }
  return true;
}
```

```java
public boolean isValidBST(TreeNode root) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    Integer prev = null;
    TreeNode node = root;
    while (node != null || !stack.isEmpty()) {
        while (node != null) {
            stack.push(node);
            node = node.left;
        }
        node = stack.pop();
        if (prev != null && node.val <= prev) return false;
        prev = node.val;
        node = node.right;
    }
    return true;
}
```

```python
def is_valid_bst(root):
    stack, prev, node = [], float("-inf"), root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        if node.val <= prev:
            return False
        prev = node.val
        node = node.right
    return True
```

### Tests

```json
{
  "fn": "isValidBST",
  "py": "is_valid_bst",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[2,1,3]],"expect":true},
    {"args":[[5,1,4,null,null,3,6]],"expect":false},
    {"args":[[2,2,2]],"expect":false},
    {"args":[[5,4,6,null,null,3,7]],"expect":false},
    {"args":[[2147483647]],"expect":true},
    {"args":[[-2147483648,null,2147483647]],"expect":true}
  ]
}
```

## Lowest Common Ancestor of a Binary Search Tree
difficulty: medium
faq: true
tags: tree, bst

### Question
Given a binary search tree and two nodes `p` and `q` in it, return their lowest common ancestor — the deepest node that has both `p` and `q` as descendants (a node counts as a descendant of itself).

**Example:** BST `[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]`, `p = 2`, `q = 8` → `6`; `p = 2`, `q = 4` → `2`.

### Answer
Walk down from the root using the BST ordering. If both values are smaller than the current node, the LCA is in the left subtree; if both are larger, it's in the right. Otherwise they split here (or one of them *is* this node), so the current node is the LCA.

### Explanation
In a BST, all of a node's left descendants are smaller and all right descendants larger. So while `p` and `q` are on the same side of the current node, the LCA must be on that side too. The first node where they diverge — `min(p, q) <= node.val <= max(p, q)` — is the answer.

This runs in O(h) with O(1) space iteratively. (For a general binary tree without ordering, see the recursive "return the node if found in both subtrees" approach.)

### Solution
type: brute
name: Compare root-to-node paths
time: O(h)
space: O(h)

Record the path from the root to `p` and to `q`, then return the last node the two paths share. Works, but stores both paths.

```javascript
function lowestCommonAncestor(root, p, q) {
  const path = (target) => {
    const nodes = [];
    let node = root;
    while (node) {
      nodes.push(node);
      if (target.val === node.val) break;
      node = target.val < node.val ? node.left : node.right;
    }
    return nodes;
  };
  const a = path(p);
  const b = path(q);
  let i = 0;
  while (i + 1 < a.length && i + 1 < b.length && a[i + 1] === b[i + 1]) i++;
  return a[i];
}
```

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    List<TreeNode> a = path(root, p.val), b = path(root, q.val);
    int i = 0;
    while (i + 1 < a.size() && i + 1 < b.size() && a.get(i + 1) == b.get(i + 1)) i++;
    return a.get(i);
}

private List<TreeNode> path(TreeNode root, int target) {
    List<TreeNode> nodes = new ArrayList<>();
    TreeNode node = root;
    while (node != null) {
        nodes.add(node);
        if (node.val == target) break;
        node = target < node.val ? node.left : node.right;
    }
    return nodes;
}
```

```python
def lowest_common_ancestor(root, p, q):
    def path(target):
        nodes, node = [], root
        while node:
            nodes.append(node)
            if node.val == target.val:
                break
            node = node.left if target.val < node.val else node.right
        return nodes

    a, b = path(p), path(q)
    i = 0
    while i + 1 < len(a) and i + 1 < len(b) and a[i + 1] is b[i + 1]:
        i += 1
    return a[i]
```

### Solution
type: optimal
name: Walk down using BST ordering
time: O(h)
space: O(1)

```javascript
function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node;
  }
  return null;
}
```

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode node = root;
    while (node != null) {
        if (p.val < node.val && q.val < node.val) node = node.left;
        else if (p.val > node.val && q.val > node.val) node = node.right;
        else return node;
    }
    return null;
}
```

```python
def lowest_common_ancestor(root, p, q):
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left
        elif p.val > node.val and q.val > node.val:
            node = node.right
        else:
            return node
    return None
```

### Tests

```json
{
  "fn": "lowestCommonAncestor",
  "opts": {"in":["tree","node","node"],"out":"val"},
  "cases": [
    {"args":[[6,2,8,0,4,7,9,null,null,3,5],2,8],"expect":6},
    {"args":[[6,2,8,0,4,7,9,null,null,3,5],2,4],"expect":2},
    {"args":[[6,2,8,0,4,7,9,null,null,3,5],3,5],"expect":4},
    {"args":[[2,1],2,1],"expect":2}
  ]
}
```

## Kth Smallest Element in a BST
difficulty: medium
faq: true
tags: tree, bst, inorder

### Question
Given the `root` of a binary search tree and an integer `k`, return the `k`-th smallest value (1-indexed) among all node values.

**Example:** `root = [3, 1, 4, null, 2]`, `k = 1` → `1`; `root = [5, 3, 6, 2, 4, null, null, 1]`, `k = 3` → `3`.

### Answer
An in-order traversal of a BST visits values in sorted order. Traverse iteratively with a stack and stop as soon as you've popped the `k`-th node — no need to visit the rest of the tree.

### Explanation
Iterative in-order:
1. Push nodes while going left as far as possible.
2. Pop a node — it's the next smallest. Decrement `k`; if it hits 0, return this value.
3. Move to the popped node's right child and repeat.

This costs O(h + k): O(h) to reach the minimum, then one step per visited node. Follow-up: if the tree is modified often and queried often, store subtree sizes in each node to answer in O(h).

### Solution
type: brute
name: Full in-order traversal into an array
time: O(n)
space: O(n)

```javascript
function kthSmallest(root, k) {
  const values = [];
  const inorder = (node) => {
    if (!node) return;
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  };
  inorder(root);
  return values[k - 1];
}
```

```java
public int kthSmallest(TreeNode root, int k) {
    List<Integer> values = new ArrayList<>();
    inorder(root, values);
    return values.get(k - 1);
}

private void inorder(TreeNode node, List<Integer> values) {
    if (node == null) return;
    inorder(node.left, values);
    values.add(node.val);
    inorder(node.right, values);
}
```

```python
def kth_smallest(root, k):
    values = []

    def inorder(node):
        if not node:
            return
        inorder(node.left)
        values.append(node.val)
        inorder(node.right)

    inorder(root)
    return values[k - 1]
```

### Solution
type: optimal
name: Iterative in-order with early stop
time: O(h + k)
space: O(h)

```javascript
function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}
```

```java
public int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !stack.isEmpty()) {
        while (node != null) {
            stack.push(node);
            node = node.left;
        }
        node = stack.pop();
        if (--k == 0) return node.val;
        node = node.right;
    }
    return -1;
}
```

```python
def kth_smallest(root, k):
    stack, node = [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right
    return -1
```

### Tests

```json
{
  "fn": "kthSmallest",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[3,1,4,null,2],1],"expect":1},
    {"args":[[5,3,6,2,4,null,null,1],3],"expect":3},
    {"args":[[5,3,6,2,4,null,null,1],6],"expect":6}
  ]
}
```

## Binary Tree Maximum Path Sum
difficulty: hard
faq: true
tags: tree, dfs, dynamic-programming

### Question
A path in a binary tree is any sequence of adjacent nodes where each node appears at most once; it doesn't need to pass through the root. Given the `root`, return the maximum sum of node values over all non-empty paths. Values may be negative.

**Example:** `[1, 2, 3]` → `6`; `[-10, 9, 20, null, null, 15, 7]` → `42` (path `15 → 20 → 7`).

### Answer
DFS returning each node's best **downward** gain (`node.val + max(0, leftGain, rightGain)` — a path going down can use only one branch). At each node, also consider the path that bends there: `node.val + max(0, leftGain) + max(0, rightGain)`, and track the global maximum.

### Explanation
Two different quantities per node:

- **Returned to the parent:** the best path starting here and going *down one side* — the parent can only extend one branch. Negative branches are dropped with `max(0, …)`.
- **Candidate answer:** the best path whose highest point is this node, which may use *both* sides.

1. `gain(node)`: if null return 0. `left = max(0, gain(node.left))`, `right = max(0, gain(node.right))`.
2. `best = max(best, node.val + left + right)`.
3. Return `node.val + max(left, right)`.

Initialise `best` to `-∞` (not 0) so an all-negative tree returns its largest single value.

### Solution
type: brute
name: Treat every node as the path's top
time: O(n²)
space: O(h)

For every node, compute its best downward gains from scratch and combine both sides.

```javascript
function maxPathSum(root) {
  const down = (node) => (node ? node.val + Math.max(0, down(node.left), down(node.right)) : 0);
  let best = -Infinity;
  const visit = (node) => {
    if (!node) return;
    best = Math.max(best, node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right)));
    visit(node.left);
    visit(node.right);
  };
  visit(root);
  return best;
}
```

```java
private int bestBrute;

public int maxPathSum(TreeNode root) {
    bestBrute = Integer.MIN_VALUE;
    visit(root);
    return bestBrute;
}

private void visit(TreeNode node) {
    if (node == null) return;
    bestBrute = Math.max(bestBrute, node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right)));
    visit(node.left);
    visit(node.right);
}

private int down(TreeNode node) {
    if (node == null) return 0;
    return node.val + Math.max(0, Math.max(down(node.left), down(node.right)));
}
```

```python
def max_path_sum(root):
    def down(node):
        return node.val + max(0, down(node.left), down(node.right)) if node else 0

    best = float("-inf")

    def visit(node):
        nonlocal best
        if not node:
            return
        best = max(best, node.val + max(0, down(node.left)) + max(0, down(node.right)))
        visit(node.left)
        visit(node.right)

    visit(root)
    return best
```

### Solution
type: optimal
name: Post-order DFS returning single-branch gain
time: O(n)
space: O(h)

```javascript
function maxPathSum(root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const left = Math.max(0, gain(node.left));
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  };
  gain(root);
  return best;
}
```

```java
private int best;

public int maxPathSum(TreeNode root) {
    best = Integer.MIN_VALUE;
    gain(root);
    return best;
}

private int gain(TreeNode node) {
    if (node == null) return 0;
    int left = Math.max(0, gain(node.left));
    int right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
}
```

```python
def max_path_sum(root):
    best = float("-inf")

    def gain(node):
        nonlocal best
        if not node:
            return 0
        left = max(0, gain(node.left))
        right = max(0, gain(node.right))
        best = max(best, node.val + left + right)
        return node.val + max(left, right)

    gain(root)
    return best
```

### Tests

```json
{
  "fn": "maxPathSum",
  "opts": {"in":["tree"]},
  "cases": [
    {"args":[[1,2,3]],"expect":6},
    {"args":[[-10,9,20,null,null,15,7]],"expect":42},
    {"args":[[-3]],"expect":-3},
    {"args":[[2,-1]],"expect":2},
    {"args":[[-2,-1]],"expect":-1}
  ]
}
```

## Construct Binary Tree from Preorder and Inorder Traversal
difficulty: medium
faq: false
tags: tree, recursion, hash-map, divide-and-conquer

### Question
Given two integer arrays `preorder` and `inorder` — the preorder and inorder traversals of the same binary tree with **unique** values — construct and return the tree.

**Example:** `preorder = [3, 9, 20, 15, 7]`, `inorder = [9, 3, 15, 20, 7]` → `[3, 9, 20, null, null, 15, 7]`.

### Answer
The first preorder value is the root. Its position in the inorder array splits the remaining values into the left subtree (everything before it) and the right subtree (everything after). Recurse on each side, using a hash map from value to inorder index so each split is O(1).

### Explanation
1. Build `indexOf[value] = position in inorder`.
2. Keep a global pointer `pre` into `preorder`. `build(lo, hi)` constructs the subtree whose inorder range is `[lo, hi]`:
   - If `lo > hi` return null.
   - `rootVal = preorder[pre++]`, `mid = indexOf[rootVal]`.
   - `root.left = build(lo, mid - 1)`, then `root.right = build(mid + 1, hi)` — left before right, matching preorder's order.
3. Return `build(0, n - 1)`.

Without the map, finding the root in the inorder array is O(n) per node, so O(n²) overall.

### Solution
type: brute
name: Slice arrays and search linearly
time: O(n²)
space: O(n²) from slicing

```javascript
function buildTree(preorder, inorder) {
  if (preorder.length === 0) return null;
  const rootVal = preorder[0];
  const mid = inorder.indexOf(rootVal);
  return new TreeNode(
    rootVal,
    buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid)),
    buildTree(preorder.slice(mid + 1), inorder.slice(mid + 1)),
  );
}
```

```java
public TreeNode buildTree(int[] preorder, int[] inorder) {
    if (preorder.length == 0) return null;
    int rootVal = preorder[0], mid = 0;
    while (inorder[mid] != rootVal) mid++;
    TreeNode root = new TreeNode(rootVal);
    root.left = buildTree(Arrays.copyOfRange(preorder, 1, mid + 1), Arrays.copyOfRange(inorder, 0, mid));
    root.right = buildTree(
        Arrays.copyOfRange(preorder, mid + 1, preorder.length),
        Arrays.copyOfRange(inorder, mid + 1, inorder.length));
    return root;
}
```

```python
def build_tree(preorder, inorder):
    if not preorder:
        return None
    root_val = preorder[0]
    mid = inorder.index(root_val)
    return TreeNode(
        root_val,
        build_tree(preorder[1 : mid + 1], inorder[:mid]),
        build_tree(preorder[mid + 1 :], inorder[mid + 1 :]),
    )
```

### Solution
type: optimal
name: Recursion with an inorder index map
time: O(n)
space: O(n)

```javascript
function buildTree(preorder, inorder) {
  const indexOf = new Map(inorder.map((value, i) => [value, i]));
  let pre = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const rootVal = preorder[pre++];
    const mid = indexOf.get(rootVal);
    const root = new TreeNode(rootVal);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}
```

```java
private Map<Integer, Integer> indexOf;
private int pre;

public TreeNode buildTree(int[] preorder, int[] inorder) {
    indexOf = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) indexOf.put(inorder[i], i);
    pre = 0;
    return build(preorder, 0, inorder.length - 1);
}

private TreeNode build(int[] preorder, int lo, int hi) {
    if (lo > hi) return null;
    int rootVal = preorder[pre++];
    int mid = indexOf.get(rootVal);
    TreeNode root = new TreeNode(rootVal);
    root.left = build(preorder, lo, mid - 1);
    root.right = build(preorder, mid + 1, hi);
    return root;
}
```

```python
def build_tree(preorder, inorder):
    index_of = {value: i for i, value in enumerate(inorder)}
    pre = 0

    def build(lo, hi):
        nonlocal pre
        if lo > hi:
            return None
        root_val = preorder[pre]
        pre += 1
        mid = index_of[root_val]
        root = TreeNode(root_val)
        root.left = build(lo, mid - 1)
        root.right = build(mid + 1, hi)
        return root

    return build(0, len(inorder) - 1)
```

### Tests

```json
{
  "fn": "buildTree",
  "opts": {"out":"tree"},
  "cases": [
    {"args":[[3,9,20,15,7],[9,3,15,20,7]],"expect":[3,9,20,null,null,15,7]},
    {"args":[[-1],[-1]],"expect":[-1]},
    {"args":[[1,2,3],[3,2,1]],"expect":[1,2,null,3]}
  ]
}
```
