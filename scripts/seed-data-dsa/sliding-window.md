## Best Time to Buy and Sell Stock
difficulty: easy
faq: true
tags: array, sliding-window, greedy

### Question
You are given an array `prices` where `prices[i]` is a stock's price on day `i`. Choose one day to buy and a **later** day to sell to maximise profit. Return the maximum profit, or `0` if no profit is possible.

**Example:** `prices = [7, 1, 5, 3, 6, 4]` → `5` (buy at 1, sell at 6).

### Answer
Scan once while tracking the lowest price seen so far. On each day, the best sale ending today is `price - minSoFar`; keep the maximum of those.

### Explanation
The best buy day for a sale on day `i` is simply the cheapest day before `i`. So:

1. `minPrice = Infinity`, `best = 0`.
2. For each `price`: `minPrice = min(minPrice, price)`, then `best = max(best, price - minPrice)`.

This is a sliding window whose left edge jumps to any new minimum. One pass, O(1) space.

### Solution
type: brute
name: Every buy/sell pair
time: O(n²)
space: O(1)

```javascript
function maxProfit(prices) {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) {
      best = Math.max(best, prices[sell] - prices[buy]);
    }
  }
  return best;
}
```

```java
public int maxProfit(int[] prices) {
    int best = 0;
    for (int buy = 0; buy < prices.length; buy++) {
        for (int sell = buy + 1; sell < prices.length; sell++) {
            best = Math.max(best, prices[sell] - prices[buy]);
        }
    }
    return best;
}
```

```python
def max_profit(prices):
    best = 0
    for buy in range(len(prices)):
        for sell in range(buy + 1, len(prices)):
            best = max(best, prices[sell] - prices[buy])
    return best
```

### Solution
type: optimal
name: Track the minimum so far
time: O(n)
space: O(1)

```javascript
function maxProfit(prices) {
  let minPrice = Infinity;
  let best = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    best = Math.max(best, price - minPrice);
  }
  return best;
}
```

```java
public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, best = 0;
    for (int price : prices) {
        minPrice = Math.min(minPrice, price);
        best = Math.max(best, price - minPrice);
    }
    return best;
}
```

```python
def max_profit(prices):
    min_price = float("inf")
    best = 0
    for price in prices:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best
```

### Tests

```json
{
  "fn": "maxProfit",
  "cases": [
    {"args":[[7,1,5,3,6,4]],"expect":5},
    {"args":[[7,6,4,3,1]],"expect":0}
  ]
}
```

## Longest Substring Without Repeating Characters
difficulty: medium
faq: true
tags: string, sliding-window, hash-map

### Question
Given a string `s`, find the length of the longest substring that contains no repeated characters.

**Example:** `s = "abcabcbb"` → `3` (`"abc"`); `s = "bbbbb"` → `1`; `s = "pwwkew"` → `3` (`"wke"`).

### Answer
Slide a window `[left, right]` over the string, remembering the last index of each character. When `s[right]` was already seen inside the window, jump `left` to just past that previous occurrence. The answer is the largest window width.

### Explanation
1. `lastSeen` maps character → most recent index; `left = 0`.
2. For each `right`:
   - If `s[right]` is in `lastSeen` with index `>= left`, it's a repeat inside the window — set `left = lastSeen[s[right]] + 1`.
   - Update `lastSeen[s[right]] = right` and `best = max(best, right - left + 1)`.

The `>= left` check matters: an occurrence before `left` is outside the window and must not move `left` backwards. Each index is processed once — O(n).

### Solution
type: brute
name: Check every substring
time: O(n³) (O(n²) substrings × O(n) uniqueness check)
space: O(min(n, charset))

```javascript
function lengthOfLongestSubstring(s) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}
```

```java
public int lengthOfLongestSubstring(String s) {
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        for (int j = i; j < s.length(); j++) {
            Set<Character> seen = new HashSet<>();
            boolean unique = true;
            for (int k = i; k <= j && unique; k++) unique = seen.add(s.charAt(k));
            if (unique) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}
```

```python
def length_of_longest_substring(s):
    best = 0
    for i in range(len(s)):
        for j in range(i, len(s)):
            if len(set(s[i : j + 1])) == j - i + 1:
                best = max(best, j - i + 1)
    return best
```

