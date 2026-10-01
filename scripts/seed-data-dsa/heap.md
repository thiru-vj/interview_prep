## Kth Largest Element in an Array
difficulty: medium
faq: true
tags: array, heap, quickselect, sorting

### Question
Given an integer array `nums` and an integer `k`, return the `k`-th largest element in sorted order (not the `k`-th distinct element). Can you do better than sorting?

**Example:** `nums = [3, 2, 1, 5, 6, 4]`, `k = 2` → `5`; `nums = [3, 2, 3, 1, 2, 4, 5, 5, 6]`, `k = 4` → `4`.

### Answer
Keep a **min-heap of size `k`**. Push every number; whenever the heap grows past `k`, pop the smallest. At the end the heap holds the `k` largest numbers, and its top is the `k`-th largest.

### Explanation
The heap's minimum is always the smallest of the `k` largest values seen so far — exactly the `k`-th largest. Each push/pop costs O(log k), so the total is O(n log k), which beats sorting when `k` is small.

**Quickselect** (the partition step of quicksort, recursing into only one side) finds it in O(n) on average but O(n²) in the worst case; a random pivot makes the worst case very unlikely. In JavaScript you need a hand-written heap (included below) — Java has `PriorityQueue` and Python has `heapq`.

### Solution
type: brute
name: Sort descending
time: O(n log n)
space: O(1)–O(n) depending on the sort

```javascript
function findKthLargest(nums, k) {
  return [...nums].sort((a, b) => b - a)[k - 1];
}
```

```java
public int findKthLargest(int[] nums, int k) {
    Arrays.sort(nums);
    return nums[nums.length - k];
}
```

```python
def find_kth_largest(nums, k):
    return sorted(nums, reverse=True)[k - 1]
```

### Solution
type: optimal
name: Min-heap of size k
time: O(n log k)
space: O(k)

```javascript
// JavaScript has no built-in priority queue — a minimal binary heap.
class Heap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a, b) < 0 → a is popped before b
  }
  get size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(value) {
    const data = this.data;
    data.push(value);
    let i = data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(data[i], data[parent]) >= 0) break;
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }
  pop() {
    const data = this.data;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let next = i;
        if (l < data.length && this.compare(data[l], data[next]) < 0) next = l;
        if (r < data.length && this.compare(data[r], data[next]) < 0) next = r;
        if (next === i) break;
        [data[i], data[next]] = [data[next], data[i]];
        i = next;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {
  const heap = new Heap((a, b) => a - b);
  for (const num of nums) {
    heap.push(num);
    if (heap.size > k) heap.pop();
  }
  return heap.peek();
}
```

```java
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int num : nums) {
        heap.offer(num);
        if (heap.size() > k) heap.poll();
    }
    return heap.peek();
}
```

```python
import heapq

def find_kth_largest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
```

### Solution
type: alternate
name: Quickselect
time: O(n) average, O(n²) worst case
space: O(1) extra (iterative)

Partition around a random pivot (Lomuto scheme) and continue only into the side containing index `n - k`, the answer's position in ascending order.

```javascript
function findKthLargest(nums, k) {
  const arr = [...nums];
  const target = arr.length - k;
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const pivotIndex = lo + Math.floor(Math.random() * (hi - lo + 1));
    [arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]];
    let store = lo;
    for (let i = lo; i < hi; i++) {
      if (arr[i] < arr[hi]) {
        [arr[i], arr[store]] = [arr[store], arr[i]];
        store++;
      }
    }
    [arr[store], arr[hi]] = [arr[hi], arr[store]];
    if (store === target) break;
    if (store < target) lo = store + 1;
    else hi = store - 1;
  }
  return arr[target];
}
```

```java
public int findKthLargest(int[] nums, int k) {
    Random random = new Random();
    int target = nums.length - k, lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        swap(nums, lo + random.nextInt(hi - lo + 1), hi);
        int store = lo;
        for (int i = lo; i < hi; i++) {
            if (nums[i] < nums[hi]) swap(nums, i, store++);
        }
        swap(nums, store, hi);
        if (store == target) break;
        if (store < target) lo = store + 1;
        else hi = store - 1;
    }
    return nums[target];
}

private void swap(int[] nums, int i, int j) {
    int tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
}
```

