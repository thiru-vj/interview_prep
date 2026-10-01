## Climbing Stairs
difficulty: easy
faq: true
tags: dynamic-programming, fibonacci, memoization

### Question
You're climbing a staircase with `n` steps. Each time you can climb **1 or 2** steps. In how many distinct ways can you reach the top?

**Example:** `n = 2` → `2` (`1+1`, `2`); `n = 3` → `3` (`1+1+1`, `1+2`, `2+1`).

### Answer
The last move onto step `n` came from step `n - 1` or step `n - 2`, so `ways(n) = ways(n - 1) + ways(n - 2)` — the Fibonacci recurrence. Compute it bottom-up keeping only the last two values.

### Explanation
Base cases: `ways(1) = 1`, `ways(2) = 2`.

Plain recursion recomputes the same subproblems exponentially many times (`ways(n - 2)` is computed by both `ways(n)` and `ways(n - 1)`, and so on). Two fixes:

- **Memoization (top-down):** cache each `ways(i)` the first time it's computed.
- **Tabulation (bottom-up):** iterate `i = 3..n`, and since each value depends only on the previous two, keep just two variables — O(1) space.

This "count the ways by the last step" pattern is the template for many DP problems.

### Solution
type: brute
name: Plain recursion
time: O(2ⁿ)
space: O(n) recursion

```javascript
function climbStairs(n) {
  if (n <= 2) return n;
  return climbStairs(n - 1) + climbStairs(n - 2);
}
```

```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    return climbStairs(n - 1) + climbStairs(n - 2);
}
```

```python
def climb_stairs(n):
    if n <= 2:
        return n
    return climb_stairs(n - 1) + climb_stairs(n - 2)
```

### Solution
type: optimal
name: Bottom-up with two variables
time: O(n)
space: O(1)

```javascript
function climbStairs(n) {
  if (n <= 2) return n;
  let prev = 1;
  let curr = 2;
  for (let i = 3; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}
```

```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    int prev = 1, curr = 2;
    for (int i = 3; i <= n; i++) {
        int next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}
```

```python
def climb_stairs(n):
    if n <= 2:
        return n
    prev, curr = 1, 2
    for _ in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr
```

### Solution
type: alternate
name: Top-down memoization
time: O(n)
space: O(n)

```javascript
function climbStairs(n, memo = new Map()) {
  if (n <= 2) return n;
  if (!memo.has(n)) memo.set(n, climbStairs(n - 1, memo) + climbStairs(n - 2, memo));
  return memo.get(n);
}
```

```java
public int climbStairs(int n) {
    return ways(n, new int[n + 1]);
}

private int ways(int n, int[] memo) {
    if (n <= 2) return n;
    if (memo[n] == 0) memo[n] = ways(n - 1, memo) + ways(n - 2, memo);
    return memo[n];
}
```

```python
from functools import cache

def climb_stairs(n):
    @cache
    def ways(i):
        return i if i <= 2 else ways(i - 1) + ways(i - 2)

    return ways(n)
```

### Tests

```json
{
  "fn": "climbStairs",
  "cases": [
    {"args":[1],"expect":1},
    {"args":[2],"expect":2},
    {"args":[3],"expect":3},
    {"args":[5],"expect":8},
    {"args":[20],"expect":10946}
  ]
}
```

## House Robber
difficulty: medium
faq: true
tags: array, dynamic-programming

### Question
Houses along a street hold `nums[i]` money each. You can't rob two **adjacent** houses (it triggers the alarm). Return the maximum amount you can rob.

**Example:** `nums = [1, 2, 3, 1]` → `4` (houses 0 and 2); `nums = [2, 7, 9, 3, 1]` → `12` (2 + 9 + 1).

### Answer
At each house choose the better of **skipping it** (keep the best up to the previous house) or **robbing it** (its money plus the best up to two houses back): `best[i] = max(best[i - 1], best[i - 2] + nums[i])`. Only the last two values are needed.

### Explanation
Let `best[i]` be the max loot from houses `0..i`.

- Skip house `i` → `best[i - 1]`.
- Rob house `i` → `nums[i] + best[i - 2]` (house `i - 1` must be skipped).

Iterate left to right with two rolling variables `prev2 = best[i - 2]`, `prev1 = best[i - 1]`. The answer is `prev1` after the last house. O(n) time, O(1) space.

### Solution
type: brute
name: Recursion (rob or skip each house)
time: O(2ⁿ)
space: O(n)

```javascript
function rob(nums, i = nums.length - 1) {
  if (i < 0) return 0;
  return Math.max(rob(nums, i - 1), nums[i] + rob(nums, i - 2));
}
```

```java
public int rob(int[] nums) {
    return rob(nums, nums.length - 1);
}

private int rob(int[] nums, int i) {
    if (i < 0) return 0;
    return Math.max(rob(nums, i - 1), nums[i] + rob(nums, i - 2));
}
```

```python
def rob(nums, i=None):
    if i is None:
        i = len(nums) - 1
    if i < 0:
        return 0
    return max(rob(nums, i - 1), nums[i] + rob(nums, i - 2))
```

### Solution
type: optimal
name: Bottom-up with two rolling values
time: O(n)
space: O(1)

```javascript
function rob(nums) {
  let prev2 = 0;
  let prev1 = 0;
  for (const money of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + money)];
  return prev1;
}
```

```java
public int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;
    for (int money : nums) {
        int curr = Math.max(prev1, prev2 + money);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def rob(nums):
    prev2 = prev1 = 0
    for money in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + money)
    return prev1
```

