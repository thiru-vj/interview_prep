## Number of Islands
difficulty: medium
faq: true
tags: graph, grid, dfs, bfs, union-find

### Question
Given an `m × n` grid of `"1"` (land) and `"0"` (water), return the number of islands. An island is a group of land cells connected horizontally or vertically; the grid is surrounded by water.

**Example:**
```
11000
11000
00100
00011
```
→ `3`.

### Answer
Scan every cell. When you find unvisited land, that's a new island: increment the count and flood-fill (DFS or BFS) from it, marking every connected land cell as visited so it isn't counted again.

### Explanation
Treat the grid as a graph whose nodes are land cells and whose edges connect horizontal/vertical neighbours; the answer is the number of connected components.

1. For each cell `(r, c)` with `grid[r][c] == "1"`: `count++`, then `sink(r, c)`.
2. `sink` sets the cell to `"0"` and recurses into the four neighbours that are in bounds and still `"1"`.

Overwriting land with water doubles as the visited set, so no extra memory is needed beyond the recursion stack. If mutating the input isn't allowed, keep a separate `visited` matrix. Every cell is processed a constant number of times: O(m · n).

### Solution
type: brute
name: BFS with a separate visited matrix
time: O(m · n)
space: O(m · n)

Same traversal, but leaves the input untouched at the cost of an extra `visited` matrix.

```javascript
function numIslands(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const visited = Array.from({ length: m }, () => new Array(n).fill(false));
  let count = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1' || visited[r][c]) continue;
      count++;
      const queue = [[r, c]];
      visited[r][c] = true;
      for (let i = 0; i < queue.length; i++) {
        const [cr, cc] = queue[i];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === '1' && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return count;
}
```

```java
public int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length, count = 0;
    boolean[][] visited = new boolean[m][n];
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1' || visited[r][c]) continue;
            count++;
            Deque<int[]> queue = new ArrayDeque<>();
            queue.offer(new int[] {r, c});
            visited[r][c] = true;
            while (!queue.isEmpty()) {
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1' && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        queue.offer(new int[] {nr, nc});
                    }
                }
            }
        }
    }
    return count;
}
```

```python
from collections import deque

def num_islands(grid):
    m, n = len(grid), len(grid[0])
    visited = [[False] * n for _ in range(m)]
    count = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] != "1" or visited[r][c]:
                continue
            count += 1
            visited[r][c] = True
            queue = deque([(r, c)])
            while queue:
                cr, cc = queue.popleft()
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == "1" and not visited[nr][nc]:
                        visited[nr][nc] = True
                        queue.append((nr, nc))
    return count
```

### Solution
type: optimal
name: DFS flood fill, sinking visited land
time: O(m · n)
space: O(m · n) worst-case recursion (all land), no visited matrix

```javascript
function numIslands(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
```

```java
public int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (grid[r][c] == '1') {
                count++;
                sink(grid, r, c);
            }
        }
    }
    return count;
}

private void sink(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
    grid[r][c] = '0';
    sink(grid, r + 1, c);
    sink(grid, r - 1, c);
    sink(grid, r, c + 1);
    sink(grid, r, c - 1);
}
```

```python
def num_islands(grid):
    m, n = len(grid), len(grid[0])

    def sink(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    count = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count
```

### Solution
type: alternate
name: Union-Find
time: O(m · n · α(m · n)) ≈ O(m · n)
space: O(m · n)

Start with one component per land cell and union each land cell with its right and bottom land neighbours; every successful union merges two islands. Shines when land is added incrementally (*Number of Islands II*).

```javascript
function numIslands(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const parent = Array.from({ length: m * n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let count = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) if (grid[r][c] === '1') count++;
  }
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      count--;
    }
  };
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1') continue;
      if (r + 1 < m && grid[r + 1][c] === '1') union(r * n + c, (r + 1) * n + c);
      if (c + 1 < n && grid[r][c + 1] === '1') union(r * n + c, r * n + c + 1);
    }
  }
  return count;
}
```

```java
private int[] parent;
private int count;

public int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length;
    parent = new int[m * n];
    count = 0;
    for (int i = 0; i < m * n; i++) {
        parent[i] = i;
        if (grid[i / n][i % n] == '1') count++;
    }
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            if (r + 1 < m && grid[r + 1][c] == '1') union(r * n + c, (r + 1) * n + c);
            if (c + 1 < n && grid[r][c + 1] == '1') union(r * n + c, r * n + c + 1);
        }
    }
    return count;
}

private int find(int x) {
    while (parent[x] != x) x = parent[x] = parent[parent[x]];
    return x;
}

private void union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra != rb) {
        parent[ra] = rb;
        count--;
    }
}
```

```python
def num_islands(grid):
    m, n = len(grid), len(grid[0])
    parent = list(range(m * n))
    count = sum(row.count("1") for row in grid)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for r in range(m):
        for c in range(n):
            if grid[r][c] != "1":
                continue
            for nr, nc in ((r + 1, c), (r, c + 1)):
                if nr < m and nc < n and grid[nr][nc] == "1":
                    ra, rb = find(r * n + c), find(nr * n + nc)
                    if ra != rb:
                        parent[ra] = rb
                        count -= 1
    return count
```

### Tests

