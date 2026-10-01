## Two Sum
difficulty: easy
faq: true
tags: array, hash-map

### Question
Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`. Exactly one valid answer exists, and you may not use the same element twice.

**Example:** `nums = [2, 7, 11, 15]`, `target = 9` → `[0, 1]` (because `2 + 7 = 9`).

### Answer
For each number, the partner it needs is `target - num`. Store every number you've seen in a hash map (value → index); if the partner is already in the map, you've found the pair in a single pass.

### Explanation
1. Create an empty map from value to index.
2. Walk the array. For each `nums[i]`, compute `complement = target - nums[i]`.
3. If `complement` is already in the map, return `[map[complement], i]`.
4. Otherwise store `nums[i] → i` and continue.

Checking *before* inserting guarantees we never pair an element with itself. The map turns the inner "search for the partner" loop of the brute force into an O(1) lookup.

### Solution
type: brute
name: Check every pair
time: O(n²)
space: O(1)

```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}
```

```java
public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) return new int[] {i, j};
        }
    }
    return new int[0];
}
```

```python
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

### Solution
type: optimal
name: One-pass hash map
time: O(n)
space: O(n)

```javascript
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) return new int[] {seen.get(complement), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}
```

```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

### Solution
type: alternate
name: Sort + two pointers
time: O(n log n)
space: O(n)

Sort the indices by value, then move two pointers inward. Useful when the interviewer forbids extra hash maps or the input is already sorted (see *Two Sum II*).

```javascript
function twoSum(nums, target) {
  const idx = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]);
  let lo = 0;
  let hi = idx.length - 1;
  while (lo < hi) {
    const sum = nums[idx[lo]] + nums[idx[hi]];
    if (sum === target) return [idx[lo], idx[hi]].sort((a, b) => a - b);
    if (sum < target) lo++;
    else hi--;
  }
  return [];
}
```

```java
public int[] twoSum(int[] nums, int target) {
    Integer[] idx = new Integer[nums.length];
    for (int i = 0; i < nums.length; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> Integer.compare(nums[a], nums[b]));
    int lo = 0, hi = idx.length - 1;
    while (lo < hi) {
        int sum = nums[idx[lo]] + nums[idx[hi]];
        if (sum == target) return new int[] {Math.min(idx[lo], idx[hi]), Math.max(idx[lo], idx[hi])};
        if (sum < target) lo++;
        else hi--;
    }
    return new int[0];
}
```

```python
def two_sum(nums, target):
    idx = sorted(range(len(nums)), key=lambda i: nums[i])
    lo, hi = 0, len(idx) - 1
    while lo < hi:
        total = nums[idx[lo]] + nums[idx[hi]]
        if total == target:
            return sorted([idx[lo], idx[hi]])
        if total < target:
            lo += 1
        else:
            hi -= 1
    return []
