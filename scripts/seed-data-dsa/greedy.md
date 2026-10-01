## Jump Game
difficulty: medium
faq: true
tags: array, greedy, dynamic-programming

### Question
You start at index 0 of an array `nums`, where `nums[i]` is the **maximum** jump length from index `i`. Return `true` if you can reach the last index.

**Example:** `nums = [2, 3, 1, 1, 4]` → `true`; `nums = [3, 2, 1, 0, 4]` → `false` (every path gets stuck at index 3).

### Answer
Track the **farthest index reachable** so far. Walk the array; if the current index is beyond that reach, you're stuck. Otherwise extend the reach with `i + nums[i]`. If the reach ever covers the last index, return `true`.

### Explanation
Every index up to `reach` is reachable (you can always jump *less* than the maximum), so the reachable set is always a prefix `[0, reach]`.

1. `reach = 0`.
2. For each `i`: if `i > reach`, return `false`. Otherwise `reach = max(reach, i + nums[i])`.
3. Return `true` once `reach >= n - 1`.

One pass, O(1) space — versus the O(n²) DP that asks "is index `i` reachable?" by checking every earlier index.

### Solution
type: brute
name: DP — mark reachable indices
time: O(n²)
space: O(n)

```javascript
function canJump(nums) {
  const reachable = new Array(nums.length).fill(false);
  reachable[0] = true;
  for (let i = 0; i < nums.length; i++) {
    if (!reachable[i]) continue;
    for (let j = i + 1; j <= Math.min(i + nums[i], nums.length - 1); j++) reachable[j] = true;
  }
  return reachable[nums.length - 1];
}
```

```java
public boolean canJump(int[] nums) {
    boolean[] reachable = new boolean[nums.length];
    reachable[0] = true;
    for (int i = 0; i < nums.length; i++) {
        if (!reachable[i]) continue;
        for (int j = i + 1; j <= Math.min(i + nums[i], nums.length - 1); j++) reachable[j] = true;
    }
    return reachable[nums.length - 1];
}
```

```python
def can_jump(nums):
    n = len(nums)
    reachable = [False] * n
    reachable[0] = True
    for i in range(n):
        if not reachable[i]:
            continue
        for j in range(i + 1, min(i + nums[i], n - 1) + 1):
            reachable[j] = True
    return reachable[-1]
```

### Solution
type: optimal
name: Greedy farthest reach
time: O(n)
space: O(1)

```javascript
function canJump(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
    if (reach >= nums.length - 1) return true;
  }
  return true;
}
```

```java
public boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
        if (reach >= nums.length - 1) return true;
    }
    return true;
}
```

```python
def can_jump(nums):
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + jump)
        if reach >= len(nums) - 1:
            return True
    return True
```

### Solution
type: alternate
name: Greedy from the end
time: O(n)
space: O(1)

Move a "goal" backwards: if index `i` can reach the current goal, `i` becomes the new goal. You can win if the goal ends at index 0.

```javascript
function canJump(nums) {
  let goal = nums.length - 1;
  for (let i = nums.length - 2; i >= 0; i--) {
    if (i + nums[i] >= goal) goal = i;
  }
  return goal === 0;
}
```

```java
public boolean canJump(int[] nums) {
    int goal = nums.length - 1;
    for (int i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= goal) goal = i;
    }
    return goal == 0;
}
```

```python
def can_jump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0
```

### Tests

```json
{
  "fn": "canJump",
  "cases": [
    {"args":[[2,3,1,1,4]],"expect":true},
    {"args":[[3,2,1,0,4]],"expect":false},
    {"args":[[0]],"expect":true},
    {"args":[[2,0,0]],"expect":true},
    {"args":[[1,0,1,0]],"expect":false}
  ]
}
```

## Jump Game II
difficulty: medium
faq: true
tags: array, greedy, bfs

### Question
Same setup as *Jump Game*, but you're guaranteed to be able to reach the last index. Return the **minimum number of jumps** needed.

**Example:** `nums = [2, 3, 1, 1, 4]` → `2` (index 0 → 1 → 4).

### Answer
Think of it as BFS by levels: all indices reachable with `k` jumps form a contiguous window. While scanning the current window, track the farthest index reachable with one more jump; when you reach the window's end, take a jump and make that farthest point the new window's end.