### Tests

```json
{
  "fn": "rob",
  "cases": [
    {"args":[[1,2,3,1]],"expect":4},
    {"args":[[2,7,9,3,1]],"expect":12},
    {"args":[[5]],"expect":5},
    {"args":[[2,1,1,2]],"expect":4}
  ]
}
```

## House Robber II
difficulty: medium
faq: false
tags: array, dynamic-programming

### Question
Same as *House Robber*, but the houses are arranged in a **circle** — the first and last houses are adjacent. Return the maximum amount you can rob.

**Example:** `nums = [2, 3, 2]` → `3`; `nums = [1, 2, 3, 1]` → `4`.

### Answer
The first and last houses can't both be robbed, so solve the linear problem twice — once **excluding the last house** and once **excluding the first** — and take the larger result. (With one house, just return it.)

### Explanation
Any valid plan either skips house 0 or skips house `n - 1` (possibly both). So:

`answer = max(robLinear(nums[0 .. n-2]), robLinear(nums[1 .. n-1]))`

where `robLinear` is the O(1)-space *House Robber* DP. Handle `n == 1` separately, because both slices would be empty. Still O(n) time, O(1) space.

### Solution
type: brute
name: Recursion with a "first house robbed" flag
time: O(2ⁿ)
space: O(n)

```javascript
function robCircular(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];
  const go = (i, firstRobbed) => {
    if (i >= n) return 0;
    const skip = go(i + 1, firstRobbed);
    if (i === n - 1 && firstRobbed) return skip;
    return Math.max(skip, nums[i] + go(i + 2, firstRobbed || i === 0));
  };
  return go(0, false);
}
```

```java
public int robCircular(int[] nums) {
    if (nums.length == 1) return nums[0];
    return go(nums, 0, false);
}

private int go(int[] nums, int i, boolean firstRobbed) {
    if (i >= nums.length) return 0;
    int skip = go(nums, i + 1, firstRobbed);
    if (i == nums.length - 1 && firstRobbed) return skip;
    return Math.max(skip, nums[i] + go(nums, i + 2, firstRobbed || i == 0));
}
```

```python
def rob_circular(nums):
    n = len(nums)
    if n == 1:
        return nums[0]

    def go(i, first_robbed):
        if i >= n:
            return 0
        skip = go(i + 1, first_robbed)
        if i == n - 1 and first_robbed:
            return skip
        return max(skip, nums[i] + go(i + 2, first_robbed or i == 0))

    return go(0, False)
```

### Solution
type: optimal
name: Two linear passes
time: O(n)
space: O(1)

```javascript
function robCircular(nums) {
  if (nums.length === 1) return nums[0];
  const robLinear = (lo, hi) => {
    let prev2 = 0;
    let prev1 = 0;
    for (let i = lo; i <= hi; i++) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
    return prev1;
  };
  return Math.max(robLinear(0, nums.length - 2), robLinear(1, nums.length - 1));
}
```

```java
public int robCircular(int[] nums) {
    if (nums.length == 1) return nums[0];
    return Math.max(robLinear(nums, 0, nums.length - 2), robLinear(nums, 1, nums.length - 1));
}

private int robLinear(int[] nums, int lo, int hi) {
    int prev2 = 0, prev1 = 0;
    for (int i = lo; i <= hi; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def rob_circular(nums):
    if len(nums) == 1:
        return nums[0]

    def rob_linear(houses):
        prev2 = prev1 = 0
        for money in houses:
            prev2, prev1 = prev1, max(prev1, prev2 + money)
        return prev1

    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))
```

### Tests

```json
{
  "fn": "robCircular",
  "cases": [
    {"args":[[2,3,2]],"expect":3},
    {"args":[[1,2,3,1]],"expect":4},
    {"args":[[1,2,3]],"expect":3},
    {"args":[[7]],"expect":7},
    {"args":[[200,3,140,20,10]],"expect":340}
  ]
}
```

## Coin Change
difficulty: medium
faq: true
tags: array, dynamic-programming, bfs

### Question
Given coin denominations `coins` (unlimited supply of each) and an `amount`, return the **fewest** coins that make up `amount`, or `-1` if it can't be made.

**Example:** `coins = [1, 2, 5]`, `amount = 11` → `3` (5 + 5 + 1); `coins = [2]`, `amount = 3` → `-1`.

### Answer
Bottom-up DP over amounts: `dp[a]` = fewest coins for amount `a`. For each amount, try every coin as the last one: `dp[a] = min(dp[a - coin] + 1)`. Start with `dp[0] = 0` and everything else "infinity".

### Explanation
1. `dp = [0, ∞, ∞, …, ∞]` of length `amount + 1`.
2. For `a` from 1 to `amount`, for each `coin <= a`: `dp[a] = min(dp[a], dp[a - coin] + 1)`.
3. Return `dp[amount]` if it's finite, else `-1`.

Greedy (always take the biggest coin) fails — with coins `[1, 3, 4]` and amount 6, greedy gives `4 + 1 + 1` (3 coins) while `3 + 3` needs 2. DP considers every last coin. O(amount · k) time for `k` coin types.

### Solution
type: brute
name: Recursion over every coin choice
time: O(k^(amount / min coin))
space: O(amount / min coin)

```javascript
function coinChange(coins, amount) {
  const best = (remaining) => {
    if (remaining === 0) return 0;
    if (remaining < 0) return Infinity;
    let min = Infinity;
    for (const coin of coins) min = Math.min(min, best(remaining - coin) + 1);
    return min;
  };
  const result = best(amount);
  return result === Infinity ? -1 : result;
}
```

