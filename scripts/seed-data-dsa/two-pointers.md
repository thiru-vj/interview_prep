## Valid Palindrome
difficulty: easy
faq: true
tags: string, two-pointers

### Question
A phrase is a palindrome if, after lowercasing it and removing every non-alphanumeric character, it reads the same forwards and backwards. Given a string `s`, return `true` if it is a palindrome.

**Example:** `s = "A man, a plan, a canal: Panama"` → `true`; `s = "race a car"` → `false`.

### Answer
Put one pointer at each end. Skip characters that aren't letters or digits, compare the two characters case-insensitively, and move both pointers inward. Any mismatch means it's not a palindrome.

### Explanation
1. `left = 0`, `right = s.length - 1`.
2. While `left < right`: advance `left` past non-alphanumerics, retreat `right` past non-alphanumerics.
3. Compare lowercased `s[left]` and `s[right]`; return `false` on a mismatch, otherwise `left++`, `right--`.
4. Return `true`.

This avoids building a cleaned copy of the string, so extra space is O(1).

### Solution
type: brute
name: Clean the string, then compare with its reverse
time: O(n)
space: O(n)

```javascript
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === [...cleaned].reverse().join('');
}
```

```java
public boolean isPalindrome(String s) {
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    return cleaned.equals(new StringBuilder(cleaned).reverse().toString());
}
```

```python
def is_palindrome(s):
    cleaned = [ch.lower() for ch in s if ch.isalnum()]
    return cleaned == cleaned[::-1]
```

### Solution
type: optimal
name: Two pointers from both ends
time: O(n)
space: O(1)

```javascript
function isPalindrome(s) {
  const isAlnum = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}
```

```java
public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
        left++;
        right--;
    }
    return true;
}
```

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
```

### Tests

```json
{
  "fn": "isPalindrome",
  "cases": [
    {"args":["A man, a plan, a canal: Panama"],"expect":true},
    {"args":["race a car"],"expect":false},
    {"args":[" "],"expect":true},
    {"args":["0P"],"expect":false}
  ]
}
```

## Two Sum II - Input Array Is Sorted
difficulty: medium
faq: false
tags: array, two-pointers, binary-search

### Question
Given a **1-indexed** array of integers `numbers` sorted in non-decreasing order, find two numbers that add up to `target` and return their indices `[index1, index2]` (1-indexed, `index1 < index2`). Exactly one solution exists. Use only constant extra space.

**Example:** `numbers = [2, 7, 11, 15]`, `target = 9` → `[1, 2]`.

### Answer
Start with pointers at both ends. If the sum is too small, move the left pointer right (to a bigger number); if it's too big, move the right pointer left. Sortedness guarantees you never skip the answer.

### Explanation
At any moment, `numbers[left] + numbers[right]` is compared with `target`:

- **Equal** → return `[left + 1, right + 1]`.
- **Less** → `numbers[left]` can't pair with anything (even the largest remaining value is too small), so `left++`.
- **Greater** → `numbers[right]` can't pair with anything, so `right--`.

Each step discards one element, so it's O(n) with O(1) space — better than a hash map's O(n) space.

### Solution
type: brute
name: Binary search for each complement
time: O(n log n)
space: O(1)

```javascript
function twoSumSorted(numbers, target) {
  for (let i = 0; i < numbers.length; i++) {
    const need = target - numbers[i];
    let lo = i + 1;
    let hi = numbers.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (numbers[mid] === need) return [i + 1, mid + 1];
      if (numbers[mid] < need) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return [];
}
```

```java
public int[] twoSumSorted(int[] numbers, int target) {
    for (int i = 0; i < numbers.length; i++) {
        int need = target - numbers[i];
        int lo = i + 1, hi = numbers.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (numbers[mid] == need) return new int[] {i + 1, mid + 1};
            if (numbers[mid] < need) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return new int[0];
}
```

```python
def two_sum_sorted(numbers, target):
    for i, num in enumerate(numbers):
        need = target - num
        lo, hi = i + 1, len(numbers) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if numbers[mid] == need:
                return [i + 1, mid + 1]
            if numbers[mid] < need:
                lo = mid + 1
            else:
                hi = mid - 1
    return []
```

### Solution
type: optimal
name: Two pointers
time: O(n)
space: O(1)

```javascript
function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}
```

```java
public int[] twoSumSorted(int[] numbers, int target) {
    int left = 0, right = numbers.length - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return new int[] {left + 1, right + 1};
        if (sum < target) left++;
        else right--;
    }
    return new int[0];
}
```

```python
def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
    return []