```json
{
  "fn": "numIslands",
  "cases": [
    {"args":[[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]],"expect":1},
    {"args":[[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]],"expect":3},
    {"args":[[["0"]]],"expect":0},
    {"args":[[["1","0","1"],["0","1","0"],["1","0","1"]]],"expect":5}
  ]
}
```

## Clone Graph
difficulty: medium
faq: true
tags: graph, dfs, bfs, hash-map

### Question
Given a reference to a node in a connected undirected graph, return a **deep copy** of the graph. Each node has a `val` and a list of `neighbors`.

**Example:** adjacency list `[[2, 4], [1, 3], [2, 4], [1, 3]]` (node 1 is connected to 2 and 4, etc.) → an identical graph made of brand-new nodes.

### Answer
Traverse the graph (DFS or BFS) with a hash map from **original node → its clone**. When you reach a node, create its clone once, store it in the map, then clone its neighbours — reusing clones from the map for nodes already seen.

### Explanation
The map does two jobs: it prevents infinite loops on cycles, and it makes sure each original node maps to exactly one clone, so shared neighbours stay shared.

```
clone(node):
  if node in map: return map[node]
  copy = new Node(node.val)
  map[node] = copy            ← register BEFORE recursing (cycles!)
  for each neighbor: copy.neighbors.push(clone(neighbor))
  return copy
```

Every node and edge is processed once: O(V + E).

### Solution
type: brute
name: Two passes — create all nodes, then wire edges
time: O(V + E)
space: O(V)

First collect every node with a BFS and create its clone; then, in a second pass, copy each node's neighbour list using the map. Easier to reason about, but walks the graph twice.

```javascript
function cloneGraph(node) {
  if (!node) return null;
  const clones = new Map([[node, new Node(node.val)]]);
  const queue = [node];
  for (let i = 0; i < queue.length; i++) {
    for (const neighbor of queue[i].neighbors) {
      if (!clones.has(neighbor)) {
        clones.set(neighbor, new Node(neighbor.val));
        queue.push(neighbor);
      }
    }
  }
  for (const [original, copy] of clones) {
    copy.neighbors = original.neighbors.map((neighbor) => clones.get(neighbor));
  }
  return clones.get(node);
}
```

```java
public Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> clones = new HashMap<>();
    clones.put(node, new Node(node.val));
    Deque<Node> queue = new ArrayDeque<>(List.of(node));
    while (!queue.isEmpty()) {
        for (Node neighbor : queue.poll().neighbors) {
            if (!clones.containsKey(neighbor)) {
                clones.put(neighbor, new Node(neighbor.val));
                queue.offer(neighbor);
            }
        }
    }
    for (Map.Entry<Node, Node> e : clones.entrySet()) {
        for (Node neighbor : e.getKey().neighbors) e.getValue().neighbors.add(clones.get(neighbor));
    }
    return clones.get(node);
}
```

```python
from collections import deque

def clone_graph(node):
    if not node:
        return None
    clones = {node: Node(node.val)}
    queue = deque([node])
    while queue:
        for neighbor in queue.popleft().neighbors:
            if neighbor not in clones:
                clones[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
    for original, copy in clones.items():
        copy.neighbors = [clones[n] for n in original.neighbors]
    return clones[node]
```

### Solution
type: optimal
name: DFS with an original → clone map
time: O(V + E)
space: O(V)

```javascript
function cloneGraph(node) {
  const clones = new Map();
  const clone = (original) => {
    if (!original) return null;
    if (clones.has(original)) return clones.get(original);
    const copy = new Node(original.val);
    clones.set(original, copy);
    for (const neighbor of original.neighbors) copy.neighbors.push(clone(neighbor));
    return copy;
  };
  return clone(node);
}
```

```java
private final Map<Node, Node> clones = new HashMap<>();

public Node cloneGraph(Node node) {
    if (node == null) return null;
    if (clones.containsKey(node)) return clones.get(node);
    Node copy = new Node(node.val);
    clones.put(node, copy);
    for (Node neighbor : node.neighbors) copy.neighbors.add(cloneGraph(neighbor));
    return copy;
}
```

```python
def clone_graph(node):
    clones = {}

    def clone(original):
        if not original:
            return None
        if original in clones:
            return clones[original]
        copy = Node(original.val)
        clones[original] = copy
        for neighbor in original.neighbors:
            copy.neighbors.append(clone(neighbor))
        return copy

    return clone(node)
```

### Tests

```json
{
  "fn": "cloneGraph",
  "opts": {"in":["graph"],"out":"graph"},
  "cases": [
    {"args":[[[2,4],[1,3],[2,4],[1,3]]],"expect":[[2,4],[1,3],[2,4],[1,3]]},
    {"args":[[[]]],"expect":[[]]},
    {"args":[[]],"expect":[]}
  ]
}
```

## Max Area of Island
difficulty: medium
faq: false
tags: graph, grid, dfs

### Question
Given an `m × n` binary grid (`1` = land, `0` = water), return the area (number of cells) of the largest island, where islands connect horizontally and vertically. Return `0` if there is no land.

**Example:** a grid containing islands of sizes 4, 6 and 1 → `6`.

### Answer
Flood-fill each island once, like *Number of Islands*, but have the DFS **return the number of cells** it sank: `1 + dfs(up) + dfs(down) + dfs(left) + dfs(right)`. Track the maximum.