```java
public int coinChange(int[] coins, int amount) {
    int result = best(coins, amount);
    return result == Integer.MAX_VALUE ? -1 : result;
}

private int best(int[] coins, int remaining) {
    if (remaining == 0) return 0;
    if (remaining < 0) return Integer.MAX_VALUE;
    int min = Integer.MAX_VALUE;
    for (int coin : coins) {
        int sub = best(coins, remaining - coin);
        if (sub != Integer.MAX_VALUE) min = Math.min(min, sub + 1);
    }
    return min;
}
```

```python
def coin_change(coins, amount):
    def best(remaining):
        if remaining == 0:
            return 0
        if remaining < 0:
            return float("inf")
        return min(best(remaining - coin) + 1 for coin in coins)

    result = best(amount)
    return -1 if result == float("inf") else result
```

### Solution
type: optimal
name: Bottom-up DP over amounts
time: O(amount · k)
space: O(amount)

```javascript
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

```java
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); // amount + 1 acts as "infinity"
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

```python
def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return -1 if dp[amount] == float("inf") else dp[amount]
```

### Solution
type: alternate
name: BFS over remaining amounts
time: O(amount · k)
space: O(amount)

Each BFS level adds one coin, so the first time you reach 0 is the minimum count. Often faster in practice because it stops early.

```javascript
function coinChange(coins, amount) {
  if (amount === 0) return 0;
  const seen = new Array(amount + 1).fill(false);
  let level = [amount];
  seen[amount] = true;
  for (let steps = 1; level.length; steps++) {
    const next = [];
    for (const remaining of level) {
      for (const coin of coins) {
        const r = remaining - coin;
        if (r === 0) return steps;
        if (r > 0 && !seen[r]) {
          seen[r] = true;
          next.push(r);
        }
      }
    }
    level = next;
  }
  return -1;
}
```

```java
public int coinChange(int[] coins, int amount) {
    if (amount == 0) return 0;
    boolean[] seen = new boolean[amount + 1];
    Deque<Integer> queue = new ArrayDeque<>(List.of(amount));
    seen[amount] = true;
    for (int steps = 1; !queue.isEmpty(); steps++) {
        for (int i = queue.size(); i > 0; i--) {
            int remaining = queue.poll();
            for (int coin : coins) {
                int r = remaining - coin;
                if (r == 0) return steps;
                if (r > 0 && !seen[r]) {
                    seen[r] = true;
                    queue.offer(r);
                }
            }
        }
    }
    return -1;
}
```

```python
def coin_change(coins, amount):
    if amount == 0:
        return 0
    seen = {amount}
    level = [amount]
    steps = 0
    while level:
        steps += 1
        nxt = []
        for remaining in level:
            for coin in coins:
                r = remaining - coin
                if r == 0:
                    return steps
                if r > 0 and r not in seen:
                    seen.add(r)
                    nxt.append(r)
        level = nxt
    return -1
```

### Tests

```json
{
  "fn": "coinChange",
  "cases": [
    {"args":[[1,2,5],11],"expect":3},
    {"args":[[2],3],"expect":-1},
    {"args":[[1],0],"expect":0},
    {"args":[[1,3,4],6],"expect":2},
    {"args":[[186,419,83,408],6249],"expect":20}
  ]
}
```

## Longest Increasing Subsequence
difficulty: medium
faq: true
tags: array, dynamic-programming, binary-search

### Question
Given an integer array `nums`, return the length of the longest **strictly increasing** subsequence (elements in order, not necessarily contiguous).

**Example:** `nums = [10, 9, 2, 5, 3, 7, 101, 18]` → `4` (e.g. `[2, 3, 7, 101]`).

### Answer
**O(n²) DP:** `dp[i]` = length of the longest increasing subsequence ending at `i` = `1 + max(dp[j])` over `j < i` with `nums[j] < nums[i]`. **O(n log n):** maintain `tails`, where `tails[k]` is the smallest possible tail of an increasing subsequence of length `k + 1`; binary-search each number's position in `tails` and replace (or append).

### Explanation
**Patience sorting (`tails`):** for each `num`:
- If it's larger than every tail, append it — the LIS just got longer.
- Otherwise, find the first tail `>= num` (binary search) and replace it with `num`. This keeps the same lengths possible while making that tail smaller, so it's easier to extend later.

`tails.length` is the answer. Note `tails` itself is not necessarily a real subsequence — only its length is meaningful. Use a lower bound (`>=`) so that equal values don't count as increasing.

### Solution
type: brute
name: Recursion — take or skip each element
time: O(2ⁿ)
space: O(n)

```javascript
function lengthOfLIS(nums) {
  const go = (i, prev) => {
    if (i === nums.length) return 0;
    const skip = go(i + 1, prev);
    const take = prev === -1 || nums[i] > nums[prev] ? 1 + go(i + 1, i) : 0;
    return Math.max(skip, take);
  };
  return go(0, -1);
}
```

```java
public int lengthOfLIS(int[] nums) {
    return go(nums, 0, -1);
}

private int go(int[] nums, int i, int prev) {
    if (i == nums.length) return 0;
    int skip = go(nums, i + 1, prev);
    int take = prev == -1 || nums[i] > nums[prev] ? 1 + go(nums, i + 1, i) : 0;
    return Math.max(skip, take);
}
```

