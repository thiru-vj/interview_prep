## Single Number
difficulty: easy
faq: true
tags: array, bit-manipulation, xor

### Question
Given a non-empty integer array `nums` in which every element appears **twice** except for one, find that single element. Use O(n) time and O(1) extra space.

**Example:** `nums = [4, 1, 2, 1, 2]` → `4`.

### Answer
XOR all the numbers together. `x ^ x = 0` and `x ^ 0 = x`, and XOR is commutative and associative, so every pair cancels out and only the single number remains.

### Explanation
`4 ^ 1 ^ 2 ^ 1 ^ 2` can be regrouped as `4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = 4`.

Order doesn't matter, so one pass with an accumulator starting at 0 is enough — no hash set needed. This XOR-cancellation trick also powers *Missing Number* and finding two unique numbers (split by any set bit of their XOR).

### Solution
type: brute
name: Count occurrences with a hash map
time: O(n)
space: O(n)

```javascript
function singleNumber(nums) {
  const count = new Map();
  for (const num of nums) count.set(num, (count.get(num) ?? 0) + 1);
  for (const [num, c] of count) if (c === 1) return num;
  return -1;
}
```

```java
public int singleNumber(int[] nums) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) count.merge(num, 1, Integer::sum);
    for (Map.Entry<Integer, Integer> e : count.entrySet()) {
        if (e.getValue() == 1) return e.getKey();
    }
    return -1;
}
```

```python
from collections import Counter

def single_number(nums):
    return next(num for num, c in Counter(nums).items() if c == 1)
```

### Solution
type: optimal
name: XOR everything
time: O(n)
space: O(1)

```javascript
function singleNumber(nums) {
  let result = 0;
  for (const num of nums) result ^= num;
  return result;
}
```

```java
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) result ^= num;
    return result;
}
```

```python
from functools import reduce
from operator import xor

def single_number(nums):
    return reduce(xor, nums, 0)
```

### Tests

```json
{
  "fn": "singleNumber",
  "cases": [
    {"args":[[2,2,1]],"expect":1},
    {"args":[[4,1,2,1,2]],"expect":4},
    {"args":[[-3]],"expect":-3}
  ]
}
```

## Number of 1 Bits
difficulty: easy
faq: false
tags: bit-manipulation

### Question
Given a positive integer `n` (up to 2³¹ − 1), return the number of set bits (`1`s) in its binary representation — its **Hamming weight**.

**Example:** `n = 11` (binary `1011`) → `3`; `n = 128` (`10000000`) → `1`.

### Answer
Use `n & (n - 1)`, which clears the **lowest set bit**. Repeat until `n` is 0 and count the iterations — the loop runs once per `1` bit rather than once per bit position.

### Explanation
Subtracting 1 flips the lowest set bit to 0 and all the zeros below it to 1; AND-ing with the original then zeroes all of those positions:

```
n       = 1011 0100
n - 1   = 1011 0011
n&(n-1) = 1011 0000   ← lowest 1 removed
```

The simpler alternative checks each of the 32 bits with `n & 1` and shifts right. Both are O(1) for fixed-width integers, but Brian Kernighan's trick does fewer iterations for sparse numbers.

### Solution
type: brute
name: Check every bit
time: O(32)
space: O(1)

```javascript
function hammingWeight(n) {
  let count = 0;
  for (let i = 0; i < 32; i++) {
    if ((n >>> i) & 1) count++;
  }
  return count;
}
```

```java
public int hammingWeight(int n) {
    int count = 0;
    for (int i = 0; i < 32; i++) {
        if (((n >>> i) & 1) == 1) count++;
    }
    return count;
}
```

```python
def hamming_weight(n):
    count = 0
    for i in range(32):
        if (n >> i) & 1:
            count += 1
    return count
```

### Solution
type: optimal
name: Brian Kernighan — clear the lowest set bit
time: O(number of 1 bits)
space: O(1)

```javascript
function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}
```

```java
public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;
        count++;
    }
    return count;
}
```

```python
def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count
```

### Tests

```json
{
  "fn": "hammingWeight",
  "cases": [
    {"args":[11],"expect":3},
    {"args":[128],"expect":1},
    {"args":[2147483645],"expect":30}
  ]
}
```

## Counting Bits
difficulty: easy
faq: false
tags: bit-manipulation, dynamic-programming

### Question
Given an integer `n`, return an array `ans` of length `n + 1` where `ans[i]` is the number of `1`s in the binary representation of `i`. Can you do it in O(n)?

**Example:** `n = 5` → `[0, 1, 1, 2, 1, 2]`.