### Explanation
1. For each cell that is `1`, call `area(r, c)`.
2. `area` returns 0 for out-of-bounds or water; otherwise it sets the cell to `0` (visited) and returns `1` plus the areas of its four neighbours.
3. `best = max(best, area(r, c))`.

Each cell is sunk once, so the total is O(m · n).

### Solution
type: brute
name: Fresh BFS from every land cell
time: O((m · n)²)
space: O(m · n)

Measure the island around every single land cell independently, with its own visited set — cells of the same island are re-measured over and over.

```javascript
function maxAreaOfIsland(grid) {
  const m = grid.length;
  const n = grid[0].length;
  let best = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 1) continue;
      const seen = new Set([r * n + c]);
      const queue = [[r, c]];
      for (let i = 0; i < queue.length; i++) {
        const [cr, cc] = queue[i];
        for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
          if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1 && !seen.has(nr * n + nc)) {
            seen.add(nr * n + nc);
            queue.push([nr, nc]);
          }
        }
      }
      best = Math.max(best, seen.size);
    }
  }
  return best;
}
```

```java
public int maxAreaOfIsland(int[][] grid) {
    int m = grid.length, n = grid[0].length, best = 0;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) continue;
            Set<Integer> seen = new HashSet<>(List.of(r * n + c));
            Deque<int[]> queue = new ArrayDeque<>();
            queue.offer(new int[] {r, c});
            while (!queue.isEmpty()) {
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1 && seen.add(nr * n + nc)) {
                        queue.offer(new int[] {nr, nc});
                    }
                }
            }
            best = Math.max(best, seen.size());
        }
    }
    return best;
}
```

```python
from collections import deque

def max_area_of_island(grid):
    m, n = len(grid), len(grid[0])
    best = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] != 1:
                continue
            seen = {(r, c)}
            queue = deque([(r, c)])
            while queue:
                cr, cc = queue.popleft()
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1 and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        queue.append((nr, nc))
            best = max(best, len(seen))
    return best
```

### Solution
type: optimal
name: DFS returning the island size
time: O(m · n)
space: O(m · n) worst-case recursion

```javascript
function maxAreaOfIsland(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const area = (r, c) => {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== 1) return 0;
    grid[r][c] = 0;
    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
  };
  let best = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) best = Math.max(best, area(r, c));
  }
  return best;
}
```

```java
public int maxAreaOfIsland(int[][] grid) {
    int best = 0;
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) best = Math.max(best, area(grid, r, c));
    }
    return best;
}

private int area(int[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + area(grid, r + 1, c) + area(grid, r - 1, c) + area(grid, r, c + 1) + area(grid, r, c - 1);
}
```

```python
def max_area_of_island(grid):
    m, n = len(grid), len(grid[0])

    def area(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)

    return max(area(r, c) for r in range(m) for c in range(n))
```

### Tests

```json
{
  "fn": "maxAreaOfIsland",
  "cases": [
    {"args":[[[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]],"expect":6},
    {"args":[[[0,0,0,0,0,0,0,0]]],"expect":0},
    {"args":[[[1,1],[1,0]]],"expect":3}
  ]
}
```

## Rotting Oranges
difficulty: medium
faq: true
tags: graph, grid, bfs, multi-source-bfs

### Question
In a grid, `0` is empty, `1` is a fresh orange and `2` is a rotten orange. Every minute, each fresh orange adjacent (4-directionally) to a rotten one becomes rotten. Return the minimum minutes until no fresh orange remains, or `-1` if that's impossible.

**Example:** `[[2, 1, 1], [1, 1, 0], [0, 1, 1]]` → `4`; `[[2, 1, 1], [0, 1, 1], [1, 0, 1]]` → `-1`.

### Answer
**Multi-source BFS:** put *every* initially rotten orange in the queue at once, then process the queue level by level — each level is one minute. Count fresh oranges up front and decrement as they rot; if any remain at the end, return `-1`.

### Explanation
Rot spreads outward from all rotten oranges simultaneously, which is exactly BFS started from multiple sources: the BFS level at which a cell is reached is the minute it rots.

1. Queue all `2`s; count all `1`s as `fresh`.
2. While the queue is non-empty **and** `fresh > 0`: process one whole level, rotting each fresh neighbour (set it to `2`, `fresh--`, enqueue); then `minutes++`.
3. Return `fresh == 0 ? minutes : -1`.

Every cell is enqueued at most once: O(m · n).

### Solution
type: brute
name: Simulate minute by minute
time: O((m · n)²)
space: O(m · n)

Each minute, rescan the whole grid to find oranges that rot next. Stop when nothing changes.

```javascript
function orangesRotting(grid) {
  const m = grid.length;
  const n = grid[0].length;
  let minutes = 0;
  for (;;) {
    const toRot = [];
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] !== 1) continue;
        const adj = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]];
        if (adj.some(([nr, nc]) => nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 2)) toRot.push([r, c]);
      }
    }
    if (toRot.length === 0) break;
    for (const [r, c] of toRot) grid[r][c] = 2;
    minutes++;
  }
  return grid.some((row) => row.includes(1)) ? -1 : minutes;
}
```