```python
def length_of_lis(nums):
    def go(i, prev):
        if i == len(nums):
            return 0
        skip = go(i + 1, prev)
        take = 1 + go(i + 1, i) if prev == -1 or nums[i] > nums[prev] else 0
        return max(skip, take)

    return go(0, -1)
```

### Solution
type: optimal
name: Patience sorting with binary search
time: O(n log n)
space: O(n)

```javascript
function lengthOfLIS(nums) {
  const tails = [];
  for (const num of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }
  return tails.length;
}
```

```java
public int lengthOfLIS(int[] nums) {
    int[] tails = new int[nums.length];
    int size = 0;
    for (int num : nums) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (tails[mid] < num) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = num;
        if (lo == size) size++;
    }
    return size;
}
```

```python
import bisect

def length_of_lis(nums):
    tails = []
    for num in nums:
        i = bisect.bisect_left(tails, num)
        if i == len(tails):
            tails.append(num)
        else:
            tails[i] = num
    return len(tails)
```

### Solution
type: alternate
name: O(n²) DP
time: O(n²)
space: O(n)

The classic tabulation — slower, but it's easier to derive and extends naturally to reconstructing the subsequence or counting LIS.

```javascript
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(0, ...dp);
}
```

```java
public int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    int best = 0;
    for (int i = 0; i < nums.length; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        }
        best = Math.max(best, dp[i]);
    }
    return best;
}
```

```python
def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)
```

### Tests

```json
{
  "fn": "lengthOfLIS",
  "py": "length_of_lis",
  "cases": [
    {"args":[[10,9,2,5,3,7,101,18]],"expect":4},
    {"args":[[0,1,0,3,2,3]],"expect":4},
    {"args":[[7,7,7,7]],"expect":1},
    {"args":[[4,10,4,3,8,9]],"expect":3}
  ]
}
```

## Longest Common Subsequence
difficulty: medium
faq: true
tags: string, dynamic-programming

### Question
Given two strings `text1` and `text2`, return the length of their longest common subsequence — a sequence that appears in both, in order but not necessarily contiguously. Return `0` if there's none.

**Example:** `text1 = "abcde"`, `text2 = "ace"` → `3` (`"ace"`); `text1 = "abc"`, `text2 = "def"` → `0`.

### Answer
2D DP: `dp[i][j]` = LCS of the first `i` chars of `text1` and the first `j` chars of `text2`. If the last characters match, `dp[i][j] = dp[i-1][j-1] + 1`; otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.

### Explanation
Compare `text1[i-1]` and `text2[j-1]`:

- **Equal:** that character can end the common subsequence — extend the LCS of both shorter prefixes by 1.
- **Different:** at least one of them isn't in the LCS, so drop one character from either string and take the better result.

Fill the `(m + 1) × (n + 1)` table row by row; `dp[m][n]` is the answer. Since each row only depends on the previous row, you can keep just two rows (O(min(m, n)) space). This table is also the basis of `diff` tools and *Edit Distance*.

### Solution
type: brute
name: Plain recursion
time: O(2^(m + n))
space: O(m + n)

```javascript
function longestCommonSubsequence(text1, text2) {
  const go = (i, j) => {
    if (i === text1.length || j === text2.length) return 0;
    if (text1[i] === text2[j]) return 1 + go(i + 1, j + 1);
    return Math.max(go(i + 1, j), go(i, j + 1));
  };
  return go(0, 0);
}
```

```java
public int longestCommonSubsequence(String text1, String text2) {
    return go(text1, text2, 0, 0);
}

private int go(String a, String b, int i, int j) {
    if (i == a.length() || j == b.length()) return 0;
    if (a.charAt(i) == b.charAt(j)) return 1 + go(a, b, i + 1, j + 1);
    return Math.max(go(a, b, i + 1, j), go(a, b, i, j + 1));
}
```

```python
def longest_common_subsequence(text1, text2):
    def go(i, j):
        if i == len(text1) or j == len(text2):
            return 0
        if text1[i] == text2[j]:
            return 1 + go(i + 1, j + 1)
        return max(go(i + 1, j), go(i, j + 1))

    return go(0, 0)
```

### Solution
type: optimal
name: Bottom-up DP with two rows
time: O(m · n)
space: O(n)

```javascript
function longestCommonSubsequence(text1, text2) {
  const n = text2.length;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= text1.length; i++) {
    const curr = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      curr[j] = text1[i - 1] === text2[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}
```

```java
public int longestCommonSubsequence(String text1, String text2) {
    int n = text2.length();
    int[] prev = new int[n + 1];
    for (int i = 1; i <= text1.length(); i++) {
        int[] curr = new int[n + 1];
        for (int j = 1; j <= n; j++) {
            curr[j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
        }
        prev = curr;
    }
    return prev[n];
}
```

```python
def longest_common_subsequence(text1, text2):
    n = len(text2)
    prev = [0] * (n + 1)
    for i in range(1, len(text1) + 1):
        curr = [0] * (n + 1)
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev = curr
    return prev[n]
```

### Tests

```json
{
  "fn": "longestCommonSubsequence",
  "cases": [
    {"args":["abcde","ace"],"expect":3},
    {"args":["abc","abc"],"expect":3},
    {"args":["abc","def"],"expect":0},
    {"args":["bsbininm","jmjkbkjkv"],"expect":1}
  ]
}
```

## Word Break
difficulty: medium
faq: true
tags: string, dynamic-programming, hash-set

### Question
Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. Words may be reused.