### Answer
Reuse earlier answers: `i >> 1` is `i` without its last bit, so `bits[i] = bits[i >> 1] + (i & 1)`. Each entry is O(1), so the whole array is O(n).

### Explanation
Shifting right drops the lowest bit. The count for `i` is the count for `i >> 1` (already computed, since it's smaller) plus 1 if the dropped bit was set.

```
5 = 101  →  5 >> 1 = 10 (2), which has 1 bit;  5 & 1 = 1  →  2 bits
```

Equivalent recurrence: `bits[i] = bits[i & (i - 1)] + 1` (remove the lowest set bit). Counting bits of each number independently costs O(n log n).

### Solution
type: brute
name: Count bits of every number separately
time: O(n log n)
space: O(1) extra

```javascript
function countBits(n) {
  const ans = [];
  for (let i = 0; i <= n; i++) {
    let x = i;
    let count = 0;
    while (x) {
      count += x & 1;
      x >>= 1;
    }
    ans.push(count);
  }
  return ans;
}
```

```java
public int[] countBits(int n) {
    int[] ans = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        int x = i;
        while (x != 0) {
            ans[i] += x & 1;
            x >>= 1;
        }
    }
    return ans;
}
```

```python
def count_bits(n):
    return [bin(i).count("1") for i in range(n + 1)]
```

### Solution
type: optimal
name: DP on the shifted value
time: O(n)
space: O(1) extra (output excluded)

```javascript
function countBits(n) {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
  return ans;
}
```

```java
public int[] countBits(int n) {
    int[] ans = new int[n + 1];
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}
```

```python
def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans
```

### Tests

```json
{
  "fn": "countBits",
  "cases": [
    {"args":[2],"expect":[0,1,1]},
    {"args":[5],"expect":[0,1,1,2,1,2]},
    {"args":[0],"expect":[0]}
  ]
}
```

## Missing Number
difficulty: easy
faq: true
tags: array, bit-manipulation, math

### Question
Given an array `nums` containing `n` **distinct** numbers from the range `[0, n]`, return the only number in the range that's missing.

**Example:** `nums = [3, 0, 1]` → `2`; `nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]` → `8`.

### Answer
The sum of `0..n` is `n(n + 1) / 2`; subtract the actual sum and what's left is the missing number. (The XOR variant — XOR all indices `0..n` with all values — avoids any overflow concern.)

### Explanation
**Gauss sum:** `expected = n * (n + 1) / 2`, `missing = expected - sum(nums)`. O(n) time, O(1) space. In languages with fixed-width integers the sum could overflow for huge `n`.

**XOR:** `result = n`; for each index `i`, `result ^= i ^ nums[i]`. Every number that's present appears twice (once as an index, once as a value) and cancels, leaving only the missing one. Same complexity, no overflow.

### Solution
type: brute
name: Sort and find the gap
time: O(n log n)
space: O(1)–O(n) depending on the sort

```javascript
function missingNumber(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) return i;
  }
  return sorted.length;
}
```

```java
public int missingNumber(int[] nums) {
    Arrays.sort(nums);
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] != i) return i;
    }
    return nums.length;
}
```

```python
def missing_number(nums):
    for i, num in enumerate(sorted(nums)):
        if num != i:
            return i
    return len(nums)
```

### Solution
type: optimal
name: Gauss sum
time: O(n)
space: O(1)

```javascript
function missingNumber(nums) {
  const n = nums.length;
  return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);
}
```

```java
public int missingNumber(int[] nums) {
    int n = nums.length, sum = 0;
    for (int num : nums) sum += num;
    return n * (n + 1) / 2 - sum;
}
```

```python
def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)
```

### Solution
type: alternate
name: XOR indices with values
time: O(n)
space: O(1)

```javascript
function missingNumber(nums) {
  let result = nums.length;
  for (let i = 0; i < nums.length; i++) result ^= i ^ nums[i];
  return result;
}
```

```java
public int missingNumber(int[] nums) {
    int result = nums.length;
    for (int i = 0; i < nums.length; i++) result ^= i ^ nums[i];
    return result;
}
```

```python
def missing_number(nums):
    result = len(nums)
    for i, num in enumerate(nums):
        result ^= i ^ num
    return result
```

### Tests

```json
{
  "fn": "missingNumber",
  "cases": [
    {"args":[[3,0,1]],"expect":2},
    {"args":[[0,1]],"expect":2},
    {"args":[[9,6,4,2,3,5,7,0,1]],"expect":8},
    {"args":[[1]],"expect":0}
  ]
}
```