```java
public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length, minutes = 0;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (true) {
        List<int[]> toRot = new ArrayList<>();
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != 1) continue;
                for (int[] d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 2) {
                        toRot.add(new int[] {r, c});
                        break;
                    }
                }
            }
        }
        if (toRot.isEmpty()) break;
        for (int[] cell : toRot) grid[cell[0]][cell[1]] = 2;
        minutes++;
    }
    for (int[] row : grid) {
        for (int cell : row) {
            if (cell == 1) return -1;
        }
    }
    return minutes;
}
```

```python
def oranges_rotting(grid):
    m, n = len(grid), len(grid[0])
    minutes = 0
    while True:
        to_rot = [
            (r, c)
            for r in range(m)
            for c in range(n)
            if grid[r][c] == 1
            and any(
                0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 2
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1))
            )
        ]
        if not to_rot:
            break
        for r, c in to_rot:
            grid[r][c] = 2
        minutes += 1
    return -1 if any(1 in row for row in grid) else minutes
```

### Solution
type: optimal
name: Multi-source BFS
time: O(m · n)
space: O(m · n)

```javascript
function orangesRotting(grid) {
  const m = grid.length;
  const n = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
```

```java
public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length, fresh = 0, minutes = 0;
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) queue.offer(new int[] {r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    }
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty() && fresh > 0) {
        for (int i = queue.size(); i > 0; i--) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.offer(new int[] {nr, nc});
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
```

```python
from collections import deque

def oranges_rotting(grid):
    m, n = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh > 0:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
```

### Tests

```json
{
  "fn": "orangesRotting",
  "cases": [
    {"args":[[[2,1,1],[1,1,0],[0,1,1]]],"expect":4},
    {"args":[[[2,1,1],[0,1,1],[1,0,1]]],"expect":-1},
    {"args":[[[0,2]]],"expect":0},
    {"args":[[[0]]],"expect":0},
    {"args":[[[1]]],"expect":-1}
  ]
}
```

## Course Schedule
difficulty: medium
faq: true
tags: graph, topological-sort, bfs, dfs, cycle-detection

### Question
There are `numCourses` courses labelled `0` to `numCourses - 1`. `prerequisites[i] = [a, b]` means you must take course `b` before course `a`. Return `true` if it's possible to finish all courses.

**Example:** `numCourses = 2`, `prerequisites = [[1, 0]]` → `true`; `prerequisites = [[1, 0], [0, 1]]` → `false`.

### Answer
Courses and prerequisites form a directed graph; all courses can be finished exactly when the graph has **no cycle**. Use **Kahn's algorithm**: repeatedly take courses with no remaining prerequisites (in-degree 0). If you manage to take all of them, there's no cycle.

### Explanation
1. Build an adjacency list `b → a` and an `inDegree` array.
2. Queue every course with `inDegree == 0`.
3. Pop a course, count it as taken, and decrement the in-degree of each course that depends on it; enqueue any that drop to 0.
4. Return `taken == numCourses`.

Courses on a cycle never reach in-degree 0, so they're never taken. O(V + E).

The DFS alternative marks nodes `unvisited / visiting / done`; reaching a `visiting` node again means a back edge — a cycle.

### Solution
type: brute
name: DFS cycle check from every course (no memo)
time: O(V · (V + E))
space: O(V + E)

For each course, run a fresh DFS that tracks the current path; revisiting a course on the path means a cycle. Without remembering finished courses, the same subgraphs are explored repeatedly.

```javascript
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) graph[b].push(a);
  const onPath = new Array(numCourses).fill(false);
  const hasCycle = (course) => {
    if (onPath[course]) return true;
    onPath[course] = true;
    const found = graph[course].some(hasCycle);
    onPath[course] = false;
    return found;
  };
  for (let course = 0; course < numCourses; course++) {
    if (hasCycle(course)) return false;
  }
  return true;
}
```

```java
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    for (int[] p : prerequisites) graph.get(p[1]).add(p[0]);
    boolean[] onPath = new boolean[numCourses];
    for (int course = 0; course < numCourses; course++) {
        if (hasCycle(graph, course, onPath)) return false;
    }
    return true;
}

private boolean hasCycle(List<List<Integer>> graph, int course, boolean[] onPath) {
    if (onPath[course]) return true;
    onPath[course] = true;
    for (int next : graph.get(course)) {
        if (hasCycle(graph, next, onPath)) return true;
    }
    onPath[course] = false;
    return false;
}
```

```python
def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        graph[b].append(a)
    on_path = [False] * num_courses

    def has_cycle(course):
        if on_path[course]:
            return True
        on_path[course] = True
        found = any(has_cycle(nxt) for nxt in graph[course])
        on_path[course] = False
        return found

    return not any(has_cycle(c) for c in range(num_courses))
```

### Solution
type: optimal
name: Kahn's algorithm (BFS topological sort)
time: O(V + E)
space: O(V + E)

```javascript
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    inDegree[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (inDegree[c] === 0) queue.push(c);
  let taken = 0;
  for (let i = 0; i < queue.length; i++) {
    taken++;
    for (const next of graph[queue[i]]) {
      if (--inDegree[next] === 0) queue.push(next);
    }
  }
  return taken === numCourses;
}
```