```

### Tests

```json
{
  "fn": "twoSumSorted",
  "cases": [
    {"args":[[2,7,11,15],9],"expect":[1,2]},
    {"args":[[2,3,4],6],"expect":[1,3]},
    {"args":[[-1,0],-1],"expect":[1,2]}
  ]
}
```

## 3Sum
difficulty: medium
faq: true
tags: array, two-pointers, sorting

### Question
Given an integer array `nums`, return all **unique** triplets `[a, b, c]` from different indices such that `a + b + c = 0`. The result must not contain duplicate triplets.

**Example:** `nums = [-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`.

### Answer
Sort the array. Fix each element `nums[i]` as the first number, then run the sorted two-pointer Two Sum on the rest looking for `-nums[i]`. Skip equal neighbours at both levels to avoid duplicate triplets.

### Explanation
1. Sort `nums`.
2. For each `i` (skipping `i` if `nums[i] == nums[i - 1]`, and stopping once `nums[i] > 0`):
   - `left = i + 1`, `right = n - 1`.
   - If `nums[i] + nums[left] + nums[right]` is `< 0`, move `left` right; if `> 0`, move `right` left.
   - If it's `0`, record the triplet, then move `left` forward past any duplicates.
3. Sorting costs O(n log n), and each `i` runs an O(n) scan, giving O(n²) total.

### Solution
type: brute
name: Try every triplet, dedupe with a set
time: O(n³)
space: O(k) for the unique triplets

```javascript
function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const seen = new Set();
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        if (sorted[i] + sorted[j] + sorted[k] !== 0) continue;
        const key = `${sorted[i]},${sorted[j]},${sorted[k]}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push([sorted[i], sorted[j], sorted[k]]);
        }
      }
    }
  }
  return result;
}
```

```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    Set<List<Integer>> seen = new LinkedHashSet<>();
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            for (int k = j + 1; k < nums.length; k++) {
                if (nums[i] + nums[j] + nums[k] == 0) seen.add(List.of(nums[i], nums[j], nums[k]));
            }
        }
    }
    return new ArrayList<>(seen);
}
```

```python
def three_sum(nums):
    nums = sorted(nums)
    seen = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    seen.add((nums[i], nums[j], nums[k]))
    return [list(t) for t in seen]
```

### Solution
type: optimal
name: Sort + two pointers
time: O(n²)
space: O(1) extra (ignoring sort and output)

```javascript
function threeSum(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum < 0) left++;
      else if (sum > 0) right--;
      else {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
      }
    }
  }
  return result;
}
```

```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum < 0) left++;
            else if (sum > 0) right--;
            else {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                left++;
                right--;
                while (left < right && nums[left] == nums[left - 1]) left++;
            }
        }
    }
    return result;
}
```

```python
def three_sum(nums):
    nums = sorted(nums)
    result = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
    return result
```

### Solution
type: alternate
name: Fix one number + hash set for the pair
time: O(n²)
space: O(n)

Same O(n²) time without the two-pointer scan: for each `i`, run the hash-set Two Sum over the rest. Sorting first still makes deduplication easy.

```javascript
function threeSum(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    const seen = new Set();
    for (let j = i + 1; j < nums.length; j++) {
      const need = -nums[i] - nums[j];
      if (seen.has(need)) {
        result.push([nums[i], need, nums[j]]);
        while (j + 1 < nums.length && nums[j + 1] === nums[j]) j++;
      }
      seen.add(nums[j]);
    }
  }
  return result;
}
```

```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        Set<Integer> seen = new HashSet<>();
        for (int j = i + 1; j < nums.length; j++) {
            int need = -nums[i] - nums[j];
            if (seen.contains(need)) {
                result.add(Arrays.asList(nums[i], need, nums[j]));
                while (j + 1 < nums.length && nums[j + 1] == nums[j]) j++;
            }
            seen.add(nums[j]);
        }
    }
    return result;
}
```

```python
def three_sum(nums):
    nums = sorted(nums)
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        seen = set()
        j = i + 1
        while j < len(nums):
            need = -nums[i] - nums[j]
            if need in seen:
                result.append([nums[i], need, nums[j]])
                while j + 1 < len(nums) and nums[j + 1] == nums[j]:
                    j += 1
            seen.add(nums[j])
            j += 1
    return result
```

### Tests

```json
{
  "fn": "threeSum",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[[-1,0,1,2,-1,-4]],"expect":[[-1,-1,2],[-1,0,1]]},
    {"args":[[0,1,1]],"expect":[]},
    {"args":[[0,0,0,0]],"expect":[[0,0,0]]},
    {"args":[[-2,0,0,2,2]],"expect":[[-2,0,2]]},
    {"args":[[-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]],"expect":[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]}
  ]
}
```

## Container With Most Water
difficulty: medium
faq: true
tags: array, two-pointers, greedy

### Question
You are given an array `height` where `height[i]` is the height of a vertical line at position `i`. Pick two lines that, together with the x-axis, form a container holding the most water. Return that maximum area.

**Example:** `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49` (lines at index 1 and 8: `min(8, 7) × 7`).

### Answer
Start with the widest container (pointers at both ends) and repeatedly move the pointer at the **shorter** line inward. The shorter line limits the area, so keeping it while narrowing can never help — moving it is the only move that might.

### Explanation
Area = `min(height[l], height[r]) × (r - l)`.

When you move a pointer inward the width shrinks, so the area can only grow if the limiting height grows. If `height[l] < height[r]`, every container using `l` with a closer right line is no taller than `height[l]` and narrower — so `l` is "used up" and can be discarded. Repeat until the pointers meet, tracking the best area. Each step discards one line: O(n).

### Solution
type: brute
name: Every pair of lines
time: O(n²)
space: O(1)

```javascript
function maxArea(height) {
  let best = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
    }
  }
  return best;
}
```

```java
public int maxArea(int[] height) {
    int best = 0;
    for (int i = 0; i < height.length; i++) {
        for (int j = i + 1; j < height.length; j++) {
            best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
        }
    }
    return best;
}
```

```python
def max_area(height):
    best = 0
    for i in range(len(height)):
        for j in range(i + 1, len(height)):
            best = max(best, min(height[i], height[j]) * (j - i))
    return best
```

### Solution
type: optimal
name: Two pointers, move the shorter line
time: O(n)
space: O(1)

```javascript
function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}
```

```java
public int maxArea(int[] height) {
    int left = 0, right = height.length - 1, best = 0;
    while (left < right) {
        best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
        if (height[left] < height[right]) left++;
        else right--;
    }
    return best;
}
```

```python
def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        best = max(best, min(height[left], height[right]) * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best
```

### Tests

```json
{
  "fn": "maxArea",
  "cases": [
    {"args":[[1,8,6,2,5,4,8,3,7]],"expect":49},
    {"args":[[1,1]],"expect":1}
  ]
}
```

## Trapping Rain Water
difficulty: hard
faq: true
tags: array, two-pointers, prefix-max, stack

### Question
Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how much rain water it can trap.

**Example:** `height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` → `6`.

### Answer
Water above bar `i` is `min(maxLeft, maxRight) - height[i]`. Use two pointers: always process the side with the smaller running max, because that side's max is guaranteed to be the limiting wall.

### Explanation
The water level over each bar is set by the shorter of the tallest walls to its left and right.

**Two pointers:** keep `leftMax` and `rightMax`. If `leftMax < rightMax`, the left bar's water is limited by `leftMax` regardless of what lies further right (there's already a taller wall on the right), so add `leftMax - height[left]` and move `left`. Otherwise do the mirror image on the right.