```python
import random

def find_kth_largest(nums, k):
    arr = list(nums)
    target = len(arr) - k
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        pivot_index = random.randint(lo, hi)
        arr[pivot_index], arr[hi] = arr[hi], arr[pivot_index]
        store = lo
        for i in range(lo, hi):
            if arr[i] < arr[hi]:
                arr[i], arr[store] = arr[store], arr[i]
                store += 1
        arr[store], arr[hi] = arr[hi], arr[store]
        if store == target:
            break
        if store < target:
            lo = store + 1
        else:
            hi = store - 1
    return arr[target]
```

### Tests

```json
{
  "fn": "findKthLargest",
  "cases": [
    {"args":[[3,2,1,5,6,4],2],"expect":5},
    {"args":[[3,2,3,1,2,4,5,5,6],4],"expect":4},
    {"args":[[1],1],"expect":1},
    {"args":[[2,2,2,2],3],"expect":2},
    {"args":[[-1,-5,3,7,0],5],"expect":-5}
  ]
}
```

## Last Stone Weight
difficulty: easy
faq: false
tags: array, heap, simulation

### Question
You have a collection of stones with positive integer weights. Each turn, smash the two **heaviest** stones together: if they weigh the same both are destroyed; otherwise the lighter one is destroyed and the heavier one's weight becomes the difference. Return the weight of the last remaining stone, or `0` if none remain.

**Example:** `stones = [2, 7, 4, 1, 8, 1]` → `1`.

### Answer
Put all stones in a **max-heap**. Repeatedly pop the two largest, and if they differ, push back their difference. When at most one stone is left, return it (or 0).

### Explanation
Each round needs the current two maximums, and the collection changes every round — exactly the access pattern a max-heap serves in O(log n) per operation.

Java's `PriorityQueue` and Python's `heapq` are min-heaps: use a reversed comparator in Java, and push **negated** weights in Python.

### Solution
type: brute
name: Re-sort every round
time: O(n² log n)
space: O(n)

```javascript
function lastStoneWeight(stones) {
  const pile = [...stones];
  while (pile.length > 1) {
    pile.sort((a, b) => a - b);
    const y = pile.pop();
    const x = pile.pop();
    if (y !== x) pile.push(y - x);
  }
  return pile.length ? pile[0] : 0;
}
```

```java
public int lastStoneWeight(int[] stones) {
    List<Integer> pile = new ArrayList<>();
    for (int s : stones) pile.add(s);
    while (pile.size() > 1) {
        Collections.sort(pile);
        int y = pile.remove(pile.size() - 1), x = pile.remove(pile.size() - 1);
        if (y != x) pile.add(y - x);
    }
    return pile.isEmpty() ? 0 : pile.get(0);
}
```

```python
def last_stone_weight(stones):
    pile = list(stones)
    while len(pile) > 1:
        pile.sort()
        y, x = pile.pop(), pile.pop()
        if y != x:
            pile.append(y - x)
    return pile[0] if pile else 0
```

### Solution
type: optimal
name: Max-heap simulation
time: O(n log n)
space: O(n)

```javascript
// JavaScript has no built-in priority queue — a minimal binary heap.
class Heap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a, b) < 0 → a is popped before b
  }
  get size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(value) {
    const data = this.data;
    data.push(value);
    let i = data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(data[i], data[parent]) >= 0) break;
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }
  pop() {
    const data = this.data;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let next = i;
        if (l < data.length && this.compare(data[l], data[next]) < 0) next = l;
        if (r < data.length && this.compare(data[r], data[next]) < 0) next = r;
        if (next === i) break;
        [data[i], data[next]] = [data[next], data[i]];
        i = next;
      }
    }
    return top;
  }
}

function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);
  for (const stone of stones) heap.push(stone);
  while (heap.size > 1) {
    const y = heap.pop();
    const x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size ? heap.peek() : 0;
}
```

```java
public int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
    for (int stone : stones) heap.offer(stone);
    while (heap.size() > 1) {
        int y = heap.poll(), x = heap.poll();
        if (y != x) heap.offer(y - x);
    }
    return heap.isEmpty() ? 0 : heap.peek();
}
```

```python
import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        y = -heapq.heappop(heap)
        x = -heapq.heappop(heap)
        if y != x:
            heapq.heappush(heap, -(y - x))
    return -heap[0] if heap else 0
```

### Tests

```json
{
  "fn": "lastStoneWeight",
  "cases": [
    {"args":[[2,7,4,1,8,1]],"expect":1},
    {"args":[[1]],"expect":1},
    {"args":[[2,2]],"expect":0}
  ]
}
```

