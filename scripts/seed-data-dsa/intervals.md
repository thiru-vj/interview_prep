## Merge Intervals
difficulty: medium
faq: true
tags: array, intervals, sorting

### Question
Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and return the non-overlapping intervals that cover all the input ranges.

**Example:** `[[1, 3], [2, 6], [8, 10], [15, 18]]` → `[[1, 6], [8, 10], [15, 18]]`; `[[1, 4], [4, 5]]` → `[[1, 5]]`.

### Answer
Sort by start. Walk through the intervals keeping the last merged one: if the next interval starts at or before its end, they overlap — extend the end to `max(end, next.end)`; otherwise start a new merged interval.

### Explanation
After sorting by start, any interval that overlaps the current merged block must come immediately after it (nothing that starts earlier is still pending).

1. Sort by `start`.
2. `merged = [first interval]`.
3. For each next `[s, e]`: if `s <= last.end`, set `last.end = max(last.end, e)`; else push `[s, e]`.

Use `max` because a later interval can be completely contained in the current one (`[1, 10]`, `[2, 3]`). Touching intervals (`[1, 4]`, `[4, 5]`) count as overlapping here. O(n log n) for the sort.

### Solution
type: brute
name: Repeatedly merge any overlapping pair
time: O(n³)
space: O(n)

Keep scanning all pairs; whenever two intervals overlap, replace them with their union and start over. Stops when no pair overlaps.

```javascript
function merge(intervals) {
  const list = intervals.map((i) => [...i]);
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i][0] <= list[j][1] && list[j][0] <= list[i][1]) {
          list[i] = [Math.min(list[i][0], list[j][0]), Math.max(list[i][1], list[j][1])];
          list.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return list.sort((a, b) => a[0] - b[0]);
}
```

```java
public int[][] merge(int[][] intervals) {
    List<int[]> list = new ArrayList<>();
    for (int[] interval : intervals) list.add(interval.clone());
    boolean changed = true;
    while (changed) {
        changed = false;
        outer:
        for (int i = 0; i < list.size(); i++) {
            for (int j = i + 1; j < list.size(); j++) {
                int[] a = list.get(i), b = list.get(j);
                if (a[0] <= b[1] && b[0] <= a[1]) {
                    list.set(i, new int[] {Math.min(a[0], b[0]), Math.max(a[1], b[1])});
                    list.remove(j);
                    changed = true;
                    break outer;
                }
            }
        }
    }
    list.sort((a, b) -> Integer.compare(a[0], b[0]));
    return list.toArray(new int[0][]);
}
```

```python
def merge(intervals):
    items = [list(i) for i in intervals]
    changed = True
    while changed:
        changed = False
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                if a[0] <= b[1] and b[0] <= a[1]:
                    items[i] = [min(a[0], b[0]), max(a[1], b[1])]
                    items.pop(j)
                    changed = True
                    break
            if changed:
                break
    return sorted(items)
```

### Solution
type: optimal
name: Sort by start, then sweep
time: O(n log n)
space: O(n) for the output

```javascript
function merge(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
```

```java
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : intervals) {
        if (!merged.isEmpty() && interval[0] <= merged.get(merged.size() - 1)[1]) {
            int[] last = merged.get(merged.size() - 1);
            last[1] = Math.max(last[1], interval[1]);
        } else {
            merged.add(new int[] {interval[0], interval[1]});
        }
    }
    return merged.toArray(new int[0][]);
}
```

```python
def merge(intervals):
    merged = []
    for start, end in sorted(intervals, key=lambda i: i[0]):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
```

### Tests

```json
{
  "fn": "merge",
  "cases": [
    {"args":[[[1,3],[2,6],[8,10],[15,18]]],"expect":[[1,6],[8,10],[15,18]]},
    {"args":[[[1,4],[4,5]]],"expect":[[1,5]]},
    {"args":[[[1,4],[0,4]]],"expect":[[0,4]]},
    {"args":[[[1,10],[2,3],[4,5]]],"expect":[[1,10]]},
    {"args":[[[2,3],[4,5],[6,7],[1,10]]],"expect":[[1,10]]}
  ]
}
```

