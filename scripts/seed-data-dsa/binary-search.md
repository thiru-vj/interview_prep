## Binary Search
difficulty: easy
faq: true
tags: array, binary-search

### Question
Given a sorted (ascending) array of distinct integers `nums` and a `target`, return the index of `target`, or `-1` if it isn't present. Your algorithm must run in O(log n).

**Example:** `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9` → `4`; `target = 2` → `-1`.

### Answer
Keep a search range `[lo, hi]`. Compare the middle element with the target: if it's smaller, the target can only be to the right (`lo = mid + 1`); if larger, only to the left (`hi = mid - 1`). Each step halves the range.

### Explanation
1. `lo = 0`, `hi = n - 1`.
2. While `lo <= hi`: `mid = lo + (hi - lo) / 2` (avoids integer overflow in Java/C++).
   - `nums[mid] == target` → return `mid`.
   - `nums[mid] < target` → `lo = mid + 1`.
   - else → `hi = mid - 1`.
3. Return `-1`.

The loop condition `lo <= hi` (inclusive range) and the `± 1` updates must be consistent, or the loop can stall or skip an element.

### Solution
type: brute
name: Linear scan
time: O(n)
space: O(1)

```javascript
function search(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}
```

```java
public int search(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
```

```python
def search(nums, target):
    for i, num in enumerate(nums):
        if num == target:
            return i
    return -1
```

### Solution
type: optimal
name: Iterative binary search
time: O(log n)
space: O(1)

```javascript
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

```java
public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

```python
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

### Solution
type: alternate
name: Recursive binary search
time: O(log n)
space: O(log n) recursion stack

```javascript
function search(nums, target, lo = 0, hi = nums.length - 1) {
  if (lo > hi) return -1;
  const mid = lo + ((hi - lo) >> 1);
  if (nums[mid] === target) return mid;
  return nums[mid] < target ? search(nums, target, mid + 1, hi) : search(nums, target, lo, mid - 1);
}
```

```java
public int search(int[] nums, int target) {
    return search(nums, target, 0, nums.length - 1);
}

private int search(int[] nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    return nums[mid] < target ? search(nums, target, mid + 1, hi) : search(nums, target, lo, mid - 1);
}
```

```python
def search(nums, target, lo=0, hi=None):
    if hi is None:
        hi = len(nums) - 1
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        return search(nums, target, mid + 1, hi)
    return search(nums, target, lo, mid - 1)