## K Closest Points to Origin
difficulty: medium
faq: true
tags: array, heap, sorting, geometry

### Question
Given an array of `points` where `points[i] = [x, y]` and an integer `k`, return the `k` points closest to the origin `(0, 0)` by Euclidean distance, in any order.

**Example:** `points = [[1, 3], [-2, 2]]`, `k = 1` → `[[-2, 2]]`; `points = [[3, 3], [5, -1], [-2, 4]]`, `k = 2` → `[[3, 3], [-2, 4]]`.

### Answer
Keep a **max-heap of size `k`** keyed by squared distance. Push each point; if the heap exceeds `k`, pop the farthest. The heap ends up holding the `k` closest points.

### Explanation
- Compare **squared** distances `x² + y²` — the square root is monotonic, so skipping it doesn't change the order and avoids floating point.
- A max-heap (not a min-heap) lets you evict the *worst* of the current `k` candidates in O(log k).

Total O(n log k) time and O(k) space. Sorting everything is simpler at O(n log n); quickselect gets O(n) on average.

### Solution
type: brute
name: Sort by distance
time: O(n log n)
space: O(n)

```javascript
function kClosest(points, k) {
  return [...points].sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2)).slice(0, k);
}
```

```java
public int[][] kClosest(int[][] points, int k) {
    int[][] sorted = points.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[0] * a[0] + a[1] * a[1], b[0] * b[0] + b[1] * b[1]));
    return Arrays.copyOfRange(sorted, 0, k);
}
```

```python
def k_closest(points, k):
    return sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)[:k]
```

### Solution
type: optimal
name: Max-heap of size k
time: O(n log k)
space: O(k)

```javascript
// JavaScript has no built-in priority queue — a minimal binary heap.
class Heap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a, b) < 0 → a is popped before b
  }
  get size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(value) {
    const data = this.data;
    data.push(value);
    let i = data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(data[i], data[parent]) >= 0) break;
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }
  pop() {
    const data = this.data;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let next = i;
        if (l < data.length && this.compare(data[l], data[next]) < 0) next = l;
        if (r < data.length && this.compare(data[r], data[next]) < 0) next = r;
        if (next === i) break;
        [data[i], data[next]] = [data[next], data[i]];
        i = next;
      }
    }
    return top;
  }
}

function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a)); // farthest on top
  for (const point of points) {
    heap.push(point);
    if (heap.size > k) heap.pop();
  }
  return heap.data;
}
```

```java
public int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> heap = new PriorityQueue<>(
        (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1])); // farthest on top
    for (int[] point : points) {
        heap.offer(point);
        if (heap.size() > k) heap.poll();
    }
    return heap.toArray(new int[0][]);
}
```

```python
import heapq

def k_closest(points, k):
    heap = []  # (-distance, x, y): heapq is a min-heap, so negate for "farthest on top"
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]
```

### Tests

```json
{
  "fn": "kClosest",
  "opts": {"norm":"sortDeep"},
  "cases": [
    {"args":[[[1,3],[-2,2]],1],"expect":[[-2,2]]},
    {"args":[[[3,3],[5,-1],[-2,4]],2],"expect":[[3,3],[-2,4]]}
  ]
}
```

## Merge k Sorted Lists
difficulty: hard
faq: true
tags: linked-list, heap, divide-and-conquer

### Question
You are given an array of `k` linked lists, each sorted ascending. Merge them all into one sorted linked list and return it.

**Example:** `[[1, 4, 5], [1, 3, 4], [2, 6]]` → `1 → 1 → 2 → 3 → 4 → 4 → 5 → 6`.

### Answer
Put the head of every list into a **min-heap**. Repeatedly pop the smallest node, append it to the result, and push that node's `next` (if any). The heap never holds more than `k` nodes, so each of the `N` total nodes costs O(log k).

### Explanation
The next node of the merged list is always the smallest among the current heads of the `k` lists — a min-heap gives it in O(log k).

1. Push all non-null heads.
2. While the heap isn't empty: pop `node`, attach it to `tail`, and push `node.next` if it exists.

Total O(N log k). **Divide and conquer** (merge lists in pairs, halving the count each round) matches that bound with no heap — handy in JavaScript.

### Solution
type: brute
name: Collect all values, sort, rebuild
time: O(N log N)
space: O(N)

```javascript
function mergeKLists(lists) {
  const values = [];
  for (let node of lists) {
    for (; node; node = node.next) values.push(node.val);
  }
  values.sort((a, b) => a - b);
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of values) tail = tail.next = new ListNode(v);
  return dummy.next;
}
```