### Solution
type: optimal
name: Sliding window with last-seen index
time: O(n)
space: O(min(n, charset))

```javascript
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) left = lastSeen.get(ch) + 1;
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        Integer prev = lastSeen.get(ch);
        if (prev != null && prev >= left) left = prev + 1;
        lastSeen.put(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}
```

```python
def length_of_longest_substring(s):
    last_seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if last_seen.get(ch, -1) >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best
```

### Solution
type: alternate
name: Sliding window with a set
time: O(n) (each index enters and leaves once)
space: O(min(n, charset))

Shrink from the left one character at a time until the duplicate is gone. Slightly more steps than jumping, but the same linear bound and very easy to explain.

```javascript
function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) window.delete(s[left++]);
    window.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

```java
public int lengthOfLongestSubstring(String s) {
    Set<Character> window = new HashSet<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        while (window.contains(s.charAt(right))) window.remove(s.charAt(left++));
        window.add(s.charAt(right));
        best = Math.max(best, right - left + 1);
    }
    return best;
}
```

```python
def length_of_longest_substring(s):
    window = set()
    left = best = 0
    for right, ch in enumerate(s):
        while ch in window:
            window.remove(s[left])
            left += 1
        window.add(ch)
        best = max(best, right - left + 1)
    return best
```

### Tests

```json
{
  "fn": "lengthOfLongestSubstring",
  "cases": [
    {"args":["abcabcbb"],"expect":3},
    {"args":["bbbbb"],"expect":1},
    {"args":["pwwkew"],"expect":3},
    {"args":[""],"expect":0},
    {"args":["abba"],"expect":2},
    {"args":["tmmzuxt"],"expect":5}
  ]
}
```

## Longest Repeating Character Replacement
difficulty: medium
faq: false
tags: string, sliding-window, counting

### Question
Given a string `s` of uppercase English letters and an integer `k`, you may change at most `k` characters to any other uppercase letter. Return the length of the longest substring containing a single repeated letter you can get.

**Example:** `s = "AABABBA"`, `k = 1` → `4` (replace the `A` at index 3 to get `"AABBBBA"`, which contains `"BBBB"`).

### Answer
A window is valid if `windowLength - countOfMostFrequentLetter <= k` (the other letters are the ones you'd replace). Grow the window to the right; when it becomes invalid, slide the left edge forward by one.

### Explanation
1. Keep letter counts for the window and `maxFreq`, the highest count seen.
2. For each `right`: increment `count[s[right]]`, update `maxFreq`.
3. If `(right - left + 1) - maxFreq > k`, decrement `count[s[left]]` and `left++`.
4. The answer is the final window size (or the max window size tracked along the way).

**Why `maxFreq` never needs decreasing:** the window only needs to *grow* when a larger `maxFreq` appears; a stale, too-high `maxFreq` just keeps the window size unchanged rather than producing a wrong larger answer.

### Solution
type: brute
name: Every substring
time: O(n² · 26)
space: O(26)

```javascript
function characterReplacement(s, k) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const count = new Array(26).fill(0);
    let maxFreq = 0;
    for (let j = i; j < s.length; j++) {
      maxFreq = Math.max(maxFreq, ++count[s.charCodeAt(j) - 65]);
      if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}
```

```java
public int characterReplacement(String s, int k) {
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        int[] count = new int[26];
        int maxFreq = 0;
        for (int j = i; j < s.length(); j++) {
            maxFreq = Math.max(maxFreq, ++count[s.charAt(j) - 'A']);
            if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}
```

```python
def character_replacement(s, k):
    best = 0
    for i in range(len(s)):
        count = [0] * 26
        max_freq = 0
        for j in range(i, len(s)):
            idx = ord(s[j]) - ord("A")
            count[idx] += 1
            max_freq = max(max_freq, count[idx])
            if j - i + 1 - max_freq <= k:
                best = max(best, j - i + 1)
    return best
```

### Solution
type: optimal
name: Sliding window with max frequency
time: O(n)
space: O(26)

```javascript
function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let left = 0;
  let maxFreq = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    maxFreq = Math.max(maxFreq, ++count[s.charCodeAt(right) - 65]);
    if (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left) - 65]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

```java
public int characterReplacement(String s, int k) {
    int[] count = new int[26];
    int left = 0, maxFreq = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);
        if (right - left + 1 - maxFreq > k) {
            count[s.charAt(left) - 'A']--;
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}
```