```

### Tests

```json
{
  "fn": "twoSum",
  "cases": [
    {"args":[[2,7,11,15],9],"expect":[0,1]},
    {"args":[[3,2,4],6],"expect":[1,2]},
    {"args":[[3,3],6],"expect":[0,1]}
  ]
}
```

## Contains Duplicate
difficulty: easy
faq: true
tags: array, hash-set, sorting

### Question
Given an integer array `nums`, return `true` if any value appears **at least twice**, and `false` if every element is distinct.

**Example:** `nums = [1, 2, 3, 1]` → `true`; `nums = [1, 2, 3, 4]` → `false`.

### Answer
Add each number to a hash set; if a number is already in the set, you've found a duplicate. One pass, O(n) time.

### Explanation
A set gives O(1) average membership checks. Walk the array once: if the current number is already in the set, return `true` immediately; otherwise add it. If the loop finishes, all values were distinct.

Sorting is the space-saving alternative: after sorting, duplicates sit next to each other, so one scan comparing neighbours finds them in O(n log n) time.

### Solution
type: brute
name: Compare every pair
time: O(n²)
space: O(1)

```javascript
function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}
```

```java
public boolean containsDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}
```

```python
def contains_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False
```

### Solution
type: optimal
name: Hash set
time: O(n)
space: O(n)

```javascript
function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}
```

```java
public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (!seen.add(num)) return true;
    }
    return false;
}
```

```python
def contains_duplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False
```

### Solution
type: alternate
name: Sort and compare neighbours
time: O(n log n)
space: O(1) extra (ignoring sort internals)

```javascript
function containsDuplicate(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return true;
  }
  return false;
}
```

```java
public boolean containsDuplicate(int[] nums) {
    Arrays.sort(nums);
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) return true;
    }
    return false;
}
```

```python
def contains_duplicate(nums):
    nums = sorted(nums)
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    return False
```

### Tests

```json
{
  "fn": "containsDuplicate",
  "cases": [
    {"args":[[1,2,3,1]],"expect":true},
    {"args":[[1,2,3,4]],"expect":false},
    {"args":[[]],"expect":false}
  ]
}
```

## Valid Anagram
difficulty: easy
faq: true
tags: string, hash-map, counting

### Question
Given two strings `s` and `t`, return `true` if `t` is an anagram of `s` — i.e. it uses exactly the same characters the same number of times — and `false` otherwise. Assume lowercase English letters.

**Example:** `s = "anagram"`, `t = "nagaram"` → `true`; `s = "rat"`, `t = "car"` → `false`.

### Answer
Count character frequencies: increment for each character of `s`, decrement for each of `t`. They're anagrams exactly when every count ends at zero (and the lengths match).

### Explanation
1. If the lengths differ, return `false` immediately.
2. Use a 26-slot array (or a map for Unicode). For each index `i`, do `count[s[i]]++` and `count[t[i]]--`.
3. If any slot is non-zero at the end, some character appears a different number of times.

The fixed-size array makes the extra space O(1) — it never grows with the input.

### Solution
type: brute
name: Sort both strings
time: O(n log n)
space: O(n)

```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  return [...s].sort().join('') === [...t].sort().join('');
}
```

```java
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    char[] a = s.toCharArray();
    char[] b = t.toCharArray();
    Arrays.sort(a);
    Arrays.sort(b);
    return Arrays.equals(a, b);
}
```

```python
def is_anagram(s, t):
    return len(s) == len(t) and sorted(s) == sorted(t)
```

### Solution
type: optimal
name: Frequency count
time: O(n)
space: O(1) — 26 counters

```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every((c) => c === 0);
}
```

```java
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}
```

```python
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord('a')] += 1
        count[ord(b) - ord('a')] -= 1
    return all(c == 0 for c in count)