```java
public ListNode mergeKLists(ListNode[] lists) {
    List<Integer> values = new ArrayList<>();
    for (ListNode node : lists) {
        for (; node != null; node = node.next) values.add(node.val);
    }
    Collections.sort(values);
    ListNode dummy = new ListNode(), tail = dummy;
    for (int v : values) {
        tail.next = new ListNode(v);
        tail = tail.next;
    }
    return dummy.next;
}
```

```python
def merge_k_lists(lists):
    values = []
    for node in lists:
        while node:
            values.append(node.val)
            node = node.next
    dummy = tail = ListNode()
    for v in sorted(values):
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next
```

### Solution
type: optimal
name: Min-heap of list heads
time: O(N log k)
space: O(k)

```javascript
// JavaScript has no built-in priority queue — a minimal binary heap.
class Heap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a, b) < 0 → a is popped before b
  }
  get size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(value) {
    const data = this.data;
    data.push(value);
    let i = data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(data[i], data[parent]) >= 0) break;
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }
  pop() {
    const data = this.data;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let next = i;
        if (l < data.length && this.compare(data[l], data[next]) < 0) next = l;
        if (r < data.length && this.compare(data[r], data[next]) < 0) next = r;
        if (next === i) break;
        [data[i], data[next]] = [data[next], data[i]];
        i = next;
      }
    }
    return top;
  }
}

function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val - b.val);
  for (const head of lists) if (head) heap.push(head);
  const dummy = new ListNode();
  let tail = dummy;
  while (heap.size) {
    const node = heap.pop();
    tail = tail.next = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}
```

```java
public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
    for (ListNode head : lists) {
        if (head != null) heap.offer(head);
    }
    ListNode dummy = new ListNode(), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();
        tail.next = node;
        tail = node;
        if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;
}
```

```python
import heapq

def merge_k_lists(lists):
    # (value, list index, node): the index breaks ties so nodes are never compared
    heap = [(head.val, i, head) for i, head in enumerate(lists) if head]
    heapq.heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
```

### Solution
type: alternate
name: Divide and conquer (pairwise merging)
time: O(N log k)
space: O(1) extra (iterative)

Merge lists in pairs — `k` lists become `k/2`, then `k/4`, … — so every node is touched once per round, for `log k` rounds.

```javascript
function mergeKLists(lists) {
  const mergeTwo = (a, b) => {
    const dummy = new ListNode();
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) {
        tail.next = a;
        a = a.next;
      } else {
        tail.next = b;
        b = b.next;
      }
      tail = tail.next;
    }
    tail.next = a ?? b;
    return dummy.next;
  };
  if (lists.length === 0) return null;
  let current = [...lists];
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) next.push(mergeTwo(current[i], current[i + 1] ?? null));
    current = next;
  }
  return current[0];
}
```

```java
public ListNode mergeKLists(ListNode[] lists) {
    if (lists.length == 0) return null;
    for (int step = 1; step < lists.length; step *= 2) {
        for (int i = 0; i + step < lists.length; i += 2 * step) {
            lists[i] = mergeTwo(lists[i], lists[i + step]);
        }
    }
    return lists[0];
}

private ListNode mergeTwo(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) {
            tail.next = a;
            a = a.next;
        } else {
            tail.next = b;
            b = b.next;
        }
        tail = tail.next;
    }
    tail.next = a != null ? a : b;
    return dummy.next;
}
```

```python
def merge_k_lists(lists):
    def merge_two(a, b):
        dummy = tail = ListNode()
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next

    if not lists:
        return None
    current = list(lists)
    while len(current) > 1:
        current = [
            merge_two(current[i], current[i + 1] if i + 1 < len(current) else None)
            for i in range(0, len(current), 2)
        ]
    return current[0]
```

### Tests

```json
{
  "fn": "mergeKLists",
  "opts": {"in":["lists"],"out":"list"},
  "cases": [
    {"args":[[[1,4,5],[1,3,4],[2,6]]],"expect":[1,1,2,3,4,4,5,6]},
    {"args":[[]],"expect":[]},
    {"args":[[[]]],"expect":[]},
    {"args":[[[5],[1],[3],[2],[4]]],"expect":[1,2,3,4,5]}
  ]
}
```

## Find Median from Data Stream
difficulty: hard
faq: true
tags: heap, design, data-stream