This gives the prefix/suffix-max answer in one pass with O(1) space.

### Solution
type: brute
name: Scan left and right for every bar
time: O(n²)
space: O(1)

```javascript
function trap(height) {
  let water = 0;
  for (let i = 0; i < height.length; i++) {
    let leftMax = 0;
    let rightMax = 0;
    for (let j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
    for (let j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
    water += Math.min(leftMax, rightMax) - height[i];
  }
  return water;
}
```

```java
public int trap(int[] height) {
    int water = 0;
    for (int i = 0; i < height.length; i++) {
        int leftMax = 0, rightMax = 0;
        for (int j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
        for (int j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
        water += Math.min(leftMax, rightMax) - height[i];
    }
    return water;
}
```

```python
def trap(height):
    water = 0
    for i in range(len(height)):
        left_max = max(height[: i + 1])
        right_max = max(height[i:])
        water += min(left_max, right_max) - height[i]
    return water
```

### Solution
type: optimal
name: Two pointers with running maxima
time: O(n)
space: O(1)

```javascript
function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);
    if (leftMax < rightMax) {
      water += leftMax - height[left];
      left++;
    } else {
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}
```

```java
public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        leftMax = Math.max(leftMax, height[left]);
        rightMax = Math.max(rightMax, height[right]);
        if (leftMax < rightMax) {
            water += leftMax - height[left];
            left++;
        } else {
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
}
```