```

### Tests

```json
{
  "fn": "isAnagram",
  "cases": [
    {"args":["anagram","nagaram"],"expect":true},
    {"args":["rat","car"],"expect":false},
    {"args":["a","ab"],"expect":false}
  ]
}
```

## Group Anagrams
difficulty: medium
faq: true
tags: string, hash-map, sorting

### Question
Given an array of strings `strs`, group the anagrams together. Return the groups in any order.

**Example:** `strs = ["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`.

### Answer
Give every word a canonical key that is identical for all its anagrams — its sorted letters, or its 26-letter count signature — and bucket words by that key in a hash map.

### Explanation
Two words are anagrams exactly when they have the same letter counts. So:

1. For each word, build a key: either `sorted(word)` (O(k log k)) or a string of 26 counts like `"1#0#0#...#"` (O(k)).
2. Append the word to `map[key]`.
3. Return the map's values.

The count-signature key avoids sorting, which matters for long words; the sorted key is simpler to write and usually fine in interviews.

### Solution
type: brute
name: Compare each word against existing groups
time: O(n² · k log k)
space: O(n · k)

For each word, scan the groups built so far and check whether it's an anagram of the group's first word.

```javascript
function groupAnagrams(strs) {
  const sortWord = (w) => [...w].sort().join('');
  const groups = [];
  for (const word of strs) {
    const key = sortWord(word);
    const group = groups.find((g) => sortWord(g[0]) === key);
    if (group) group.push(word);
    else groups.push([word]);
  }
  return groups;
}
```

```java
public List<List<String>> groupAnagrams(String[] strs) {
    List<List<String>> groups = new ArrayList<>();
    for (String word : strs) {
        String key = sortWord(word);
        List<String> match = null;
        for (List<String> group : groups) {
            if (sortWord(group.get(0)).equals(key)) {
                match = group;
                break;
            }
        }
        if (match == null) {
            match = new ArrayList<>();
            groups.add(match);
        }
        match.add(word);
    }
    return groups;
}

private String sortWord(String word) {
    char[] chars = word.toCharArray();
    Arrays.sort(chars);
    return new String(chars);
}
```

```python
def group_anagrams(strs):
    groups = []
    for word in strs:
        key = sorted(word)
        for group in groups:
            if sorted(group[0]) == key:
                group.append(word)
                break
        else:
            groups.append([word])
    return groups
```

### Solution
type: optimal
name: Hash map keyed by letter counts
time: O(n · k)
space: O(n · k)

```javascript
function groupAnagrams(strs) {
  const groups = new Map();
  for (const word of strs) {
    const count = new Array(26).fill(0);
    for (const ch of word) count[ch.charCodeAt(0) - 97]++;
    const key = count.join('#');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}
```

```java
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String word : strs) {
        int[] count = new int[26];
        for (char ch : word.toCharArray()) count[ch - 'a']++;
        String key = Arrays.toString(count);
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
    }
    return new ArrayList<>(groups.values());
}
```

```python
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for word in strs:
        count = [0] * 26
        for ch in word:
            count[ord(ch) - ord('a')] += 1
        groups[tuple(count)].append(word)
    return list(groups.values())
```

### Solution
type: alternate
name: Hash map keyed by sorted word
time: O(n · k log k)
space: O(n · k)

```javascript
function groupAnagrams(strs) {
  const groups = new Map();
  for (const word of strs) {
    const key = [...word].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}
```

```java
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String word : strs) {
        char[] chars = word.toCharArray();
        Arrays.sort(chars);
        groups.computeIfAbsent(new String(chars), k -> new ArrayList<>()).add(word);
    }
    return new ArrayList<>(groups.values());
}
```

```python
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for word in strs:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())
```

### Tests

```json
{
  "fn": "groupAnagrams",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[["eat","tea","tan","ate","nat","bat"]],"expect":[["eat","tea","ate"],["tan","nat"],["bat"]]},
    {"args":[[""]],"expect":[[""]]}
  ]
}
```

## Top K Frequent Elements
difficulty: medium
faq: true
tags: array, hash-map, bucket-sort, heap

### Question
Given an integer array `nums` and an integer `k`, return the `k` most frequent elements, in any order. The answer is guaranteed to be unique.

**Example:** `nums = [1, 1, 1, 2, 2, 3]`, `k = 2` → `[1, 2]`.

### Answer
Count frequencies with a hash map, then use **bucket sort**: bucket `i` holds numbers that appear exactly `i` times. Walk buckets from highest frequency down until you've collected `k` numbers — O(n) overall.

### Explanation
1. Count each number's frequency in a map.
2. A frequency can be at most `n`, so create `n + 1` buckets and drop each number into `buckets[freq]`.
3. Iterate buckets from `n` down to `1`, appending numbers to the result until it has `k` elements.

This beats sorting by frequency (O(n log n)) and a size-k min-heap (O(n log k)) because bucket indices are already ordered.

### Solution
type: brute
name: Count, then sort by frequency
time: O(n log n)
space: O(n)

```javascript
function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) count.set(num, (count.get(num) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([num]) => num);
}
```

```java
public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) count.merge(num, 1, Integer::sum);
    List<Integer> keys = new ArrayList<>(count.keySet());
    keys.sort((a, b) -> count.get(b) - count.get(a));
    int[] result = new int[k];
    for (int i = 0; i < k; i++) result[i] = keys.get(i);
    return result;
}
```

```python
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    return sorted(count, key=count.get, reverse=True)[:k]
```

### Solution
type: optimal
name: Bucket sort by frequency
time: O(n)
space: O(n)

```javascript
function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) count.set(num, (count.get(num) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, freq] of count) buckets[freq].push(num);
  const result = [];
  for (let freq = buckets.length - 1; freq > 0 && result.length < k; freq--) {
    for (const num of buckets[freq]) {
      result.push(num);
      if (result.length === k) break;
    }
  }
  return result;
}
```

```java
public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) count.merge(num, 1, Integer::sum);
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());
    for (Map.Entry<Integer, Integer> e : count.entrySet()) buckets.get(e.getValue()).add(e.getKey());
    int[] result = new int[k];
    int filled = 0;
    for (int freq = nums.length; freq > 0 && filled < k; freq--) {
        for (int num : buckets.get(freq)) {
            result[filled++] = num;
            if (filled == k) break;
        }
    }
    return result;
}
```

```python
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result
    return result
```

### Solution
type: alternate
name: Min-heap of size k
time: O(n log k)
space: O(n)

Keep a min-heap of the `k` most frequent seen so far; the least frequent is evicted whenever the heap grows past `k`. Good when `k` is much smaller than the number of distinct values or data arrives as a stream.

```javascript
function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) count.set(num, (count.get(num) ?? 0) + 1);
  // JavaScript has no built-in heap; a small binary min-heap keyed on frequency.
  const heap = [];
  const swap = (i, j) => ([heap[i], heap[j]] = [heap[j], heap[i]]);
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][1] <= heap[i][1]) break;
      swap(i, p);
      i = p;
    }
  };
  const pop = () => {
    const last = heap.pop();
    if (heap.length === 0) return;
    heap[0] = last;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < heap.length && heap[l][1] < heap[m][1]) m = l;
      if (r < heap.length && heap[r][1] < heap[m][1]) m = r;
      if (m === i) break;
      swap(i, m);
      i = m;
    }
  };
  for (const entry of count) {
    push(entry);
    if (heap.length > k) pop();
  }
  return heap.map(([num]) => num);
}
```

```java
public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) count.merge(num, 1, Integer::sum);
    PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
    for (int num : count.keySet()) {
        heap.offer(num);
        if (heap.size() > k) heap.poll();
    }
    int[] result = new int[k];
    for (int i = 0; i < k; i++) result[i] = heap.poll();
    return result;
}
```

```python
import heapq
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)
```

### Tests

```json
{
  "fn": "topKFrequent",
  "opts": {"norm":"sortFlat"},
  "cases": [
    {"args":[[1,1,1,2,2,3],2],"expect":[1,2]},
    {"args":[[1],1],"expect":[1]},
    {"args":[[4,4,4,5,5,6,6,6,6],2],"expect":[4,6]}
  ]
}
```

## Product of Array Except Self
difficulty: medium
faq: true
tags: array, prefix-sum

### Question
Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of every element of `nums` **except** `nums[i]`. Solve it in O(n) time **without using division**.

**Example:** `nums = [1, 2, 3, 4]` → `[24, 12, 8, 6]`.

### Answer
`answer[i]` = (product of everything to the left of `i`) × (product of everything to the right of `i`). Fill the output with prefix products in one pass, then multiply in suffix products in a second pass from the right.

### Explanation
1. Left pass: `answer[i] = nums[0] * ... * nums[i-1]` (use a running `prefix` starting at 1).
2. Right pass: keep a running `suffix` starting at 1; for `i` from the end, `answer[i] *= suffix`, then `suffix *= nums[i]`.

Because the output array doesn't count as extra space, this is O(1) extra space. It also handles zeros correctly, which the "total product ÷ nums[i]" trick does not.

### Solution
type: brute
name: Multiply everything else for each index
time: O(n²)
space: O(1) extra

```javascript
function productExceptSelf(nums) {
  const answer = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j) answer[i] *= nums[j];
    }
  }
  return answer;
}
```

```java
public int[] productExceptSelf(int[] nums) {
    int[] answer = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        int product = 1;
        for (int j = 0; j < nums.length; j++) {
            if (i != j) product *= nums[j];
        }
        answer[i] = product;
    }
    return answer;
}
```

```python
def product_except_self(nums):
    answer = []
    for i in range(len(nums)):
        product = 1
        for j in range(len(nums)):
            if i != j:
                product *= nums[j]
        answer.append(product)
    return answer
```

### Solution
type: optimal
name: Prefix and suffix products
time: O(n)
space: O(1) extra (output array excluded)

```javascript
function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;
    suffix *= nums[i];
  }
  return answer;
}
```

```java
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] answer = new int[n];
    int prefix = 1;
    for (int i = 0; i < n; i++) {
        answer[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        answer[i] *= suffix;
        suffix *= nums[i];
    }
    return answer;
}
```

```python
def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    prefix = 1
    for i in range(n):
        answer[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= suffix
        suffix *= nums[i]
    return answer
```

### Tests

```json
{
  "fn": "productExceptSelf",
  "cases": [
    {"args":[[1,2,3,4]],"expect":[24,12,8,6]},
    {"args":[[-1,1,0,-3,3]],"expect":[0,0,9,0,0]}
  ]
}
```

## Longest Consecutive Sequence
difficulty: medium
faq: true
tags: array, hash-set

### Question
Given an unsorted array of integers `nums`, return the length of the longest run of consecutive integers (e.g. `4, 5, 6, 7`). The run's elements can appear anywhere in the array. Aim for O(n) time.

**Example:** `nums = [100, 4, 200, 1, 3, 2]` → `4` (the sequence `1, 2, 3, 4`).

### Answer
Put every number in a hash set. Only start counting from numbers that are the **start** of a run (`num - 1` isn't in the set), then walk `num + 1, num + 2, ...` while they exist. Each number is visited at most twice, so it's O(n).

### Explanation
The brute force re-walks the same run from every element in it. The fix is to only walk from a run's first element:

1. Build `set = new Set(nums)`.
2. For each `num` in the set, skip it if `num - 1` is in the set (it's not a start).
3. Otherwise count upward while `num + length` is in the set, and track the maximum length.

Every number is part of exactly one upward walk, so the total work is linear.

### Solution
type: brute
name: Sort and scan
time: O(n log n)
space: O(1) extra (ignoring sort internals)

Sort, then scan while skipping duplicates and resetting the run when there's a gap.

```javascript
function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) continue;
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}
```

```java
public int longestConsecutive(int[] nums) {
    if (nums.length == 0) return 0;
    Arrays.sort(nums);
    int best = 1, run = 1;
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) continue;
        run = nums[i] == nums[i - 1] + 1 ? run + 1 : 1;
        best = Math.max(best, run);
    }
    return best;
}
```

```python
def longest_consecutive(nums):
    if not nums:
        return 0
    nums = sorted(nums)
    best = run = 1
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            continue
        run = run + 1 if nums[i] == nums[i - 1] + 1 else 1
        best = max(best, run)
    return best
```

### Solution
type: optimal
name: Hash set, count from run starts
time: O(n)
space: O(n)

```javascript
function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const num of set) {
    if (set.has(num - 1)) continue;
    let length = 1;
    while (set.has(num + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}
```

```java
public int longestConsecutive(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) set.add(num);
    int best = 0;
    for (int num : set) {
        if (set.contains(num - 1)) continue;
        int length = 1;
        while (set.contains(num + length)) length++;
        best = Math.max(best, length);
    }
    return best;
}
```

```python
def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for num in num_set:
        if num - 1 in num_set:
            continue
        length = 1
        while num + length in num_set:
            length += 1
        best = max(best, length)
    return best
```

### Tests

```json
{
  "fn": "longestConsecutive",
  "cases": [
    {"args":[[100,4,200,1,3,2]],"expect":4},
    {"args":[[0,3,7,2,5,8,4,6,0,1]],"expect":9},
    {"args":[[]],"expect":0},
    {"args":[[1,2,0,1]],"expect":3}
  ]
}
```

## Maximum Subarray
difficulty: medium
faq: true
tags: array, kadane, dynamic-programming

### Question
Given an integer array `nums`, find the contiguous subarray (containing at least one number) with the largest sum and return that sum.

**Example:** `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6` (subarray `[4, -1, 2, 1]`).

### Answer
**Kadane's algorithm:** at each index, the best subarray ending here is either the current number alone or the current number added to the best subarray ending at the previous index — `cur = max(num, cur + num)`. Track the maximum `cur` ever seen.

### Explanation
If the running sum ending at the previous element is negative, carrying it forward can only hurt, so start fresh at the current element. Otherwise extend it.

1. `cur = best = nums[0]`.
2. For each subsequent `num`: `cur = max(num, cur + num)`, `best = max(best, cur)`.

Starting from `nums[0]` (not 0) makes all-negative arrays return the largest single element instead of 0.

### Solution
type: brute
name: Try every subarray
time: O(n²)
space: O(1)

```javascript
function maxSubArray(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}
```

```java
public int maxSubArray(int[] nums) {
    int best = Integer.MIN_VALUE;
    for (int i = 0; i < nums.length; i++) {
        int sum = 0;
        for (int j = i; j < nums.length; j++) {
            sum += nums[j];
            best = Math.max(best, sum);
        }
    }
    return best;
}
```

```python
def max_sub_array(nums):
    best = float("-inf")
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            best = max(best, total)
    return best
```

### Solution
type: optimal
name: Kadane's algorithm
time: O(n)
space: O(1)

```javascript
function maxSubArray(nums) {
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}
```

```java
public int maxSubArray(int[] nums) {
    int cur = nums[0], best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
    }
    return best;
}
```

```python
def max_sub_array(nums):
    cur = best = nums[0]
    for num in nums[1:]:
        cur = max(num, cur + num)
        best = max(best, cur)
    return best
```

### Solution
type: alternate
name: Divide and conquer
time: O(n log n)
space: O(log n) recursion

The best subarray lies entirely in the left half, entirely in the right half, or crosses the middle. The crossing case is the best suffix of the left half plus the best prefix of the right half. A common follow-up question.

```javascript
function maxSubArray(nums) {
  const solve = (lo, hi) => {
    if (lo === hi) return nums[lo];
    const mid = (lo + hi) >> 1;
    let leftBest = -Infinity;
    for (let i = mid, sum = 0; i >= lo; i--) {
      sum += nums[i];
      leftBest = Math.max(leftBest, sum);
    }
    let rightBest = -Infinity;
    for (let i = mid + 1, sum = 0; i <= hi; i++) {
      sum += nums[i];
      rightBest = Math.max(rightBest, sum);
    }
    return Math.max(solve(lo, mid), solve(mid + 1, hi), leftBest + rightBest);
  };
  return solve(0, nums.length - 1);
}
```

```java
public int maxSubArray(int[] nums) {
    return solve(nums, 0, nums.length - 1);
}

private int solve(int[] nums, int lo, int hi) {
    if (lo == hi) return nums[lo];
    int mid = (lo + hi) / 2;
    int leftBest = Integer.MIN_VALUE, sum = 0;
    for (int i = mid; i >= lo; i--) {
        sum += nums[i];
        leftBest = Math.max(leftBest, sum);
    }
    int rightBest = Integer.MIN_VALUE;
    sum = 0;
    for (int i = mid + 1; i <= hi; i++) {
        sum += nums[i];
        rightBest = Math.max(rightBest, sum);
    }
    return Math.max(Math.max(solve(nums, lo, mid), solve(nums, mid + 1, hi)), leftBest + rightBest);
}
```

```python
def max_sub_array(nums):
    def solve(lo, hi):
        if lo == hi:
            return nums[lo]
        mid = (lo + hi) // 2
        left_best, total = float("-inf"), 0
        for i in range(mid, lo - 1, -1):
            total += nums[i]
            left_best = max(left_best, total)
        right_best, total = float("-inf"), 0
        for i in range(mid + 1, hi + 1):
            total += nums[i]
            right_best = max(right_best, total)
        return max(solve(lo, mid), solve(mid + 1, hi), left_best + right_best)

    return solve(0, len(nums) - 1)
```

### Tests

```json
{
  "fn": "maxSubArray",
  "cases": [
    {"args":[[-2,1,-3,4,-1,2,1,-5,4]],"expect":6},
    {"args":[[1]],"expect":1},
    {"args":[[-3,-1,-2]],"expect":-1},
    {"args":[[5,4,-1,7,8]],"expect":23}
  ]
}
```

## Majority Element
difficulty: easy
faq: false
tags: array, hash-map, boyer-moore

### Question
Given an array `nums` of size `n`, return the majority element — the element that appears **more than ⌊n / 2⌋ times**. You may assume it always exists.

**Example:** `nums = [2, 2, 1, 1, 1, 2, 2]` → `2`.

### Answer
**Boyer–Moore voting:** keep a candidate and a counter. Matching elements increment the counter, others decrement it; when it hits zero, adopt the current element as the new candidate. The majority element always survives because it outnumbers everything else combined.

### Explanation
Think of each non-majority element "cancelling out" one majority element. Since the majority appears more than half the time, at least one copy remains uncancelled at the end.

1. `candidate = null`, `count = 0`.
2. For each `num`: if `count == 0`, set `candidate = num`. Then `count += (num == candidate) ? 1 : -1`.
3. Return `candidate`.

O(n) time, O(1) space — better than a frequency map's O(n) space.

### Solution
type: brute
name: Frequency map
time: O(n)
space: O(n)

```javascript
function majorityElement(nums) {
  const count = new Map();
  for (const num of nums) {
    const c = (count.get(num) ?? 0) + 1;
    if (c > nums.length / 2) return num;
    count.set(num, c);
  }
  return -1;
}
```

```java
public int majorityElement(int[] nums) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) {
        int c = count.merge(num, 1, Integer::sum);
        if (c > nums.length / 2) return num;
    }
    return -1;
}
```

```python
def majority_element(nums):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
        if count[num] > len(nums) // 2:
            return num
    return -1
```

### Solution
type: optimal
name: Boyer–Moore voting
time: O(n)
space: O(1)

```javascript
function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const num of nums) {
    if (count === 0) candidate = num;
    count += num === candidate ? 1 : -1;
  }
  return candidate;
}
```

```java
public int majorityElement(int[] nums) {
    int candidate = 0, count = 0;
    for (int num : nums) {
        if (count == 0) candidate = num;
        count += num == candidate ? 1 : -1;
    }
    return candidate;
}
```

```python
def majority_element(nums):
    candidate, count = None, 0
    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1
    return candidate
```

### Solution
type: alternate
name: Sort and take the middle
time: O(n log n)
space: O(1) extra (ignoring sort internals)

After sorting, the majority element must occupy index `n / 2`, since it spans more than half the array.

```javascript
function majorityElement(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
```

```java
public int majorityElement(int[] nums) {
    Arrays.sort(nums);
    return nums[nums.length / 2];
}
```

```python
def majority_element(nums):
    return sorted(nums)[len(nums) // 2]
```

### Tests

```json
{
  "fn": "majorityElement",
  "cases": [
    {"args":[[3,2,3]],"expect":3},
    {"args":[[2,2,1,1,1,2,2]],"expect":2}
  ]
}
```

## Move Zeroes
difficulty: easy
faq: false
tags: array, two-pointers, in-place

### Question
Given an integer array `nums`, move all `0`s to the end while keeping the relative order of the non-zero elements. Do it **in place**.

**Example:** `nums = [0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`.

### Answer
Keep a write pointer for the next non-zero slot. Scan the array; whenever you see a non-zero, swap it into the write position and advance the pointer. Zeros naturally end up at the back.

### Explanation
`write` always points to the first position that should hold the next non-zero value. Everything before `write` is the final non-zero prefix in original order.

1. `write = 0`.
2. For each `read` index: if `nums[read] != 0`, swap `nums[read]` and `nums[write]`, then `write++`.

Swapping (instead of copying then zero-filling) does it in one pass with a minimal number of writes.

### Solution
type: brute
name: Copy non-zeros to a new array
time: O(n)
space: O(n)

Collect non-zeros into a temporary array, then write them back and zero-fill the rest. Correct, but uses extra space.

```javascript
function moveZeroes(nums) {
  const nonZero = nums.filter((x) => x !== 0);
  for (let i = 0; i < nums.length; i++) {
    nums[i] = i < nonZero.length ? nonZero[i] : 0;
  }
  return nums;
}
```

```java
public void moveZeroes(int[] nums) {
    List<Integer> nonZero = new ArrayList<>();
    for (int num : nums) {
        if (num != 0) nonZero.add(num);
    }
    for (int i = 0; i < nums.length; i++) {
        nums[i] = i < nonZero.size() ? nonZero.get(i) : 0;
    }
}
```

```python
def move_zeroes(nums):
    non_zero = [x for x in nums if x != 0]
    for i in range(len(nums)):
        nums[i] = non_zero[i] if i < len(non_zero) else 0
    return nums
```

### Solution
type: optimal
name: Two pointers with swaps
time: O(n)
space: O(1)

```javascript
function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}
```

```java
public void moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            int tmp = nums[write];
            nums[write] = nums[read];
            nums[read] = tmp;
            write++;
        }
    }
}
```

```python
def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums
```

### Tests

```json
{
  "fn": "moveZeroes",
  "opts": {"mutates":"self"},
  "cases": [
    {"args":[[0,1,0,3,12]],"expect":[1,3,12,0,0]},
    {"args":[[0]],"expect":[0]}
  ]
}
```

## Subarray Sum Equals K
difficulty: medium
faq: true
tags: array, prefix-sum, hash-map

### Question
Given an integer array `nums` (which may contain negatives) and an integer `k`, return the total number of contiguous subarrays whose sum equals `k`.

**Example:** `nums = [1, 1, 1]`, `k = 2` → `2`; `nums = [1, 2, 3]`, `k = 3` → `2`.

### Answer
A subarray `(i, j]` sums to `k` exactly when `prefix[j] - prefix[i] = k`. Walk the array keeping a running prefix sum and a hash map counting how many times each prefix sum has occurred; at each step add `count[prefix - k]` to the answer.

### Explanation
1. Initialise `count = {0: 1}` — the empty prefix, so subarrays starting at index 0 are counted.
2. For each number, update `prefix += num`.
3. Every earlier prefix equal to `prefix - k` marks the start of a subarray ending here with sum `k`; add `count[prefix - k]`.
4. Record the current prefix: `count[prefix]++`.

A sliding window doesn't work here because negative numbers break the "shrink when too big" rule.

### Solution
type: brute
name: Sum every subarray
time: O(n²)
space: O(1)

```javascript
function subarraySum(nums, k) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) total++;
    }
  }
  return total;
}
```

```java
public int subarraySum(int[] nums, int k) {
    int total = 0;
    for (int i = 0; i < nums.length; i++) {
        int sum = 0;
        for (int j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum == k) total++;
        }
    }
    return total;
}
```

```python
def subarray_sum(nums, k):
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total
```

### Solution
type: optimal
name: Prefix sums + hash map
time: O(n)
space: O(n)

```javascript
function subarraySum(nums, k) {
  const count = new Map([[0, 1]]);
  let prefix = 0;
  let total = 0;
  for (const num of nums) {
    prefix += num;
    total += count.get(prefix - k) ?? 0;
    count.set(prefix, (count.get(prefix) ?? 0) + 1);
  }
  return total;
}
```

```java
public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    count.put(0, 1);
    int prefix = 0, total = 0;
    for (int num : nums) {
        prefix += num;
        total += count.getOrDefault(prefix - k, 0);
        count.merge(prefix, 1, Integer::sum);
    }
    return total;
}
```

```python
def subarray_sum(nums, k):
    count = {0: 1}
    prefix = total = 0
    for num in nums:
        prefix += num
        total += count.get(prefix - k, 0)
        count[prefix] = count.get(prefix, 0) + 1
    return total
```

### Tests

```json
{
  "fn": "subarraySum",
  "cases": [
    {"args":[[1,1,1],2],"expect":2},
    {"args":[[1,2,3],3],"expect":2},
    {"args":[[1,-1,0],0],"expect":3}
  ]
}
```

## Rotate Array
difficulty: medium
faq: false
tags: array, in-place, reversal

### Question
Given an integer array `nums`, rotate it to the right by `k` steps, in place. `k` may be larger than the array length.

**Example:** `nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3` → `[5, 6, 7, 1, 2, 3, 4]`.

### Answer
Use the **reversal trick**: reverse the whole array, then reverse the first `k` elements, then reverse the rest (with `k = k % n`). Three reversals put every element in its rotated spot using O(1) extra space.

### Explanation
Rotating right by `k` moves the last `k` elements to the front.

1. `k %= n` (rotating by `n` is a no-op).
2. Reverse the whole array: the last `k` elements are now at the front, but backwards.
3. Reverse `[0, k)` to fix their order, and reverse `[k, n)` to fix the rest.

Example: `1234567`, `k = 3` → reverse all `7654321` → reverse first 3 `5674321` → reverse rest `5671234`.

### Solution
type: brute
name: Copy into a new array
time: O(n)
space: O(n)

Element `i` lands at `(i + k) % n`. Simple, but needs a full copy.

```javascript
function rotate(nums, k) {
  const n = nums.length;
  const copy = [...nums];
  for (let i = 0; i < n; i++) nums[(i + k) % n] = copy[i];
  return nums;
}
```

```java
public void rotate(int[] nums, int k) {
    int n = nums.length;
    int[] copy = nums.clone();
    for (int i = 0; i < n; i++) nums[(i + k) % n] = copy[i];
}
```

```python
def rotate(nums, k):
    n = len(nums)
    copy = nums[:]
    for i in range(n):
        nums[(i + k) % n] = copy[i]
    return nums
```

### Solution
type: optimal
name: Three reversals
time: O(n)
space: O(1)

```javascript
function rotate(nums, k) {
  const n = nums.length;
  k %= n;
  const reverse = (lo, hi) => {
    while (lo < hi) {
      [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
      lo++;
      hi--;
    }
  };
  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
  return nums;
}
```

```java
public void rotate(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    reverse(nums, 0, n - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, n - 1);
}

private void reverse(int[] nums, int lo, int hi) {
    while (lo < hi) {
        int tmp = nums[lo];
        nums[lo++] = nums[hi];
        nums[hi--] = tmp;
    }
}
```

```python
def rotate(nums, k):
    n = len(nums)
    k %= n

    def reverse(lo, hi):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo += 1
            hi -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums
```

### Tests

```json
{
  "fn": "rotate",
  "opts": {"mutates":"self"},
  "cases": [
    {"args":[[1,2,3,4,5,6,7],3],"expect":[5,6,7,1,2,3,4]},
    {"args":[[-1,-100,3,99],2],"expect":[3,99,-1,-100]},
    {"args":[[1,2],5],"expect":[2,1]}
  ]
}
```