**Example:** `s = "leetcode"`, `wordDict = ["leet", "code"]` → `true`; `s = "catsandog"`, `wordDict = ["cats", "dog", "sand", "and", "cat"]` → `false`.

### Answer
`dp[i]` = "the prefix `s[0..i)` can be segmented". `dp[0] = true`, and `dp[i]` is true if there's a split point `j < i` with `dp[j]` true and `s[j..i)` in the dictionary. Return `dp[n]`.

### Explanation
1. Put the words in a hash set for O(1) lookups.
2. For each end `i` from 1 to `n`, try every start `j` (or only starts within the maximum word length): if `dp[j] && set.has(s.slice(j, i))`, set `dp[i] = true` and stop.

The plain recursion tries every split and revisits the same suffixes exponentially often (think `"aaaaaaab"` with words `a`, `aa`, `aaa`). The DP evaluates each prefix once: O(n²) checks, each with an O(n) substring.

### Solution
type: brute
name: Recursion over every split
time: O(2ⁿ)
space: O(n)

```javascript
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const canBreak = (start) => {
    if (start === s.length) return true;
    for (let end = start + 1; end <= s.length; end++) {
      if (words.has(s.slice(start, end)) && canBreak(end)) return true;
    }
    return false;
  };
  return canBreak(0);
}
```

```java
public boolean wordBreak(String s, List<String> wordDict) {
    return canBreak(s, new HashSet<>(wordDict), 0);
}

private boolean canBreak(String s, Set<String> words, int start) {
    if (start == s.length()) return true;
    for (int end = start + 1; end <= s.length(); end++) {
        if (words.contains(s.substring(start, end)) && canBreak(s, words, end)) return true;
    }
    return false;
}
```

```python
def word_break(s, word_dict):
    words = set(word_dict)

    def can_break(start):
        if start == len(s):
            return True
        return any(s[start:end] in words and can_break(end) for end in range(start + 1, len(s) + 1))

    return can_break(0)
```

### Solution
type: optimal
name: Bottom-up DP over prefixes
time: O(n² · L) — L for substring hashing
space: O(n)

```javascript
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const maxLen = Math.max(...wordDict.map((w) => w.length));
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}
```

```java
public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    int maxLen = 0;
    for (String w : wordDict) maxLen = Math.max(maxLen, w.length());
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    for (int i = 1; i <= s.length(); i++) {
        for (int j = Math.max(0, i - maxLen); j < i; j++) {
            if (dp[j] && words.contains(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length()];
}
```

```python
def word_break(s, word_dict):
    words = set(word_dict)
    max_len = max(map(len, word_dict))
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]
```

### Tests

```json
{
  "fn": "wordBreak",
  "cases": [
    {"args":["leetcode",["leet","code"]],"expect":true},
    {"args":["applepenapple",["apple","pen"]],"expect":true},
    {"args":["catsandog",["cats","dog","sand","and","cat"]],"expect":false},
    {"args":["aaaaaaab",["a","aa","aaa"]],"expect":false}
  ]
}
```

## Unique Paths
difficulty: medium
faq: false
tags: dynamic-programming, math, combinatorics

### Question
A robot starts at the top-left of an `m × n` grid and can only move **right** or **down**. How many unique paths lead to the bottom-right corner?

**Example:** `m = 3`, `n = 7` → `28`; `m = 3`, `n = 2` → `3`.

### Answer
The number of paths to a cell is the sum of paths to the cell above and the cell to its left: `dp[r][c] = dp[r-1][c] + dp[r][c-1]`, with the first row and column all `1`. A single rolling row is enough.

### Explanation
Every path into `(r, c)` arrives from above or from the left, and those two sets of paths are disjoint — so add them.

Rolling row: `row = [1, 1, …, 1]` (n ones, for the first row). For each later row, `row[c] += row[c - 1]` from left to right — `row[c]` still holds the value from the row above, and `row[c - 1]` has already been updated for the current row.

Math shortcut: every path is `m - 1` downs and `n - 1` rights in some order, so the answer is `C(m + n - 2, m - 1)`.

### Solution
type: brute
name: Recursion
time: O(2^(m + n))
space: O(m + n)

```javascript
function uniquePaths(m, n) {
  if (m === 1 || n === 1) return 1;
  return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
}
```

```java
public int uniquePaths(int m, int n) {
    if (m == 1 || n == 1) return 1;
    return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
}
```

```python
def unique_paths(m, n):
    if m == 1 or n == 1:
        return 1
    return unique_paths(m - 1, n) + unique_paths(m, n - 1)
```

### Solution
type: optimal
name: DP with one rolling row
time: O(m · n)
space: O(n)

```javascript
function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  }
  return row[n - 1];
}
```

```java
public int uniquePaths(int m, int n) {
    int[] row = new int[n];
    Arrays.fill(row, 1);
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
    }
    return row[n - 1];
}
```

```python
def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[-1]
```

### Solution
type: alternate
name: Combinatorics — C(m + n − 2, m − 1)
time: O(min(m, n))
space: O(1)

Compute the binomial coefficient incrementally; multiplying before dividing keeps every intermediate value an exact integer.

```javascript
function uniquePaths(m, n) {
  const k = Math.min(m, n) - 1;
  const total = m + n - 2;
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (total - k + i)) / i;
  return Math.round(result);
}
```

```java
public int uniquePaths(int m, int n) {
    int k = Math.min(m, n) - 1, total = m + n - 2;
    long result = 1;
    for (int i = 1; i <= k; i++) result = result * (total - k + i) / i;
    return (int) result;
}
```