## Insert Interval
difficulty: medium
faq: false
tags: array, intervals

### Question
You're given a list of non-overlapping `intervals` sorted by start, and a `newInterval`. Insert it so the list stays sorted and non-overlapping, merging where necessary.

**Example:** `intervals = [[1, 3], [6, 9]]`, `newInterval = [2, 5]` → `[[1, 5], [6, 9]]`; `intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]]`, `newInterval = [4, 8]` → `[[1, 2], [3, 10], [12, 16]]`.

### Answer
One linear pass in three phases: copy intervals that end **before** the new one starts; merge every interval that overlaps it into the new interval (take the min start and max end); then copy the rest.

### Explanation
Because the input is already sorted and disjoint:

1. While `intervals[i].end < newInterval.start` → no overlap, entirely to the left: push it.
2. While `intervals[i].start <= newInterval.end` → overlap: `newInterval = [min(starts), max(ends)]`.
3. Push the merged `newInterval`, then everything remaining (entirely to the right).

O(n) — no sorting needed, unlike appending and re-running *Merge Intervals* (O(n log n)).

### Solution
type: brute
name: Append, then run Merge Intervals
time: O(n log n)
space: O(n)

```javascript
function insert(intervals, newInterval) {
  const all = [...intervals, newInterval].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of all) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
```

```java
public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> all = new ArrayList<>();
    for (int[] interval : intervals) all.add(interval.clone());
    all.add(newInterval.clone());
    all.sort((a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : all) {
        if (!merged.isEmpty() && interval[0] <= merged.get(merged.size() - 1)[1]) {
            int[] last = merged.get(merged.size() - 1);
            last[1] = Math.max(last[1], interval[1]);
        } else {
            merged.add(interval);
        }
    }
    return merged.toArray(new int[0][]);
}
```

```python
def insert(intervals, new_interval):
    merged = []
    for start, end in sorted(intervals + [new_interval]):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
```

### Solution
type: optimal
name: Linear three-phase scan
time: O(n)
space: O(n) for the output

```javascript
function insert(intervals, newInterval) {
  const result = [];
  let [start, end] = newInterval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < start) result.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  while (i < intervals.length) result.push(intervals[i++]);
  return result;
}
```

```java
public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int start = newInterval[0], end = newInterval[1], i = 0;
    while (i < intervals.length && intervals[i][1] < start) result.add(intervals[i++]);
    while (i < intervals.length && intervals[i][0] <= end) {
        start = Math.min(start, intervals[i][0]);
        end = Math.max(end, intervals[i][1]);
        i++;
    }
    result.add(new int[] {start, end});
    while (i < intervals.length) result.add(intervals[i++]);
    return result.toArray(new int[0][]);
}
```

```python
def insert(intervals, new_interval):
    result = []
    start, end = new_interval
    i = 0
    while i < len(intervals) and intervals[i][1] < start:
        result.append(intervals[i])
        i += 1
    while i < len(intervals) and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    result.append([start, end])
    result.extend(intervals[i:])
    return result
```

### Tests

```json
{
  "fn": "insert",
  "cases": [
    {"args":[[[1,3],[6,9]],[2,5]],"expect":[[1,5],[6,9]]},
    {"args":[[[1,2],[3,5],[6,7],[8,10],[12,16]],[4,8]],"expect":[[1,2],[3,10],[12,16]]},
    {"args":[[],[5,7]],"expect":[[5,7]]},
    {"args":[[[1,5]],[6,8]],"expect":[[1,5],[6,8]]},
    {"args":[[[3,5]],[1,2]],"expect":[[1,2],[3,5]]}
  ]
}
```