```

### Tests

```json
{
  "fn": "search",
  "cases": [
    {"args":[[-1,0,3,5,9,12],9],"expect":4},
    {"args":[[-1,0,3,5,9,12],2],"expect":-1},
    {"args":[[5],5],"expect":0},
    {"args":[[1,2],2],"expect":1},
    {"args":[[],1],"expect":-1}
  ]
}
```

## Search in Rotated Sorted Array
difficulty: medium
faq: true
tags: array, binary-search

### Question
A sorted array of distinct integers has been rotated at an unknown pivot (e.g. `[0, 1, 2, 4, 5, 6, 7]` → `[4, 5, 6, 7, 0, 1, 2]`). Given the rotated array `nums` and a `target`, return its index or `-1`, in O(log n).

**Example:** `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0` → `4`; `target = 3` → `-1`.

### Answer
In a rotated array, at least one half around `mid` is always normally sorted. Check which half is sorted, then check whether the target lies within that sorted half's range — if so search there, otherwise search the other half.

### Explanation
At each step with `lo`, `mid`, `hi`:

- If `nums[lo] <= nums[mid]`, the **left half is sorted**. If `nums[lo] <= target < nums[mid]`, go left (`hi = mid - 1`); else go right.
- Otherwise the **right half is sorted**. If `nums[mid] < target <= nums[hi]`, go right (`lo = mid + 1`); else go left.

The sorted half gives a reliable range test, so each step still discards half the array.

### Solution
type: brute
name: Linear scan
time: O(n)
space: O(1)

```javascript
function searchRotated(nums, target) {
  return nums.indexOf(target);
}
```

```java
public int searchRotated(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
```

```python
def search_rotated(nums, target):
    return nums.index(target) if target in nums else -1
```

### Solution
type: optimal
name: Binary search on the sorted half
time: O(log n)
space: O(1)

```javascript
function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
```

```java
public int searchRotated(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
```

```python
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

### Solution
type: alternate
name: Find the pivot, then binary search one side
time: O(log n)
space: O(1)

First binary-search for the index of the minimum (the rotation point), then run a normal binary search on whichever sorted side could contain the target. Two simple searches instead of one tricky one.

```javascript
function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  const pivot = lo;
  const n = nums.length;
  [lo, hi] = target >= nums[pivot] && target <= nums[n - 1] ? [pivot, n - 1] : [0, pivot - 1];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

```java
public int searchRotated(int[] nums, int target) {
    int n = nums.length, lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int pivot = lo;
    if (target >= nums[pivot] && target <= nums[n - 1]) {
        lo = pivot;
        hi = n - 1;
    } else {
        lo = 0;
        hi = pivot - 1;
    }
    while (lo <= hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

```python
def search_rotated(nums, target):
    n = len(nums)
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    pivot = lo
    lo, hi = (pivot, n - 1) if nums[pivot] <= target <= nums[-1] else (0, pivot - 1)
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

### Tests

```json
{
  "fn": "searchRotated",
  "cases": [
    {"args":[[4,5,6,7,0,1,2],0],"expect":4},
    {"args":[[4,5,6,7,0,1,2],3],"expect":-1},
    {"args":[[1],0],"expect":-1},
    {"args":[[3,1],1],"expect":1},
    {"args":[[5,1,3],5],"expect":0},
    {"args":[[1,3],3],"expect":1},
    {"args":[[4,5,6,7,0,1,2],6],"expect":2}
  ]
}
```

## Find Minimum in Rotated Sorted Array
difficulty: medium
faq: true
tags: array, binary-search

### Question
A sorted array of **distinct** integers has been rotated between 1 and `n` times. Return its minimum element in O(log n).

**Example:** `nums = [3, 4, 5, 1, 2]` → `1`; `nums = [11, 13, 15, 17]` → `11`.

### Answer
Compare the middle element with the **last** element. If `nums[mid] > nums[hi]`, the drop (and therefore the minimum) is to the right of `mid`; otherwise the minimum is at `mid` or to its left. Shrink until `lo == hi`.

### Explanation
The array is two ascending runs; the minimum is the first element of the second run.

- `nums[mid] > nums[hi]` → `mid` is in the first (larger) run, so the minimum is strictly right: `lo = mid + 1`.
- Otherwise `mid` is in the second run, so the minimum is at `mid` or left: `hi = mid` (not `mid - 1` — `mid` itself may be the answer).

When `lo == hi`, that index is the minimum. Comparing with `nums[hi]` (not `nums[lo]`) also handles the un-rotated case cleanly.

### Solution
type: brute
name: Linear scan
time: O(n)
space: O(1)

```javascript
function findMin(nums) {
  return Math.min(...nums);
}
```

```java
public int findMin(int[] nums) {
    int min = nums[0];
    for (int num : nums) min = Math.min(min, num);
    return min;
}
```

```python
def find_min(nums):
    return min(nums)
```

### Solution
type: optimal
name: Binary search against the right end
time: O(log n)
space: O(1)

```javascript
function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}
```

```java
public int findMin(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}
```

```python
def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]
```

### Tests

```json
{
  "fn": "findMin",
  "cases": [
    {"args":[[3,4,5,1,2]],"expect":1},
    {"args":[[4,5,6,7,0,1,2]],"expect":0},
    {"args":[[11,13,15,17]],"expect":11},
    {"args":[[2,1]],"expect":1}
  ]
}
```

## Search a 2D Matrix
difficulty: medium
faq: false
tags: array, matrix, binary-search

### Question
You are given an `m × n` integer matrix where each row is sorted ascending and the first value of each row is greater than the last value of the previous row. Return `true` if `target` is in the matrix, in O(log(m · n)).

**Example:** `matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]`, `target = 3` → `true`; `target = 13` → `false`.

### Answer
Because of the ordering rules, reading the matrix row by row gives one fully sorted list of `m · n` values. Binary search over indices `0 .. m·n - 1`, mapping index `i` to cell `(i / n, i % n)`.

### Explanation
1. `lo = 0`, `hi = m * n - 1`.
2. `mid` → `row = floor(mid / n)`, `col = mid % n`; compare `matrix[row][col]` with the target exactly as in ordinary binary search.

No need to copy the matrix into a flat array — the index arithmetic does the flattening virtually, keeping space O(1).

### Solution
type: brute
name: Scan every cell
time: O(m · n)
space: O(1)

```javascript
function searchMatrix(matrix, target) {
  return matrix.some((row) => row.includes(target));
}
```

```java
public boolean searchMatrix(int[][] matrix, int target) {
    for (int[] row : matrix) {
        for (int value : row) {
            if (value == target) return true;
        }
    }
    return false;
}
```

```python
def search_matrix(matrix, target):
    return any(target in row for row in matrix)
```

### Solution
type: optimal
name: Binary search over the virtual flattened array
time: O(log(m · n))
space: O(1)

```javascript
function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0;
  let hi = m * n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = matrix[Math.floor(mid / n)][mid % n];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
```

```java
public boolean searchMatrix(int[][] matrix, int target) {
    int m = matrix.length, n = matrix[0].length;
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = (lo + hi) >>> 1;
        int value = matrix[mid / n][mid % n];
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}
```

```python
def search_matrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = matrix[mid // n][mid % n]
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
```

### Solution
type: alternate
name: Staircase search from the top-right
time: O(m + n)
space: O(1)

Start at the top-right corner: if the value is too big, move left; if too small, move down. Works even when only rows and columns are sorted independently (the "Search a 2D Matrix II" variant).

```javascript
function searchMatrix(matrix, target) {
  let row = 0;
  let col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    const value = matrix[row][col];
    if (value === target) return true;
    if (value > target) col--;
    else row++;
  }
  return false;
}
```

```java
public boolean searchMatrix(int[][] matrix, int target) {
    int row = 0, col = matrix[0].length - 1;
    while (row < matrix.length && col >= 0) {
        int value = matrix[row][col];
        if (value == target) return true;
        if (value > target) col--;
        else row++;
    }
    return false;
}
```

```python
def search_matrix(matrix, target):
    row, col = 0, len(matrix[0]) - 1
    while row < len(matrix) and col >= 0:
        value = matrix[row][col]
        if value == target:
            return True
        if value > target:
            col -= 1
        else:
            row += 1
    return False
```

### Tests

```json
{
  "fn": "searchMatrix",
  "cases": [
    {"args":[[[1,3,5,7],[10,11,16,20],[23,30,34,60]],3],"expect":true},
    {"args":[[[1,3,5,7],[10,11,16,20],[23,30,34,60]],13],"expect":false},
    {"args":[[[1,3,5,7],[10,11,16,20],[23,30,34,60]],60],"expect":true},
    {"args":[[[1]],2],"expect":false}
  ]
}
```

## Koko Eating Bananas
difficulty: medium
faq: true
tags: array, binary-search, binary-search-on-answer

### Question
Koko has `piles` of bananas and `h` hours. Each hour she picks one pile and eats up to `k` bananas from it (if the pile has fewer, she finishes it and waits out the hour). Return the minimum integer speed `k` that lets her eat everything within `h` hours.

**Example:** `piles = [3, 6, 7, 11]`, `h = 8` → `4`; `piles = [30, 11, 23, 4, 20]`, `h = 5` → `30`.

### Answer
**Binary search on the answer.** Hours needed at speed `k` is `Σ ceil(pile / k)`, which only decreases as `k` grows. Search `k` in `[1, max(piles)]` for the smallest speed whose hours are `<= h`.

### Explanation
The feasibility check "can she finish at speed `k`?" is monotonic: if speed `k` works, every faster speed works too. That turns an optimisation problem into a binary search:

1. `lo = 1`, `hi = max(piles)` (at that speed every pile takes one hour, which is always feasible since `h >= piles.length`).
2. `mid` feasible → the answer is `mid` or smaller: `hi = mid`. Not feasible → `lo = mid + 1`.
3. When `lo == hi`, that's the minimum feasible speed.

Each check is O(n), and there are O(log max) checks.

### Solution
type: brute
name: Try every speed from 1 upward
time: O(n · max(piles))
space: O(1)

```javascript
function minEatingSpeed(piles, h) {
  for (let k = 1; ; k++) {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / k);
    if (hours <= h) return k;
  }
}
```

```java
public int minEatingSpeed(int[] piles, int h) {
    for (int k = 1; ; k++) {
        long hours = 0;
        for (int pile : piles) hours += (pile + k - 1) / k;
        if (hours <= h) return k;
    }
}
```

```python
def min_eating_speed(piles, h):
    k = 1
    while True:
        if sum((pile + k - 1) // k for pile in piles) <= h:
            return k
        k += 1
```

### Solution
type: optimal
name: Binary search on the speed
time: O(n · log max(piles))
space: O(1)

```javascript
function minEatingSpeed(piles, h) {
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const k = (lo + hi) >> 1;
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / k);
    if (hours <= h) hi = k;
    else lo = k + 1;
  }
  return lo;
}
```

```java
public int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 0;
    for (int pile : piles) hi = Math.max(hi, pile);
    while (lo < hi) {
        int k = lo + (hi - lo) / 2;
        long hours = 0;
        for (int pile : piles) hours += (pile + k - 1) / k;
        if (hours <= h) hi = k;
        else lo = k + 1;
    }
    return lo;
}
```

```python
def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        hours = sum((pile + k - 1) // k for pile in piles)
        if hours <= h:
            hi = k
        else:
            lo = k + 1
    return lo
```

### Tests

```json
{
  "fn": "minEatingSpeed",
  "cases": [
    {"args":[[3,6,7,11],8],"expect":4},
    {"args":[[30,11,23,4,20],5],"expect":30},
    {"args":[[30,11,23,4,20],6],"expect":23}
  ]
}
```

## Median of Two Sorted Arrays
difficulty: hard
faq: true
tags: array, binary-search, divide-and-conquer

### Question
Given two sorted arrays `nums1` and `nums2` of sizes `m` and `n`, return the median of the two arrays combined. The overall run time should be O(log(m + n)).

**Example:** `nums1 = [1, 3]`, `nums2 = [2]` → `2.0`; `nums1 = [1, 2]`, `nums2 = [3, 4]` → `2.5`.

### Answer
Binary search a **partition** of the smaller array. Taking `i` elements from `nums1` and `half - i` from `nums2` forms the combined left half; the partition is correct when every left element is `<=` every right element (`A[i-1] <= B[j]` and `B[j-1] <= A[i]`). The median comes from the four boundary values.

### Explanation
Let `A` be the shorter array and `half = floor((m + n + 1) / 2)`.

1. Binary search `i` in `[0, m]`; set `j = half - i`.
2. Boundary values: `Aleft = A[i-1]`, `Aright = A[i]`, `Bleft = B[j-1]`, `Bright = B[j]` (use `-∞`/`+∞` past the ends).
3. If `Aleft > Bright`, too many elements came from `A` → `hi = i - 1`. If `Bleft > Aright`, too few → `lo = i + 1`.
4. Otherwise the partition is valid: for odd totals the median is `max(Aleft, Bleft)`; for even totals it's the average of that and `min(Aright, Bright)`.

Searching the shorter array gives O(log(min(m, n))).

### Solution
type: brute
name: Merge, then pick the middle
time: O(m + n)
space: O(m + n)

```javascript
function findMedianSortedArrays(nums1, nums2) {
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < nums1.length || j < nums2.length) {
    if (j >= nums2.length || (i < nums1.length && nums1[i] <= nums2[j])) merged.push(nums1[i++]);
    else merged.push(nums2[j++]);
  }
  const mid = merged.length >> 1;
  return merged.length % 2 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2;
}
```

```java
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int[] merged = new int[nums1.length + nums2.length];
    int i = 0, j = 0, k = 0;
    while (i < nums1.length || j < nums2.length) {
        if (j >= nums2.length || (i < nums1.length && nums1[i] <= nums2[j])) merged[k++] = nums1[i++];
        else merged[k++] = nums2[j++];
    }
    int mid = merged.length / 2;
    return merged.length % 2 == 1 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2.0;
}
```

```python
def find_median_sorted_arrays(nums1, nums2):
    merged = sorted(nums1 + nums2)
    mid = len(merged) // 2
    if len(merged) % 2:
        return float(merged[mid])
    return (merged[mid - 1] + merged[mid]) / 2