```python
from math import comb

def unique_paths(m, n):
    return comb(m + n - 2, m - 1)
```

### Tests

```json
{
  "fn": "uniquePaths",
  "cases": [
    {"args":[3,7],"expect":28},
    {"args":[3,2],"expect":3},
    {"args":[1,1],"expect":1},
    {"args":[10,10],"expect":48620}
  ]
}
```

## Edit Distance
difficulty: hard
faq: true
tags: string, dynamic-programming

### Question
Given two strings `word1` and `word2`, return the minimum number of operations to convert `word1` into `word2`. Allowed operations: **insert** a character, **delete** a character, **replace** a character.

**Example:** `word1 = "horse"`, `word2 = "ros"` → `3` (horse → rorse → rose → ros).

### Answer
`dp[i][j]` = edits to turn the first `i` chars of `word1` into the first `j` chars of `word2`. If the current characters match, `dp[i][j] = dp[i-1][j-1]`; otherwise it's `1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))`.

### Explanation
Base cases: `dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert everything).

For `word1[i-1]` vs `word2[j-1]`:
- **Match:** no operation needed — inherit `dp[i-1][j-1]`.
- **Mismatch:** pay 1 for the cheapest of
  - delete `word1[i-1]` → `dp[i-1][j]`
  - insert `word2[j-1]` → `dp[i][j-1]`
  - replace one with the other → `dp[i-1][j-1]`

Filling the table is O(m · n). A rolling row reduces space to O(n) — just remember to save the diagonal value before overwriting it.

### Solution
type: brute
name: Plain recursion
time: O(3^(m + n))
space: O(m + n)

```javascript
function minDistance(word1, word2) {
  const go = (i, j) => {
    if (i === word1.length) return word2.length - j;
    if (j === word2.length) return word1.length - i;
    if (word1[i] === word2[j]) return go(i + 1, j + 1);
    return 1 + Math.min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1));
  };
  return go(0, 0);
}
```

```java
public int minDistance(String word1, String word2) {
    return go(word1, word2, 0, 0);
}

private int go(String a, String b, int i, int j) {
    if (i == a.length()) return b.length() - j;
    if (j == b.length()) return a.length() - i;
    if (a.charAt(i) == b.charAt(j)) return go(a, b, i + 1, j + 1);
    return 1 + Math.min(go(a, b, i + 1, j), Math.min(go(a, b, i, j + 1), go(a, b, i + 1, j + 1)));
}
```

```python
def min_distance(word1, word2):
    def go(i, j):
        if i == len(word1):
            return len(word2) - j
        if j == len(word2):
            return len(word1) - i
        if word1[i] == word2[j]:
            return go(i + 1, j + 1)
        return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))

    return go(0, 0)
```

### Solution
type: optimal
name: Bottom-up DP table
time: O(m · n)
space: O(m · n)

```javascript
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        word1[i - 1] === word2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
```

```java
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
        }
    }
    return dp[m][n];
}
```

```python
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
```

### Tests

```json
{
  "fn": "minDistance",
  "cases": [
    {"args":["horse","ros"],"expect":3},
    {"args":["intention","execution"],"expect":5},
    {"args":["","abc"],"expect":3},
    {"args":["abc",""],"expect":3}
  ]
}
```

## Partition Equal Subset Sum
difficulty: medium
faq: false
tags: array, dynamic-programming, knapsack

### Question
Given an array of positive integers `nums`, return `true` if it can be split into two subsets with **equal sums**.

**Example:** `nums = [1, 5, 11, 5]` → `true` (`[1, 5, 5]` and `[11]`); `nums = [1, 2, 3, 5]` → `false`.

### Answer
If the total is odd, it's impossible. Otherwise ask: is there a subset summing to `total / 2`? That's **0/1 knapsack**: keep a boolean array `dp[s]` ("sum `s` is reachable") and, for each number, update it **from high sums down to low** so each number is used at most once.

### Explanation
1. `total = sum(nums)`; if odd, return `false`. `target = total / 2`.
2. `dp[0] = true`.
3. For each `num`, for `s` from `target` down to `num`: `dp[s] = dp[s] || dp[s - num]`.
4. Return `dp[target]`.

Iterating `s` **downwards** is essential: going upwards would let the same number be added multiple times in one pass (which would solve the *unbounded* knapsack instead). O(n · target) time, O(target) space.

### Solution
type: brute
name: Recursion — include or exclude each number
time: O(2ⁿ)
space: O(n)

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const reach = (i, remaining) => {
    if (remaining === 0) return true;
    if (i === nums.length || remaining < 0) return false;
    return reach(i + 1, remaining - nums[i]) || reach(i + 1, remaining);
  };
  return reach(0, total / 2);
}
```