```java
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    int[] inDegree = new int[numCourses];
    for (int[] p : prerequisites) {
        graph.get(p[1]).add(p[0]);
        inDegree[p[0]]++;
    }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int c = 0; c < numCourses; c++) {
        if (inDegree[c] == 0) queue.offer(c);
    }
    int taken = 0;
    while (!queue.isEmpty()) {
        int course = queue.poll();
        taken++;
        for (int next : graph.get(course)) {
            if (--inDegree[next] == 0) queue.offer(next);
        }
    }
    return taken == numCourses;
}
```

```python
from collections import deque

def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1
    queue = deque(c for c in range(num_courses) if in_degree[c] == 0)
    taken = 0
    while queue:
        course = queue.popleft()
        taken += 1
        for nxt in graph[course]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)
    return taken == num_courses
```

### Solution
type: alternate
name: DFS with three-state coloring
time: O(V + E)
space: O(V + E)

`0` = unvisited, `1` = on the current DFS path, `2` = fully explored (known cycle-free). Hitting a `1` means a back edge. Marking `2` is the memo the brute force lacks.

```javascript
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) graph[b].push(a);
  const state = new Array(numCourses).fill(0);
  const hasCycle = (course) => {
    if (state[course] === 1) return true;
    if (state[course] === 2) return false;
    state[course] = 1;
    if (graph[course].some(hasCycle)) return true;
    state[course] = 2;
    return false;
  };
  for (let course = 0; course < numCourses; course++) {
    if (hasCycle(course)) return false;
  }
  return true;
}
```

```java
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    for (int[] p : prerequisites) graph.get(p[1]).add(p[0]);
    int[] state = new int[numCourses];
    for (int course = 0; course < numCourses; course++) {
        if (hasCycle(graph, course, state)) return false;
    }
    return true;
}

private boolean hasCycle(List<List<Integer>> graph, int course, int[] state) {
    if (state[course] == 1) return true;
    if (state[course] == 2) return false;
    state[course] = 1;
    for (int next : graph.get(course)) {
        if (hasCycle(graph, next, state)) return true;
    }
    state[course] = 2;
    return false;
}
```

```python
def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        graph[b].append(a)
    state = [0] * num_courses

    def has_cycle(course):
        if state[course] == 1:
            return True
        if state[course] == 2:
            return False
        state[course] = 1
        if any(has_cycle(nxt) for nxt in graph[course]):
            return True
        state[course] = 2
        return False

    return not any(has_cycle(c) for c in range(num_courses))
```

### Tests

```json
{
  "fn": "canFinish",
  "cases": [
    {"args":[2,[[1,0]]],"expect":true},
    {"args":[2,[[1,0],[0,1]]],"expect":false},
    {"args":[3,[[1,0],[2,1],[0,2]]],"expect":false},
    {"args":[5,[[1,4],[2,4],[3,1],[3,2]]],"expect":true},
    {"args":[1,[]],"expect":true}
  ]
}
```

## Course Schedule II
difficulty: medium
faq: false
tags: graph, topological-sort, bfs

### Question
Same setup as *Course Schedule*, but return **an ordering** of courses you can take to finish all of them. If there are several valid orders, return any; if it's impossible, return an empty array.

**Example:** `numCourses = 4`, `prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]` → `[0, 1, 2, 3]` or `[0, 2, 1, 3]`.

### Answer
Kahn's algorithm again — the order in which courses are dequeued **is** a valid topological order. If fewer than `numCourses` courses get dequeued, there's a cycle, so return `[]`.

### Explanation
1. Build `graph[b] → a` and in-degrees.
2. Start the queue with all in-degree-0 courses.
3. Each time you pop a course, append it to `order` and decrement its dependants' in-degrees, enqueueing those that reach 0.
4. `order.length == numCourses ? order : []`.

The DFS version produces a topological order by appending each course *after* all courses that depend on it are finished (post-order), then reversing.

### Solution
type: brute
name: Repeatedly scan for an available course
time: O(V · (V + E))
space: O(V + E)

Each round, scan all courses for one not yet taken whose prerequisites are all taken. If a round finds nothing, the rest are blocked by a cycle.

```javascript
function findOrder(numCourses, prerequisites) {
  const needs = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) needs[a].push(b);
  const taken = new Array(numCourses).fill(false);
  const order = [];
  while (order.length < numCourses) {
    const next = needs.findIndex((reqs, c) => !taken[c] && reqs.every((r) => taken[r]));
    if (next === -1) return [];
    taken[next] = true;
    order.push(next);
  }
  return order;
}
```

```java
public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> needs = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) needs.add(new ArrayList<>());
    for (int[] p : prerequisites) needs.get(p[0]).add(p[1]);
    boolean[] taken = new boolean[numCourses];
    int[] order = new int[numCourses];
    for (int count = 0; count < numCourses; count++) {
        int next = -1;
        for (int c = 0; c < numCourses && next == -1; c++) {
            if (taken[c]) continue;
            boolean ready = true;
            for (int r : needs.get(c)) ready &= taken[r];
            if (ready) next = c;
        }
        if (next == -1) return new int[0];
        taken[next] = true;
        order[count] = next;
    }
    return order;
}
```