```python
def character_replacement(s, k):
    count = [0] * 26
    left = max_freq = best = 0
    for right, ch in enumerate(s):
        idx = ord(ch) - ord("A")
        count[idx] += 1
        max_freq = max(max_freq, count[idx])
        if right - left + 1 - max_freq > k:
            count[ord(s[left]) - ord("A")] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
```

### Tests

```json
{
  "fn": "characterReplacement",
  "cases": [
    {"args":["ABAB",2],"expect":4},
    {"args":["AABABBA",1],"expect":4},
    {"args":["AAAA",0],"expect":4},
    {"args":["ABCDE",1],"expect":2}
  ]
}
```

## Minimum Window Substring
difficulty: hard
faq: true
tags: string, sliding-window, hash-map

### Question
Given strings `s` and `t`, return the smallest substring of `s` that contains every character of `t` (including duplicates). If no such substring exists, return `""`.

**Example:** `s = "ADOBECODEBANC"`, `t = "ABC"` → `"BANC"`.

### Answer
Expand a window to the right until it contains all of `t`'s characters, then shrink it from the left as far as possible while it stays valid, recording the smallest valid window. Track "how many required characters are fully satisfied" so validity checks are O(1).

### Explanation
1. `need` = character counts of `t`; `required = number of distinct characters in t`; `formed = 0`.
2. Move `right`: add `s[right]` to the window counts. If its count now equals `need[ch]`, `formed++`.
3. While `formed == required`: record the window if it's the smallest so far, then remove `s[left]` — if its count drops below `need`, `formed--` — and `left++`.
4. Return the best window.

Each character enters and leaves the window at most once, so it's O(|s| + |t|).

### Solution
type: brute
name: Check every substring
time: O(n² · (n + m))
space: O(m)

```javascript
function minWindow(s, t) {
  const covers = (sub) => {
    const count = new Map();
    for (const ch of sub) count.set(ch, (count.get(ch) ?? 0) + 1);
    for (const ch of t) {
      if (!count.get(ch)) return false;
      count.set(ch, count.get(ch) - 1);
    }
    return true;
  };
  let best = '';
  for (let i = 0; i < s.length; i++) {
    for (let j = i + t.length; j <= s.length; j++) {
      if ((best === '' || j - i < best.length) && covers(s.slice(i, j))) {
        best = s.slice(i, j);
        break;
      }
    }
  }
  return best;
}
```

```java
public String minWindow(String s, String t) {
    String best = "";
    for (int i = 0; i < s.length(); i++) {
        for (int j = i + t.length(); j <= s.length(); j++) {
            if ((best.isEmpty() || j - i < best.length()) && covers(s.substring(i, j), t)) {
                best = s.substring(i, j);
                break;
            }
        }
    }
    return best;
}

private boolean covers(String sub, String t) {
    Map<Character, Integer> count = new HashMap<>();
    for (char ch : sub.toCharArray()) count.merge(ch, 1, Integer::sum);
    for (char ch : t.toCharArray()) {
        int c = count.getOrDefault(ch, 0);
        if (c == 0) return false;
        count.put(ch, c - 1);
    }
    return true;
}
```

```python
from collections import Counter

def min_window(s, t):
    need = Counter(t)
    best = ""
    for i in range(len(s)):
        for j in range(i + len(t), len(s) + 1):
            if (not best or j - i < len(best)) and not need - Counter(s[i:j]):
                best = s[i:j]
                break
    return best
```

### Solution
type: optimal
name: Expand / shrink sliding window
time: O(n + m)
space: O(m)

```javascript
function minWindow(s, t) {
  if (t.length === 0) return '';
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  const window = new Map();
  let formed = 0;
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) ?? 0) + 1);
    if (need.has(ch) && window.get(ch) === need.get(ch)) formed++;
    while (formed === need.size) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const out = s[left++];
      window.set(out, window.get(out) - 1);
      if (need.has(out) && window.get(out) < need.get(out)) formed--;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}
```