```java
public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 == 1) return false;
    return reach(nums, 0, total / 2);
}

private boolean reach(int[] nums, int i, int remaining) {
    if (remaining == 0) return true;
    if (i == nums.length || remaining < 0) return false;
    return reach(nums, i + 1, remaining - nums[i]) || reach(nums, i + 1, remaining);
}
```

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False

    def reach(i, remaining):
        if remaining == 0:
            return True
        if i == len(nums) or remaining < 0:
            return False
        return reach(i + 1, remaining - nums[i]) or reach(i + 1, remaining)

    return reach(0, total // 2)
```

### Solution
type: optimal
name: 0/1 knapsack with a 1D boolean array
time: O(n · sum)
space: O(sum)

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let s = target; s >= num; s--) dp[s] = dp[s] || dp[s - num];
  }
  return dp[target];
}
```

```java
public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 == 1) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums) {
        for (int s = target; s >= num; s--) dp[s] = dp[s] || dp[s - num];
    }
    return dp[target];
}
```

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target
    for num in nums:
        for s in range(target, num - 1, -1):
            dp[s] = dp[s] or dp[s - num]
    return dp[target]
```

### Solution
type: alternate
name: Set of reachable sums
time: O(n · sum)
space: O(sum)

Same idea written as a set: after each number, the reachable sums are the old ones plus each old sum + `num`. Very concise in Python.

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  let reachable = new Set([0]);
  for (const num of nums) {
    const next = new Set(reachable);
    for (const s of reachable) if (s + num <= target) next.add(s + num);
    reachable = next;
  }
  return reachable.has(target);
}
```

```java
public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 == 1) return false;
    int target = total / 2;
    Set<Integer> reachable = new HashSet<>(List.of(0));
    for (int num : nums) {
        Set<Integer> next = new HashSet<>(reachable);
        for (int s : reachable) {
            if (s + num <= target) next.add(s + num);
        }
        reachable = next;
    }
    return reachable.contains(target);
}
```

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    reachable = {0}
    for num in nums:
        reachable |= {s + num for s in reachable if s + num <= target}
    return target in reachable
```

### Tests

```json
{
  "fn": "canPartition",
  "cases": [
    {"args":[[1,5,11,5]],"expect":true},
    {"args":[[1,2,3,5]],"expect":false},
    {"args":[[2,2]],"expect":true},
    {"args":[[1]],"expect":false}
  ]
}
```

## Decode Ways
difficulty: medium
faq: false
tags: string, dynamic-programming

### Question
A message of letters `A–Z` is encoded as numbers using `A → "1"`, `B → "2"`, …, `Z → "26"`. Given a digit string `s`, return the number of ways to decode it. `"06"` is not a valid code for `F` (leading zeros are invalid).

**Example:** `s = "12"` → `2` (`"AB"` or `"L"`); `s = "226"` → `3`; `s = "06"` → `0`.

### Answer
`ways[i]` = number of decodings of the prefix of length `i`. The last step used either one digit (valid if it's `1–9`) or two digits (valid if they form `10–26`), so `ways[i] = (single valid ? ways[i-1] : 0) + (pair valid ? ways[i-2] : 0)`. Keep only the last two values.

### Explanation
It's *Climbing Stairs* with conditions on each step:

- One-digit step from `i - 1`: allowed if `s[i-1] != '0'`.
- Two-digit step from `i - 2`: allowed if `s[i-2..i-1]` is between `"10"` and `"26"`.

Base: `ways[0] = 1` (empty prefix). A `'0'` that can't pair with the previous digit makes every later count 0 — e.g. `"30"` → 0. O(n) time, O(1) space with two rolling variables.

### Solution
type: brute
name: Recursion over one- and two-digit choices
time: O(2ⁿ)
space: O(n)

```javascript
function numDecodings(s) {
  const go = (i) => {
    if (i === s.length) return 1;
    if (s[i] === '0') return 0;
    let count = go(i + 1);
    if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) count += go(i + 2);
    return count;
  };
  return go(0);
}
```

```java
public int numDecodings(String s) {
    return go(s, 0);
}