```python
def find_order(num_courses, prerequisites):
    needs = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        needs[a].append(b)
    taken = [False] * num_courses
    order = []
    while len(order) < num_courses:
        nxt = next(
            (c for c in range(num_courses) if not taken[c] and all(taken[r] for r in needs[c])),
            -1,
        )
        if nxt == -1:
            return []
        taken[nxt] = True
        order.append(nxt)
    return order
```

### Solution
type: optimal
name: Kahn's algorithm
time: O(V + E)
space: O(V + E)

```javascript
function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    inDegree[a]++;
  }
  const order = [];
  for (let c = 0; c < numCourses; c++) if (inDegree[c] === 0) order.push(c);
  for (let i = 0; i < order.length; i++) {
    for (const next of graph[order[i]]) {
      if (--inDegree[next] === 0) order.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}
```

```java
public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    int[] inDegree = new int[numCourses];
    for (int[] p : prerequisites) {
        graph.get(p[1]).add(p[0]);
        inDegree[p[0]]++;
    }
    int[] order = new int[numCourses];
    int head = 0, tail = 0;
    for (int c = 0; c < numCourses; c++) {
        if (inDegree[c] == 0) order[tail++] = c;
    }
    while (head < tail) {
        for (int next : graph.get(order[head++])) {
            if (--inDegree[next] == 0) order[tail++] = next;
        }
    }
    return tail == numCourses ? order : new int[0];
}
```

```python
from collections import deque

def find_order(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1
    queue = deque(c for c in range(num_courses) if in_degree[c] == 0)
    order = []
    while queue:
        course = queue.popleft()
        order.append(course)
        for nxt in graph[course]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == num_courses else []
```

### Solution
type: alternate
name: DFS post-order, reversed
time: O(V + E)
space: O(V + E)

```javascript
function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) graph[b].push(a);
  const state = new Array(numCourses).fill(0); // 0 new, 1 visiting, 2 done
  const post = [];
  const dfs = (course) => {
    if (state[course] === 1) return false;
    if (state[course] === 2) return true;
    state[course] = 1;
    for (const next of graph[course]) if (!dfs(next)) return false;
    state[course] = 2;
    post.push(course);
    return true;
  };
  for (let c = 0; c < numCourses; c++) if (!dfs(c)) return [];
  return post.reverse();
}
```

```java
public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    for (int[] p : prerequisites) graph.get(p[1]).add(p[0]);
    int[] state = new int[numCourses];
    Deque<Integer> stack = new ArrayDeque<>();
    for (int c = 0; c < numCourses; c++) {
        if (!dfs(graph, c, state, stack)) return new int[0];
    }
    int[] order = new int[numCourses];
    for (int i = 0; i < numCourses; i++) order[i] = stack.pop();
    return order;
}

private boolean dfs(List<List<Integer>> graph, int course, int[] state, Deque<Integer> stack) {
    if (state[course] == 1) return false;
    if (state[course] == 2) return true;
    state[course] = 1;
    for (int next : graph.get(course)) {
        if (!dfs(graph, next, state, stack)) return false;
    }
    state[course] = 2;
    stack.push(course);
    return true;
}
```

```python
def find_order(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        graph[b].append(a)
    state = [0] * num_courses  # 0 new, 1 visiting, 2 done
    post = []

    def dfs(course):
        if state[course] == 1:
            return False
        if state[course] == 2:
            return True
        state[course] = 1
        if not all(dfs(nxt) for nxt in graph[course]):
            return False
        state[course] = 2
        post.append(course)
        return True

    if not all(dfs(c) for c in range(num_courses)):
        return []
    return post[::-1]
```

### Tests

```json
{
  "fn": "findOrder",
  "cases": [
    {"args":[2,[[1,0]]],"expect":[0,1]},
    {"args":[4,[[1,0],[2,1],[3,2]]],"expect":[0,1,2,3]},
    {"args":[2,[[1,0],[0,1]]],"expect":[]},
    {"args":[1,[]],"expect":[0]},
    {"args":[3,[[0,1],[0,2],[1,2]]],"expect":[2,1,0]}
  ]
}
```

## Pacific Atlantic Water Flow
difficulty: medium
faq: false
tags: graph, grid, dfs, bfs

### Question
An `m × n` island has the Pacific Ocean touching its top and left edges and the Atlantic touching its bottom and right edges. `heights[r][c]` is each cell's height. Rain flows to a neighbouring cell (4-directionally) if the neighbour's height is **less than or equal**. Return all cells from which water can reach **both** oceans.

**Example:** `heights = [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]` → `[[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]`.

### Answer
Reverse the flow. Start a DFS from every Pacific border cell, moving only **uphill or level** (`next >= current`), to find all cells that can drain to the Pacific. Do the same from the Atlantic borders. The answer is the intersection of the two sets.

### Explanation
Checking every cell forward ("can water from here reach an ocean?") repeats huge amounts of work. Instead ask "which cells can the ocean be reached from?" by climbing inland from the coast:

1. `pacific` = DFS from all cells in row 0 and column 0.
2. `atlantic` = DFS from all cells in the last row and last column.
3. A DFS step from `(r, c)` goes to a neighbour only if it's in bounds, not yet visited, and `heights[nr][nc] >= heights[r][c]`.
4. Return cells marked in both.

Each DFS visits every cell at most once: O(m · n).

### Solution
type: brute
name: Forward search from every cell
time: O((m · n)²)
space: O(m · n)