### Explanation
1. `jumps = 0`, `currentEnd = 0` (end of the range reachable with `jumps` jumps), `farthest = 0`.
2. For `i` from 0 to `n - 2`:
   - `farthest = max(farthest, i + nums[i])`.
   - If `i == currentEnd`: you must jump to go further — `jumps++`, `currentEnd = farthest`.
3. Return `jumps`.

Stopping at `n - 2` avoids counting an extra jump when you're already at the last index. O(n) time, O(1) space.

### Solution
type: brute
name: DP — min jumps to each index
time: O(n²)
space: O(n)

```javascript
function jump(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(Infinity);
  dp[0] = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j <= Math.min(i + nums[i], n - 1); j++) dp[j] = Math.min(dp[j], dp[i] + 1);
  }
  return dp[n - 1];
}
```

```java
public int jump(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 0; i < n; i++) {
        if (dp[i] == Integer.MAX_VALUE) continue;
        for (int j = i + 1; j <= Math.min(i + nums[i], n - 1); j++) dp[j] = Math.min(dp[j], dp[i] + 1);
    }
    return dp[n - 1];
}
```

```python
def jump(nums):
    n = len(nums)
    dp = [0] + [float("inf")] * (n - 1)
    for i in range(n):
        for j in range(i + 1, min(i + nums[i], n - 1) + 1):
            dp[j] = min(dp[j], dp[i] + 1)
    return dp[-1]
```

### Solution
type: optimal
name: Greedy BFS levels
time: O(n)
space: O(1)

```javascript
function jump(nums) {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}
```

```java
public int jump(int[] nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    return jumps;
}
```

```python
def jump(nums):
    jumps = current_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps
```

### Tests

```json
{
  "fn": "jump",
  "cases": [
    {"args":[[2,3,1,1,4]],"expect":2},
    {"args":[[2,3,0,1,4]],"expect":2},
    {"args":[[0]],"expect":0},
    {"args":[[1,2,3]],"expect":2}
  ]
}
```

## Gas Station
difficulty: medium
faq: false
tags: array, greedy

### Question
There are `n` gas stations on a circular route. Station `i` has `gas[i]` fuel, and driving from station `i` to `i + 1` costs `cost[i]`. Starting with an empty tank, return the index of the station you can start from to travel around the circuit once clockwise, or `-1` if impossible. If a solution exists, it's unique.

**Example:** `gas = [1, 2, 3, 4, 5]`, `cost = [3, 4, 5, 1, 2]` → `3`.

### Answer
If total gas `<` total cost, it's impossible. Otherwise, scan once keeping a running tank; whenever the tank goes negative at station `i`, no station from the current start through `i` can work, so restart from `i + 1` with an empty tank. The last start chosen is the answer.

### Explanation
Two facts make one pass enough:

1. **Feasibility:** a full loop is possible iff `sum(gas) >= sum(cost)`.
2. **Skipping:** if starting at `s` you run dry before reaching `i + 1`, then starting at any station between `s` and `i` also fails — you'd arrive at each of them with a tank `>= 0` when starting from `s`, and it still wasn't enough.

So reset `start = i + 1` and `tank = 0` whenever `tank < 0`. O(n) time, O(1) space.

### Solution
type: brute
name: Simulate from every start
time: O(n²)
space: O(1)

```javascript
function canCompleteCircuit(gas, cost) {
  const n = gas.length;
  for (let start = 0; start < n; start++) {
    let tank = 0;
    let steps = 0;
    for (; steps < n; steps++) {
      const i = (start + steps) % n;
      tank += gas[i] - cost[i];
      if (tank < 0) break;
    }
    if (steps === n) return start;
  }
  return -1;
}
```

```java
public int canCompleteCircuit(int[] gas, int[] cost) {
    int n = gas.length;
    for (int start = 0; start < n; start++) {
        int tank = 0, steps = 0;
        for (; steps < n; steps++) {
            int i = (start + steps) % n;
            tank += gas[i] - cost[i];
            if (tank < 0) break;
        }
        if (steps == n) return start;
    }
    return -1;
}
```