```

### Solution
type: optimal
name: Binary search the partition
time: O(log(min(m, n)))
space: O(1)

```javascript
function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
  const m = nums1.length;
  const n = nums2.length;
  const half = (m + n + 1) >> 1;
  let lo = 0;
  let hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1;
    const j = half - i;
    const aLeft = i > 0 ? nums1[i - 1] : -Infinity;
    const aRight = i < m ? nums1[i] : Infinity;
    const bLeft = j > 0 ? nums2[j - 1] : -Infinity;
    const bRight = j < n ? nums2[j] : Infinity;
    if (aLeft > bRight) hi = i - 1;
    else if (bLeft > aRight) lo = i + 1;
    else {
      const leftMax = Math.max(aLeft, bLeft);
      if ((m + n) % 2) return leftMax;
      return (leftMax + Math.min(aRight, bRight)) / 2;
    }
  }
  return 0;
}
```

```java
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    int m = nums1.length, n = nums2.length, half = (m + n + 1) / 2;
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int aLeft = i > 0 ? nums1[i - 1] : Integer.MIN_VALUE;
        int aRight = i < m ? nums1[i] : Integer.MAX_VALUE;
        int bLeft = j > 0 ? nums2[j - 1] : Integer.MIN_VALUE;
        int bRight = j < n ? nums2[j] : Integer.MAX_VALUE;
        if (aLeft > bRight) hi = i - 1;
        else if (bLeft > aRight) lo = i + 1;
        else {
            int leftMax = Math.max(aLeft, bLeft);
            if ((m + n) % 2 == 1) return leftMax;
            return (leftMax + (double) Math.min(aRight, bRight)) / 2;
        }
    }
    return 0;
}
```

```python
def find_median_sorted_arrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = nums1[i - 1] if i > 0 else float("-inf")
        a_right = nums1[i] if i < m else float("inf")
        b_left = nums2[j - 1] if j > 0 else float("-inf")
        b_right = nums2[j] if j < n else float("inf")
        if a_left > b_right:
            hi = i - 1
        elif b_left > a_right:
            lo = i + 1
        else:
            left_max = max(a_left, b_left)
            if (m + n) % 2:
                return float(left_max)
            return (left_max + min(a_right, b_right)) / 2
    return 0.0
```

### Tests

```json
{
  "fn": "findMedianSortedArrays",
  "cases": [
    {"args":[[1,3],[2]],"expect":2},
    {"args":[[1,2],[3,4]],"expect":2.5},
    {"args":[[],[1]],"expect":1},
    {"args":[[2],[]],"expect":2},
    {"args":[[1,5,9],[2,3,4,10]],"expect":4},
    {"args":[[0,0],[0,0]],"expect":0}
  ]
}
```