```java
public String minWindow(String s, String t) {
    if (t.isEmpty()) return "";
    Map<Character, Integer> need = new HashMap<>();
    for (char ch : t.toCharArray()) need.merge(ch, 1, Integer::sum);
    Map<Character, Integer> window = new HashMap<>();
    int formed = 0, left = 0, bestStart = 0, bestLen = Integer.MAX_VALUE;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        int count = window.merge(ch, 1, Integer::sum);
        if (need.containsKey(ch) && count == need.get(ch)) formed++;
        while (formed == need.size()) {
            if (right - left + 1 < bestLen) {
                bestLen = right - left + 1;
                bestStart = left;
            }
            char out = s.charAt(left++);
            int outCount = window.merge(out, -1, Integer::sum);
            if (need.containsKey(out) && outCount < need.get(out)) formed--;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
}
```

```python
from collections import Counter, defaultdict

def min_window(s, t):
    if not t:
        return ""
    need = Counter(t)
    window = defaultdict(int)
    formed = left = best_start = 0
    best_len = float("inf")
    for right, ch in enumerate(s):
        window[ch] += 1
        if ch in need and window[ch] == need[ch]:
            formed += 1
        while formed == len(need):
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_start = left
            out = s[left]
            window[out] -= 1
            if out in need and window[out] < need[out]:
                formed -= 1
            left += 1
    return "" if best_len == float("inf") else s[best_start : best_start + best_len]
```

### Tests

```json
{
  "fn": "minWindow",
  "cases": [
    {"args":["ADOBECODEBANC","ABC"],"expect":"BANC"},
    {"args":["a","a"],"expect":"a"},
    {"args":["a","aa"],"expect":""},
    {"args":["aaflslflsldkalskaaa","aaa"],"expect":"aaa"}
  ]
}
```

## Permutation in String
difficulty: medium
faq: false
tags: string, sliding-window, counting

### Question
Given strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1` as a contiguous substring.

**Example:** `s1 = "ab"`, `s2 = "eidbaooo"` → `true` (`"ba"`); `s1 = "ab"`, `s2 = "eidboaoo"` → `false`.

### Answer
Slide a fixed-size window of length `|s1|` across `s2`, keeping letter counts for the window. If the window's counts ever equal `s1`'s counts, a permutation is present.

### Explanation
A permutation of `s1` is any string with the same letter counts and the same length. So:

1. Count letters of `s1` and of the first `|s1|` letters of `s2`.
2. If the counts match, return `true`.
3. Slide: add the next letter on the right, remove the letter leaving on the left, compare again.

Comparing two 26-slot arrays is O(26) per step, so overall O(26 · n). (Tracking a "matches" counter makes each step O(1), but the idea is the same.)

### Solution
type: brute
name: Sort every window
time: O(n · m log m)
space: O(m)

```javascript
function checkInclusion(s1, s2) {
  const target = [...s1].sort().join('');
  for (let i = 0; i + s1.length <= s2.length; i++) {
    if ([...s2.slice(i, i + s1.length)].sort().join('') === target) return true;
  }
  return false;
}
```

```java
public boolean checkInclusion(String s1, String s2) {
    char[] target = s1.toCharArray();
    Arrays.sort(target);
    for (int i = 0; i + s1.length() <= s2.length(); i++) {
        char[] window = s2.substring(i, i + s1.length()).toCharArray();
        Arrays.sort(window);
        if (Arrays.equals(window, target)) return true;
    }
    return false;
}
```

```python
def check_inclusion(s1, s2):
    target = sorted(s1)
    m = len(s1)
    for i in range(len(s2) - m + 1):
        if sorted(s2[i : i + m]) == target:
            return True
    return False
```

### Solution
type: optimal
name: Fixed-size window with letter counts
time: O(26 · n)
space: O(26)

```javascript
function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = new Array(26).fill(0);
  const window = new Array(26).fill(0);
  const code = (ch) => ch.charCodeAt(0) - 97;
  for (let i = 0; i < s1.length; i++) {
    need[code(s1[i])]++;
    window[code(s2[i])]++;
  }
  const same = () => need.every((c, i) => c === window[i]);
  if (same()) return true;
  for (let right = s1.length; right < s2.length; right++) {
    window[code(s2[right])]++;
    window[code(s2[right - s1.length])]--;
    if (same()) return true;
  }
  return false;
}
```

```java
public boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;
    int[] need = new int[26], window = new int[26];
    for (int i = 0; i < s1.length(); i++) {
        need[s1.charAt(i) - 'a']++;
        window[s2.charAt(i) - 'a']++;
    }
    if (Arrays.equals(need, window)) return true;
    for (int right = s1.length(); right < s2.length(); right++) {
        window[s2.charAt(right) - 'a']++;
        window[s2.charAt(right - s1.length()) - 'a']--;
        if (Arrays.equals(need, window)) return true;
    }
    return false;
}
```

```python
def check_inclusion(s1, s2):
    m = len(s1)
    if m > len(s2):
        return False
    need = [0] * 26
    window = [0] * 26
    for i in range(m):
        need[ord(s1[i]) - ord("a")] += 1
        window[ord(s2[i]) - ord("a")] += 1
    if need == window:
        return True
    for right in range(m, len(s2)):
        window[ord(s2[right]) - ord("a")] += 1
        window[ord(s2[right - m]) - ord("a")] -= 1
        if need == window:
            return True
    return False