```python
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        left_max = max(left_max, height[left])
        right_max = max(right_max, height[right])
        if left_max < right_max:
            water += left_max - height[left]
            left += 1
        else:
            water += right_max - height[right]
            right -= 1
    return water
```

### Solution
type: alternate
name: Prefix and suffix max arrays
time: O(n)
space: O(n)

Precompute `leftMax[i]` and `rightMax[i]` in two passes, then sum `min(leftMax[i], rightMax[i]) - height[i]`. Easier to derive than the two-pointer version and a good stepping stone to it.

```javascript
function trap(height) {
  const n = height.length;
  if (n === 0) return 0;
  const leftMax = new Array(n);
  const rightMax = new Array(n);
  leftMax[0] = height[0];
  for (let i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
  let water = 0;
  for (let i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
  return water;
}
```

```java
public int trap(int[] height) {
    int n = height.length;
    if (n == 0) return 0;
    int[] leftMax = new int[n], rightMax = new int[n];
    leftMax[0] = height[0];
    for (int i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    rightMax[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    int water = 0;
    for (int i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
    return water;
}
```

```python
def trap(height):
    n = len(height)
    if n == 0:
        return 0
    left_max = [0] * n
    right_max = [0] * n
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], height[i])
    right_max[-1] = height[-1]
    for i in range(n - 2, -1, -1):
        right_max[i] = max(right_max[i + 1], height[i])
    return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))
```

### Tests

```json
{
  "fn": "trap",
  "cases": [
    {"args":[[0,1,0,2,1,0,1,3,2,1,2,1]],"expect":6},
    {"args":[[4,2,0,3,2,5]],"expect":9},
    {"args":[[]],"expect":0}
  ]
}
```

## Remove Duplicates from Sorted Array
difficulty: easy
faq: false
tags: array, two-pointers, in-place

### Question
Given an integer array `nums` sorted in non-decreasing order, remove the duplicates **in place** so each unique element appears once, keeping their relative order. Return `k`, the number of unique elements; the first `k` slots of `nums` must hold them.

**Example:** `nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]` → `k = 5`, with `nums` starting `[0, 1, 2, 3, 4, ...]`.

### Answer
Use a slow write pointer and a fast read pointer. Because the array is sorted, a value is new exactly when it differs from the last value written — copy it to the write position and advance.

### Explanation
1. `write = 1` (the first element is always unique).
2. For `read` from 1 to the end: if `nums[read] != nums[write - 1]`, set `nums[write] = nums[read]` and `write++`.
3. Return `write`.

Sortedness means duplicates are adjacent, so comparing against the last written value is enough — no set needed.

### Solution
type: brute
name: Collect unique values with a set
time: O(n)
space: O(n)