## Non-overlapping Intervals
difficulty: medium
faq: false
tags: array, intervals, greedy, sorting

### Question
Given an array of `intervals`, return the minimum number of intervals you need to remove so the rest are non-overlapping. Intervals that only touch (`[1, 2]` and `[2, 3]`) don't overlap.

**Example:** `[[1, 2], [2, 3], [3, 4], [1, 3]]` → `1` (remove `[1, 3]`); `[[1, 2], [1, 2], [1, 2]]` → `2`.

### Answer
Equivalently, keep as many intervals as possible. **Sort by end time** and greedily keep each interval that starts at or after the end of the last kept one — ending early leaves the most room for the rest (the classic activity-selection argument). Answer = total − kept.

### Explanation
1. Sort by `end`.
2. `prevEnd = -∞`, `kept = 0`.
3. For each `[s, e]`: if `s >= prevEnd`, keep it (`kept++`, `prevEnd = e`); otherwise it overlaps a kept interval that ends no later, so it's the one to remove.
4. Return `n - kept`.

**Why sort by end?** Among intervals that could come next, the one finishing first never blocks more future intervals than any other choice. Sorting by start fails on inputs like `[[1, 100], [2, 3], [4, 5]]`.

### Solution
type: brute
name: DP over intervals sorted by start (longest chain)
time: O(n²)
space: O(n)

`dp[i]` = the most non-overlapping intervals ending with interval `i` — the *Longest Increasing Subsequence* pattern applied to intervals.

```javascript
function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const n = sorted.length;
  const dp = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (sorted[j][1] <= sorted[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return n - Math.max(0, ...dp);
}
```

```java
public int eraseOverlapIntervals(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
    int n = sorted.length, best = 0;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (sorted[j][1] <= sorted[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);
        }
        best = Math.max(best, dp[i]);
    }
    return n - best;
}
```

```python
def erase_overlap_intervals(intervals):
    items = sorted(intervals)
    n = len(items)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if items[j][1] <= items[i][0]:
                dp[i] = max(dp[i], dp[j] + 1)
    return n - max(dp, default=0)
```

### Solution
type: optimal
name: Greedy — sort by end, keep the earliest-finishing
time: O(n log n)
space: O(1) extra (ignoring sort)

```javascript
function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let kept = 0;
  let prevEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= prevEnd) {
      kept++;
      prevEnd = end;
    }
  }
  return intervals.length - kept;
}
```

```java
public int eraseOverlapIntervals(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[1], b[1]));
    int kept = 0;
    long prevEnd = Long.MIN_VALUE;
    for (int[] interval : sorted) {
        if (interval[0] >= prevEnd) {
            kept++;
            prevEnd = interval[1];
        }
    }
    return intervals.length - kept;
}
```

```python
def erase_overlap_intervals(intervals):
    kept = 0
    prev_end = float("-inf")
    for start, end in sorted(intervals, key=lambda i: i[1]):
        if start >= prev_end:
            kept += 1
            prev_end = end
    return len(intervals) - kept
```

### Tests

```json
{
  "fn": "eraseOverlapIntervals",
  "cases": [
    {"args":[[[1,2],[2,3],[3,4],[1,3]]],"expect":1},
    {"args":[[[1,2],[1,2],[1,2]]],"expect":2},
    {"args":[[[1,2],[2,3]]],"expect":0},
    {"args":[[[1,100],[11,22],[1,11],[2,12]]],"expect":2}
  ]
}
```

## Meeting Rooms II
difficulty: medium
faq: true
tags: array, intervals, heap, sorting, sweep-line

### Question
Given an array of meeting time intervals `[start, end]`, return the minimum number of conference rooms required. A meeting ending at time `t` frees its room for a meeting starting at `t`.

**Example:** `[[0, 30], [5, 10], [15, 20]]` → `2`; `[[7, 10], [2, 4]]` → `1`.