```python
def can_complete_circuit(gas, cost):
    n = len(gas)
    for start in range(n):
        tank = 0
        for steps in range(n):
            i = (start + steps) % n
            tank += gas[i] - cost[i]
            if tank < 0:
                break
        else:
            return start
    return -1
```

### Solution
type: optimal
name: One-pass greedy with restart
time: O(n)
space: O(1)

```javascript
function canCompleteCircuit(gas, cost) {
  let total = 0;
  let tank = 0;
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}
```

```java
public int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {
            start = i + 1;
            tank = 0;
        }
    }
    return total >= 0 ? start : -1;
}
```

```python
def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i, (g, c) in enumerate(zip(gas, cost)):
        total += g - c
        tank += g - c
        if tank < 0:
            start, tank = i + 1, 0
    return start if total >= 0 else -1
```

### Tests

```json
{
  "fn": "canCompleteCircuit",
  "cases": [
    {"args":[[1,2,3,4,5],[3,4,5,1,2]],"expect":3},
    {"args":[[2,3,4],[3,4,3]],"expect":-1},
    {"args":[[5,1,2,3,4],[4,4,1,5,1]],"expect":4}
  ]
}
```

## Partition Labels
difficulty: medium
faq: false
tags: string, greedy, hash-map, two-pointers

### Question
Partition string `s` into as many parts as possible so that each letter appears in **at most one** part. Return the sizes of the parts, in order.

**Example:** `s = "ababcbacadefegdehijhklij"` → `[9, 7, 8]` (`"ababcbaca"`, `"defegde"`, `"hijhklij"`).

### Answer
Record the **last index** of every character. Scan left to right, extending the current part's end to the last occurrence of each character you see; when the scan index reaches that end, the part is closed — no character inside appears later.

### Explanation
1. `last[ch]` = last position of `ch` in `s`.
2. `start = 0`, `end = 0`. For each `i`: `end = max(end, last[s[i]])`. If `i == end`, push `end - start + 1` and set `start = i + 1`.

Cutting as early as possible (as soon as it's legal) maximises the number of parts. O(n) time, O(1) space for a fixed alphabet.

### Solution
type: brute
name: Grow each part until no letter appears later
time: O(n²)
space: O(1)

For the current part, repeatedly check whether any of its letters appear after the part's end and, if so, extend the end.

```javascript
function partitionLabels(s) {
  const result = [];
  let start = 0;
  while (start < s.length) {
    let end = start;
    for (let i = start; i <= end; i++) end = Math.max(end, s.lastIndexOf(s[i]));
    result.push(end - start + 1);
    start = end + 1;
  }
  return result;
}
```

```java
public List<Integer> partitionLabels(String s) {
    List<Integer> result = new ArrayList<>();
    int start = 0;
    while (start < s.length()) {
        int end = start;
        for (int i = start; i <= end; i++) end = Math.max(end, s.lastIndexOf(s.charAt(i)));
        result.add(end - start + 1);
        start = end + 1;
    }
    return result;
}
```

```python
def partition_labels(s):
    result = []
    start = 0
    while start < len(s):
        end = start
        i = start
        while i <= end:
            end = max(end, s.rindex(s[i]))
            i += 1
        result.append(end - start + 1)
        start = end + 1
    return result
```

### Solution
type: optimal
name: Last-occurrence map + greedy cut
time: O(n)
space: O(1) — at most 26 entries

```javascript
function partitionLabels(s) {
  const last = new Map();
  for (let i = 0; i < s.length; i++) last.set(s[i], i);
  const result = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i]));
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }
  return result;
}
```

```java
public List<Integer> partitionLabels(String s) {
    int[] last = new int[26];
    for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
    List<Integer> result = new ArrayList<>();
    int start = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        end = Math.max(end, last[s.charAt(i) - 'a']);
        if (i == end) {
            result.add(end - start + 1);
            start = i + 1;
        }
    }
    return result;
}
```

```python
def partition_labels(s):
    last = {ch: i for i, ch in enumerate(s)}
    result = []
    start = end = 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result
```

### Tests

```json
{
  "fn": "partitionLabels",
  "cases": [
    {"args":["ababcbacadefegdehijhklij"],"expect":[9,7,8]},
    {"args":["eccbbbbdec"],"expect":[10]},
    {"args":["abc"],"expect":[1,1,1]}
  ]
}
```