### Question
Design a `MedianFinder` that supports:

- `addNum(num)` — add an integer from the data stream.
- `findMedian()` — return the median of all numbers added so far (the average of the two middle values when the count is even).

**Example:** `addNum(1)`, `addNum(2)`, `findMedian()` → `1.5`, `addNum(3)`, `findMedian()` → `2`.

### Answer
Keep two heaps: a **max-heap** for the smaller half and a **min-heap** for the larger half, balanced so the max-heap has the same number of elements or one more. The median is the max-heap's top, or the average of both tops.

### Explanation
Invariants: every value in `low` (max-heap) is `<=` every value in `high` (min-heap), and `low.size - high.size` is `0` or `1`.

`addNum(num)`:
1. Push `num` into `low`, then move `low`'s max into `high` — this keeps the ordering invariant.
2. If `high` is now bigger than `low`, move `high`'s min back into `low` — this restores the size invariant.

`findMedian()`: if `low` is bigger, return its top; otherwise return the average of both tops. Insertion is O(log n) and the median is O(1), compared with O(n) inserts into a sorted array.

### Solution
type: brute
name: Sorted array with binary-search insertion
time: O(n) addNum (shifting), O(1) findMedian
space: O(n)

```javascript
class MedianFinder {
  constructor() {
    this.sorted = [];
  }
  addNum(num) {
    let lo = 0;
    let hi = this.sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sorted[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    this.sorted.splice(lo, 0, num);
  }
  findMedian() {
    const n = this.sorted.length;
    const mid = n >> 1;
    return n % 2 ? this.sorted[mid] : (this.sorted[mid - 1] + this.sorted[mid]) / 2;
  }
}
```

```java
class MedianFinder {
    private final List<Integer> sorted = new ArrayList<>();

    public void addNum(int num) {
        int i = Collections.binarySearch(sorted, num);
        sorted.add(i < 0 ? -i - 1 : i, num);
    }

    public double findMedian() {
        int n = sorted.size(), mid = n / 2;
        return n % 2 == 1 ? sorted.get(mid) : (sorted.get(mid - 1) + sorted.get(mid)) / 2.0;
    }
}
```

```python
import bisect


class MedianFinder:
    def __init__(self):
        self.sorted = []

    def add_num(self, num):
        bisect.insort(self.sorted, num)

    def find_median(self):
        n = len(self.sorted)
        mid = n // 2
        if n % 2:
            return float(self.sorted[mid])
        return (self.sorted[mid - 1] + self.sorted[mid]) / 2
```

### Solution
type: optimal
name: Two heaps (max-heap low half, min-heap high half)
time: O(log n) addNum, O(1) findMedian
space: O(n)

```javascript
// JavaScript has no built-in priority queue — a minimal binary heap.
class Heap {
  constructor(compare) {
    this.data = [];
    this.compare = compare; // compare(a, b) < 0 → a is popped before b
  }
  get size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(value) {
    const data = this.data;
    data.push(value);
    let i = data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(data[i], data[parent]) >= 0) break;
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }
  pop() {
    const data = this.data;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let next = i;
        if (l < data.length && this.compare(data[l], data[next]) < 0) next = l;
        if (r < data.length && this.compare(data[r], data[next]) < 0) next = r;
        if (next === i) break;
        [data[i], data[next]] = [data[next], data[i]];
        i = next;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a); // max-heap: smaller half
    this.high = new Heap((a, b) => a - b); // min-heap: larger half
  }
  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop());
    if (this.high.size > this.low.size) this.low.push(this.high.pop());
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}
```

```java
class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder()); // smaller half
    private final PriorityQueue<Integer> high = new PriorityQueue<>(); // larger half

    public void addNum(int num) {
        low.offer(num);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }

    public double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (double) high.peek()) / 2;
    }
}
```

```python
import heapq


class MedianFinder:
    def __init__(self):
        self.low = []  # max-heap via negated values: smaller half
        self.high = []  # min-heap: larger half

    def add_num(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
```

### Tests

```json
{
  "cls": "MedianFinder",
  "cases": [
    {"args":[["new"],["addNum",1],["addNum",2],["findMedian"],["addNum",3],["findMedian"]],"expect":[null,null,null,1.5,null,2]},
    {"args":[["new"],["addNum",5],["findMedian"],["addNum",-1],["findMedian"],["addNum",10],["addNum",3],["findMedian"]],"expect":[null,null,5,null,2,null,null,4]}
  ]
}
```