From each cell, search downhill (`next <= current`) to see whether both oceans are reachable.

```javascript
function pacificAtlantic(heights) {
  const m = heights.length;
  const n = heights[0].length;
  const result = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      let pacific = false;
      let atlantic = false;
      const seen = new Set([r * n + c]);
      const stack = [[r, c]];
      while (stack.length && !(pacific && atlantic)) {
        const [cr, cc] = stack.pop();
        if (cr === 0 || cc === 0) pacific = true;
        if (cr === m - 1 || cc === n - 1) atlantic = true;
        for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
          if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen.has(nr * n + nc)) continue;
          if (heights[nr][nc] > heights[cr][cc]) continue;
          seen.add(nr * n + nc);
          stack.push([nr, nc]);
        }
      }
      if (pacific && atlantic) result.push([r, c]);
    }
  }
  return result;
}
```

```java
public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int m = heights.length, n = heights[0].length;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    List<List<Integer>> result = new ArrayList<>();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            boolean pacific = false, atlantic = false;
            Set<Integer> seen = new HashSet<>(List.of(r * n + c));
            Deque<int[]> stack = new ArrayDeque<>();
            stack.push(new int[] {r, c});
            while (!stack.isEmpty() && !(pacific && atlantic)) {
                int[] cell = stack.pop();
                if (cell[0] == 0 || cell[1] == 0) pacific = true;
                if (cell[0] == m - 1 || cell[1] == n - 1) atlantic = true;
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (heights[nr][nc] > heights[cell[0]][cell[1]] || !seen.add(nr * n + nc)) continue;
                    stack.push(new int[] {nr, nc});
                }
            }
            if (pacific && atlantic) result.add(List.of(r, c));
        }
    }
    return result;
}
```

```python
def pacific_atlantic(heights):
    m, n = len(heights), len(heights[0])
    result = []
    for r in range(m):
        for c in range(n):
            pacific = atlantic = False
            seen = {(r, c)}
            stack = [(r, c)]
            while stack and not (pacific and atlantic):
                cr, cc = stack.pop()
                if cr == 0 or cc == 0:
                    pacific = True
                if cr == m - 1 or cc == n - 1:
                    atlantic = True
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen and heights[nr][nc] <= heights[cr][cc]:
                        seen.add((nr, nc))
                        stack.append((nr, nc))
            if pacific and atlantic:
                result.append([r, c])
    return result
```

### Solution
type: optimal
name: Reverse DFS from both coastlines
time: O(m · n)
space: O(m · n)

```javascript
function pacificAtlantic(heights) {
  const m = heights.length;
  const n = heights[0].length;
  const pacific = Array.from({ length: m }, () => new Array(n).fill(false));
  const atlantic = Array.from({ length: m }, () => new Array(n).fill(false));
  const climb = (r, c, seen) => {
    seen[r][c] = true;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) continue;
      if (heights[nr][nc] >= heights[r][c]) climb(nr, nc, seen);
    }
  };
  for (let r = 0; r < m; r++) {
    climb(r, 0, pacific);
    climb(r, n - 1, atlantic);
  }
  for (let c = 0; c < n; c++) {
    climb(0, c, pacific);
    climb(m - 1, c, atlantic);
  }
  const result = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
  }
  return result;
}
```

```java
public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int m = heights.length, n = heights[0].length;
    boolean[][] pacific = new boolean[m][n], atlantic = new boolean[m][n];
    for (int r = 0; r < m; r++) {
        climb(heights, r, 0, pacific);
        climb(heights, r, n - 1, atlantic);
    }
    for (int c = 0; c < n; c++) {
        climb(heights, 0, c, pacific);
        climb(heights, m - 1, c, atlantic);
    }
    List<List<Integer>> result = new ArrayList<>();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (pacific[r][c] && atlantic[r][c]) result.add(List.of(r, c));
        }
    }
    return result;
}

private void climb(int[][] heights, int r, int c, boolean[][] seen) {
    seen[r][c] = true;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : dirs) {
        int nr = r + d[0], nc = c + d[1];
        if (nr < 0 || nr >= heights.length || nc < 0 || nc >= heights[0].length || seen[nr][nc]) continue;
        if (heights[nr][nc] >= heights[r][c]) climb(heights, nr, nc, seen);
    }
}
```

```python
def pacific_atlantic(heights):
    m, n = len(heights), len(heights[0])
    pacific, atlantic = set(), set()

    def climb(r, c, seen):
        seen.add((r, c))
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen and heights[nr][nc] >= heights[r][c]:
                climb(nr, nc, seen)

    for r in range(m):
        climb(r, 0, pacific)
        climb(r, n - 1, atlantic)
    for c in range(n):
        climb(0, c, pacific)
        climb(m - 1, c, atlantic)
    return [[r, c] for r in range(m) for c in range(n) if (r, c) in pacific and (r, c) in atlantic]
```

### Tests

```json
{
  "fn": "pacificAtlantic",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]],"expect":[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]},
    {"args":[[[1]]],"expect":[[0,0]]},
    {"args":[[[2,1],[1,2]]],"expect":[[0,0],[0,1],[1,0],[1,1]]}
  ]
}
```

## Number of Connected Components in an Undirected Graph
difficulty: medium
faq: false
tags: graph, union-find, dfs