```javascript
function removeDuplicates(nums) {
  const unique = [...new Set(nums)];
  unique.forEach((value, i) => (nums[i] = value));
  return unique.length;
}
```

```java
public int removeDuplicates(int[] nums) {
    Set<Integer> unique = new LinkedHashSet<>();
    for (int num : nums) unique.add(num);
    int i = 0;
    for (int value : unique) nums[i++] = value;
    return unique.size();
}
```

```python
def remove_duplicates(nums):
    unique = list(dict.fromkeys(nums))
    nums[: len(unique)] = unique
    return len(unique)
```

### Solution
type: optimal
name: Read/write pointers
time: O(n)
space: O(1)

```javascript
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) nums[write++] = nums[read];
  }
  return write;
}
```

```java
public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int write = 1;
    for (int read = 1; read < nums.length; read++) {
        if (nums[read] != nums[write - 1]) nums[write++] = nums[read];
    }
    return write;
}
```

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
```

### Tests

```json
{
  "fn": "removeDuplicates",
  "opts": {"prefix":true},
  "cases": [
    {"args":[[0,0,1,1,1,2,2,3,3,4]],"expect":[5,[0,1,2,3,4]]},
    {"args":[[1,1,2]],"expect":[2,[1,2]]}
  ]
}
```

## Sort Colors
difficulty: medium
faq: false
tags: array, two-pointers, dutch-national-flag

### Question
Given an array `nums` containing only `0`s, `1`s and `2`s (red, white, blue), sort it **in place** so equal colors are adjacent in the order 0, 1, 2 — without using a library sort.

**Example:** `nums = [2, 0, 2, 1, 1, 0]` → `[0, 0, 1, 1, 2, 2]`.

### Answer
**Dutch National Flag:** keep three regions with pointers `low`, `mid`, `high`. A `0` at `mid` swaps to `low`, a `2` swaps to `high`, a `1` just advances `mid`. One pass, O(1) space.

### Explanation
Invariant: `[0, low)` are 0s, `[low, mid)` are 1s, `(high, end]` are 2s, and `[mid, high]` is unprocessed.

- `nums[mid] == 0` → swap with `nums[low]`, `low++`, `mid++`.
- `nums[mid] == 1` → `mid++`.
- `nums[mid] == 2` → swap with `nums[high]`, `high--` (don't advance `mid`: the swapped-in value hasn't been examined yet).

Stop when `mid > high`.

### Solution
type: brute
name: Counting sort (two passes)
time: O(n)
space: O(1)

Count how many 0s, 1s and 2s there are, then overwrite the array. Simple and linear, but takes two passes.

```javascript
function sortColors(nums) {
  const count = [0, 0, 0];
  for (const num of nums) count[num]++;
  let i = 0;
  for (let color = 0; color < 3; color++) {
    for (let c = 0; c < count[color]; c++) nums[i++] = color;
  }
  return nums;
}
```

```java
public void sortColors(int[] nums) {
    int[] count = new int[3];
    for (int num : nums) count[num]++;
    int i = 0;
    for (int color = 0; color < 3; color++) {
        for (int c = 0; c < count[color]; c++) nums[i++] = color;
    }
}
```

```python
def sort_colors(nums):
    count = [0, 0, 0]
    for num in nums:
        count[num] += 1
    i = 0
    for color in range(3):
        for _ in range(count[color]):
            nums[i] = color
            i += 1
    return nums
```

### Solution
type: optimal
name: Dutch National Flag (one pass)
time: O(n)
space: O(1)

```javascript
function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}
```

```java
public void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            int tmp = nums[low];
            nums[low++] = nums[mid];
            nums[mid++] = tmp;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            int tmp = nums[high];
            nums[high--] = nums[mid];
            nums[mid] = tmp;
        }
    }
}
```

```python
def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
    return nums
```

### Tests

```json
{
  "fn": "sortColors",
  "opts": {"mutates":"self"},
  "cases": [
    {"args":[[2,0,2,1,1,0]],"expect":[0,0,1,1,2,2]},
    {"args":[[2,0,1]],"expect":[0,1,2]}
  ]
}
```