```

### Tests

```json
{
  "fn": "checkInclusion",
  "cases": [
    {"args":["ab","eidbaooo"],"expect":true},
    {"args":["ab","eidboaoo"],"expect":false},
    {"args":["abc","ab"],"expect":false},
    {"args":["adc","dcda"],"expect":true}
  ]
}
```

## Sliding Window Maximum
difficulty: hard
faq: true
tags: array, sliding-window, deque, monotonic-queue

### Question
Given an integer array `nums` and a window size `k`, a window slides from the left of the array to the right, one position at a time. Return an array of the maximum value in each window.

**Example:** `nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3` → `[3, 3, 5, 5, 6, 7]`.

### Answer
Keep a **monotonic deque** of indices whose values are in decreasing order. The front is always the current window's maximum. Before pushing a new index, pop smaller values off the back (they can never be a maximum again); pop the front when it falls out of the window.

### Explanation
For each index `i`:

1. If the front index is `<= i - k`, it has left the window — pop it from the front.
2. While the back's value is `<= nums[i]`, pop it from the back: `nums[i]` is newer and at least as large, so the popped element can never be a window max.
3. Push `i` to the back.
4. Once `i >= k - 1`, append `nums[deque.front]` to the result.

Every index is pushed and popped at most once, so it's O(n).

### Solution
type: brute
name: Scan every window
time: O(n · k)
space: O(1) extra

```javascript
function maxSlidingWindow(nums, k) {
  const result = [];
  for (let i = 0; i + k <= nums.length; i++) {
    let max = -Infinity;
    for (let j = i; j < i + k; j++) max = Math.max(max, nums[j]);
    result.push(max);
  }
  return result;
}
```

```java
public int[] maxSlidingWindow(int[] nums, int k) {
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i + k <= nums.length; i++) {
        int max = Integer.MIN_VALUE;
        for (int j = i; j < i + k; j++) max = Math.max(max, nums[j]);
        result[i] = max;
    }
    return result;
}
```

```python
def max_sliding_window(nums, k):
    return [max(nums[i : i + k]) for i in range(len(nums) - k + 1)]
```

### Solution
type: optimal
name: Monotonic deque
time: O(n)
space: O(k)

```javascript
function maxSlidingWindow(nums, k) {
  const deque = []; // indices; values decreasing from front to back
  let head = 0; // front of the deque (avoids O(n) Array.shift)
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (head < deque.length && deque[head] <= i - k) head++;
    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[head]]);
  }
  return result;
}
```

```java
public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> deque = new ArrayDeque<>();
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        if (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.pollFirst();
        while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) deque.pollLast();
        deque.offerLast(i);
        if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];
    }
    return result;
}
```

```python
from collections import deque

def max_sliding_window(nums, k):
    window = deque()
    result = []
    for i, num in enumerate(nums):
        if window and window[0] <= i - k:
            window.popleft()
        while window and nums[window[-1]] <= num:
            window.pop()
        window.append(i)
        if i >= k - 1:
            result.append(nums[window[0]])
    return result
```

### Tests

```json
{
  "fn": "maxSlidingWindow",
  "cases": [
    {"args":[[1,3,-1,-3,5,3,6,7],3],"expect":[3,3,5,5,6,7]},
    {"args":[[1],1],"expect":[1]},
    {"args":[[9,8,7,6,5],2],"expect":[9,8,7,6]},
    {"args":[[1,-1],1],"expect":[1,-1]}
  ]
}
```