### Question
You have `n` nodes labelled `0` to `n - 1` and a list of undirected `edges`. Return the number of connected components in the graph.

**Example:** `n = 5`, `edges = [[0, 1], [1, 2], [3, 4]]` → `2`.

### Answer
**Union-Find:** start with `n` components. For each edge, union its two endpoints; every union that joins two *different* components reduces the count by one. Path compression and union by rank make each operation nearly O(1).

### Explanation
1. `parent[i] = i`, `components = n`.
2. `find(x)` follows parents to the root, compressing the path on the way.
3. For each edge `(a, b)`: if `find(a) != find(b)`, link the roots (smaller rank under larger) and `components--`.
4. Return `components`.

A DFS/BFS over an adjacency list, counting how many times you start a new traversal, is equally valid at O(V + E).

### Solution
type: brute
name: Adjacency matrix + DFS
time: O(V²)
space: O(V²)

```javascript
function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => new Array(n).fill(false));
  for (const [a, b] of edges) adj[a][b] = adj[b][a] = true;
  const visited = new Array(n).fill(false);
  const dfs = (u) => {
    visited[u] = true;
    for (let v = 0; v < n; v++) if (adj[u][v] && !visited[v]) dfs(v);
  };
  let count = 0;
  for (let u = 0; u < n; u++) {
    if (!visited[u]) {
      count++;
      dfs(u);
    }
  }
  return count;
}
```

```java
public int countComponents(int n, int[][] edges) {
    boolean[][] adj = new boolean[n][n];
    for (int[] e : edges) adj[e[0]][e[1]] = adj[e[1]][e[0]] = true;
    boolean[] visited = new boolean[n];
    int count = 0;
    for (int u = 0; u < n; u++) {
        if (!visited[u]) {
            count++;
            dfs(adj, u, visited);
        }
    }
    return count;
}

private void dfs(boolean[][] adj, int u, boolean[] visited) {
    visited[u] = true;
    for (int v = 0; v < adj.length; v++) {
        if (adj[u][v] && !visited[v]) dfs(adj, v, visited);
    }
}
```

```python
def count_components(n, edges):
    adj = [[False] * n for _ in range(n)]
    for a, b in edges:
        adj[a][b] = adj[b][a] = True
    visited = [False] * n

    def dfs(u):
        visited[u] = True
        for v in range(n):
            if adj[u][v] and not visited[v]:
                dfs(v)

    count = 0
    for u in range(n):
        if not visited[u]:
            count += 1
            dfs(u)
    return count
```

### Solution
type: optimal
name: Union-Find with path compression and union by rank
time: O(V + E · α(V))
space: O(V)

```javascript
function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let components = n;
  for (const [a, b] of edges) {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) continue;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
    components--;
  }
  return components;
}
```

```java
public int countComponents(int n, int[][] edges) {
    int[] parent = new int[n], rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int components = n;
    for (int[] e : edges) {
        int ra = find(parent, e[0]), rb = find(parent, e[1]);
        if (ra == rb) continue;
        if (rank[ra] < rank[rb]) {
            int tmp = ra;
            ra = rb;
            rb = tmp;
        }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
    }
    return components;
}

private int find(int[] parent, int x) {
    while (parent[x] != x) x = parent[x] = parent[parent[x]];
    return x;
}
```

```python
def count_components(n, edges):
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        if rank[ra] == rank[rb]:
            rank[ra] += 1
        components -= 1
    return components
```

### Solution
type: alternate
name: DFS over an adjacency list
time: O(V + E)
space: O(V + E)

```javascript
function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const visited = new Array(n).fill(false);
  let count = 0;
  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    count++;
    const stack = [start];
    visited[start] = true;
    while (stack.length) {
      for (const next of graph[stack.pop()]) {
        if (!visited[next]) {
          visited[next] = true;
          stack.push(next);
        }
      }
    }
  }
  return count;
}
```

```java
public int countComponents(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int[] e : edges) {
        graph.get(e[0]).add(e[1]);
        graph.get(e[1]).add(e[0]);
    }
    boolean[] visited = new boolean[n];
    int count = 0;
    for (int start = 0; start < n; start++) {
        if (visited[start]) continue;
        count++;
        Deque<Integer> stack = new ArrayDeque<>(List.of(start));
        visited[start] = true;
        while (!stack.isEmpty()) {
            for (int next : graph.get(stack.pop())) {
                if (!visited[next]) {
                    visited[next] = true;
                    stack.push(next);
                }
            }
        }
    }
    return count;
}
```

```python
def count_components(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    visited = [False] * n
    count = 0
    for start in range(n):
        if visited[start]:
            continue
        count += 1
        visited[start] = True
        stack = [start]
        while stack:
            for nxt in graph[stack.pop()]:
                if not visited[nxt]:
                    visited[nxt] = True
                    stack.append(nxt)
    return count
```

### Tests

```json
{
  "fn": "countComponents",
  "cases": [
    {"args":[5,[[0,1],[1,2],[3,4]]],"expect":2},
    {"args":[5,[[0,1],[1,2],[2,3],[3,4]]],"expect":1},
    {"args":[4,[]],"expect":4},
    {"args":[4,[[0,1],[2,3],[1,2],[0,3]]],"expect":1}
  ]
}
```