### Answer
Sort meetings by start and keep a **min-heap of end times** for rooms in use. For each meeting, if the earliest-ending room is free by its start (`heap.min <= start`), reuse it (pop); then push this meeting's end. The heap's maximum size is the answer.

### Explanation
The heap holds the end time of every currently occupied room; its minimum is the room that frees up soonest.

1. Sort by start time.
2. For each meeting: if `heap.peek() <= start`, pop (that room is reused). Push `end`.
3. The answer is the heap's size at the end (it only ever grows by one per meeting that needs a new room).

**Sweep-line alternative:** sort all starts and all ends separately; walk the starts, and for each one, if the earliest remaining end is `<= start`, a room frees up (advance the end pointer), otherwise you need a new room. Same O(n log n), no heap.

### Solution
type: brute
name: Count overlaps at every start time
time: O(n²)
space: O(1)

The number of rooms needed is the maximum number of meetings in progress at any moment, and that maximum always occurs at some meeting's start time.

```javascript
function minMeetingRooms(intervals) {
  let best = 0;
  for (const [t] of intervals) {
    let active = 0;
    for (const [s, e] of intervals) if (s <= t && t < e) active++;
    best = Math.max(best, active);
  }
  return best;
}
```

```java
public int minMeetingRooms(int[][] intervals) {
    int best = 0;
    for (int[] meeting : intervals) {
        int t = meeting[0], active = 0;
        for (int[] other : intervals) {
            if (other[0] <= t && t < other[1]) active++;
        }
        best = Math.max(best, active);
    }
    return best;
}
```

```python
def min_meeting_rooms(intervals):
    best = 0
    for t, _ in intervals:
        active = sum(1 for s, e in intervals if s <= t < e)
        best = max(best, active)
    return best
```

### Solution
type: optimal
name: Sweep line over sorted starts and ends
time: O(n log n)
space: O(n)

```javascript
function minMeetingRooms(intervals) {
  const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);
  const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);
  let rooms = 0;
  let endPtr = 0;
  for (const start of starts) {
    if (start >= ends[endPtr]) endPtr++;
    else rooms++;
  }
  return rooms;
}
```

```java
public int minMeetingRooms(int[][] intervals) {
    int n = intervals.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }
    Arrays.sort(starts);
    Arrays.sort(ends);
    int rooms = 0, endPtr = 0;
    for (int start : starts) {
        if (start >= ends[endPtr]) endPtr++;
        else rooms++;
    }
    return rooms;
}
```

```python
def min_meeting_rooms(intervals):
    starts = sorted(i[0] for i in intervals)
    ends = sorted(i[1] for i in intervals)
    rooms = end_ptr = 0
    for start in starts:
        if start >= ends[end_ptr]:
            end_ptr += 1
        else:
            rooms += 1
    return rooms
```

### Solution
type: alternate
name: Min-heap of end times
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

function minMeetingRooms(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const heap = new Heap((a, b) => a - b); // end times of occupied rooms
  for (const [start, end] of sorted) {
    if (heap.size && heap.peek() <= start) heap.pop();
    heap.push(end);
  }
  return heap.size;
}
```

```java
public int minMeetingRooms(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int[] meeting : sorted) {
        if (!heap.isEmpty() && heap.peek() <= meeting[0]) heap.poll();
        heap.offer(meeting[1]);
    }
    return heap.size();
}
```

```python
import heapq

def min_meeting_rooms(intervals):
    heap = []  # end times of occupied rooms
    for start, end in sorted(intervals):
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)
```

### Tests

```json
{
  "fn": "minMeetingRooms",
  "cases": [
    {"args":[[[0,30],[5,10],[15,20]]],"expect":2},
    {"args":[[[7,10],[2,4]]],"expect":1},
    {"args":[[[1,5],[5,10]]],"expect":1},
    {"args":[[[1,10],[2,7],[3,19],[8,12],[10,20],[11,30]]],"expect":4}
  ]
}
```