private int go(String s, int i) {
    if (i == s.length()) return 1;
    if (s.charAt(i) == '0') return 0;
    int count = go(s, i + 1);
    if (i + 1 < s.length() && Integer.parseInt(s.substring(i, i + 2)) <= 26) count += go(s, i + 2);
    return count;
}
```

```python
def num_decodings(s):
    def go(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        count = go(i + 1)
        if i + 1 < len(s) and int(s[i : i + 2]) <= 26:
            count += go(i + 2)
        return count

    return go(0)
```

### Solution
type: optimal
name: Bottom-up DP with two rolling values
time: O(n)
space: O(1)

```javascript
function numDecodings(s) {
  let prev2 = 1; // ways for prefix length i - 2
  let prev1 = s[0] === '0' ? 0 : 1; // ways for prefix length i - 1
  for (let i = 2; i <= s.length; i++) {
    let curr = 0;
    if (s[i - 1] !== '0') curr += prev1;
    const pair = Number(s.slice(i - 2, i));
    if (pair >= 10 && pair <= 26) curr += prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

```java
public int numDecodings(String s) {
    int prev2 = 1, prev1 = s.charAt(0) == '0' ? 0 : 1;
    for (int i = 2; i <= s.length(); i++) {
        int curr = 0;
        if (s.charAt(i - 1) != '0') curr += prev1;
        int pair = Integer.parseInt(s.substring(i - 2, i));
        if (pair >= 10 && pair <= 26) curr += prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

```python
def num_decodings(s):
    prev2, prev1 = 1, 0 if s[0] == "0" else 1
    for i in range(2, len(s) + 1):
        curr = 0
        if s[i - 1] != "0":
            curr += prev1
        if 10 <= int(s[i - 2 : i]) <= 26:
            curr += prev2
        prev2, prev1 = prev1, curr
    return prev1
```

### Tests

```json
{
  "fn": "numDecodings",
  "cases": [
    {"args":["12"],"expect":2},
    {"args":["226"],"expect":3},
    {"args":["06"],"expect":0},
    {"args":["10"],"expect":1},
    {"args":["30"],"expect":0},
    {"args":["11106"],"expect":2},
    {"args":["2101"],"expect":1}
  ]
}
```

## Longest Palindromic Substring
difficulty: medium
faq: true
tags: string, dynamic-programming, two-pointers

### Question
Given a string `s`, return the longest palindromic **substring** (contiguous) in `s`. If there are several of the same length, any one is accepted.

**Example:** `s = "babad"` → `"bab"` (or `"aba"`); `s = "cbbd"` → `"bb"`.

### Answer
**Expand around centers.** Every palindrome is symmetric around its center, which is either a character (odd length) or the gap between two characters (even length). For each of the `2n - 1` centers, expand outward while the characters match, and keep the longest.

### Explanation
```
for each i:
  try center (i, i)       ← odd-length palindromes
  try center (i, i + 1)   ← even-length palindromes
  expand: while s[lo] == s[hi]: lo--, hi++
```

After expanding, the palindrome is `s[lo + 1 .. hi - 1]`. Each expansion is O(n), so O(n²) total with O(1) space — simpler and lighter than the O(n²)-space DP table (`dp[i][j] = s[i] == s[j] && dp[i+1][j-1]`). Manacher's algorithm achieves O(n) but is rarely expected in interviews.

### Solution
type: brute
name: Check every substring
time: O(n³)
space: O(1)

```javascript
function longestPalindrome(s) {
  const isPalindrome = (lo, hi) => {
    while (lo < hi) if (s[lo++] !== s[hi--]) return false;
    return true;
  };
  let best = '';
  for (let i = 0; i < s.length; i++) {
    for (let j = i + best.length; j < s.length; j++) {
      if (isPalindrome(i, j)) best = s.slice(i, j + 1);
    }
  }
  return best;
}
```

```java
public String longestPalindrome(String s) {
    String best = "";
    for (int i = 0; i < s.length(); i++) {
        for (int j = i + best.length(); j < s.length(); j++) {
            if (isPalindrome(s, i, j)) best = s.substring(i, j + 1);
        }
    }
    return best;
}

private boolean isPalindrome(String s, int lo, int hi) {
    while (lo < hi) {
        if (s.charAt(lo++) != s.charAt(hi--)) return false;
    }
    return true;
}
```

```python
def longest_palindrome(s):
    best = ""
    for i in range(len(s)):
        for j in range(i + len(best), len(s)):
            sub = s[i : j + 1]
            if sub == sub[::-1]:
                best = sub
    return best
```

### Solution
type: optimal
name: Expand around every center
time: O(n²)
space: O(1)

```javascript
function longestPalindrome(s) {
  let start = 0;
  let maxLen = 0;
  const expand = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--;
      hi++;
    }
    if (hi - lo - 1 > maxLen) {
      start = lo + 1;
      maxLen = hi - lo - 1;
    }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return s.slice(start, start + maxLen);
}
```

```java
private int start, maxLen;

public String longestPalindrome(String s) {
    start = 0;
    maxLen = 0;
    for (int i = 0; i < s.length(); i++) {
        expand(s, i, i);
        expand(s, i, i + 1);
    }
    return s.substring(start, start + maxLen);
}

private void expand(String s, int lo, int hi) {
    while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
        lo--;
        hi++;
    }
    if (hi - lo - 1 > maxLen) {
        start = lo + 1;
        maxLen = hi - lo - 1;
    }
}
```

```python
def longest_palindrome(s):
    start = max_len = 0

    def expand(lo, hi):
        nonlocal start, max_len
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        if hi - lo - 1 > max_len:
            start, max_len = lo + 1, hi - lo - 1

    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)
    return s[start : start + max_len]
```

### Solution
type: alternate
name: 2D DP table
time: O(n²)
space: O(n²)

`dp[i][j]` is true when `s[i..j]` is a palindrome: the ends match and the inside (`dp[i+1][j-1]`) is a palindrome. Fill by increasing `i` from the end so the inner value is ready.

```javascript
function longestPalindrome(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0;
  let maxLen = n ? 1 : 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      dp[i][j] = s[i] === s[j] && (j - i < 3 || dp[i + 1][j - 1]);
      if (dp[i][j] && j - i + 1 > maxLen) {
        start = i;
        maxLen = j - i + 1;
      }
    }
  }
  return s.slice(start, start + maxLen);
}
```

```java
public String longestPalindrome(String s) {
    int n = s.length(), start = 0, maxLen = n > 0 ? 1 : 0;
    boolean[][] dp = new boolean[n][n];
    for (int i = n - 1; i >= 0; i--) {
        for (int j = i; j < n; j++) {
            dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 3 || dp[i + 1][j - 1]);
            if (dp[i][j] && j - i + 1 > maxLen) {
                start = i;
                maxLen = j - i + 1;
            }
        }
    }
    return s.substring(start, start + maxLen);
}
```

```python
def longest_palindrome(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    start, max_len = 0, 1 if n else 0
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            dp[i][j] = s[i] == s[j] and (j - i < 3 or dp[i + 1][j - 1])
            if dp[i][j] and j - i + 1 > max_len:
                start, max_len = i, j - i + 1
    return s[start : start + max_len]
```

### Tests

```json
{
  "fn": "longestPalindrome",
  "opts": {"norm":"palin"},
  "cases": [
    {"args":["babad"],"expect":"bab"},
    {"args":["cbbd"],"expect":"bb"},
    {"args":["a"],"expect":"a"},
    {"args":["forgeeksskeegfor"],"expect":"geeksskeeg"},
    {"args":["ac"],"expect":"a"}
  ]
}
```
