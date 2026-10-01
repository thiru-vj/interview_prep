## Valid Parentheses
difficulty: easy
faq: true
tags: string, stack

### Question
Given a string `s` containing only `()[]{}`, determine if it is valid: every opening bracket must be closed by the same type of bracket, in the correct order.

**Example:** `"()[]{}"` → `true`; `"(]"` → `false`; `"([)]"` → `false`; `"{[]}"` → `true`.

### Answer
Push every opening bracket onto a stack. For every closing bracket, the top of the stack must be its matching opener — pop it, or fail. The string is valid only if the stack is empty at the end.

### Explanation
The most recently opened bracket must be the first one closed — exactly LIFO order, so a stack fits.

1. Map each closer to its opener: `) → (`, `] → [`, `} → {`.
2. For each character: if it's an opener, push it. If it's a closer, pop and compare with the expected opener; an empty stack or a mismatch means invalid.
3. At the end, leftover openers mean invalid.

Quick win: an odd-length string can never be valid.

### Solution
type: brute
name: Repeatedly remove matched pairs
time: O(n²)
space: O(n)

Keep deleting `()`, `[]` and `{}` until nothing changes; valid strings shrink to empty.

```javascript
function isValid(s) {
  let prev;
  do {
    prev = s;
    s = s.replace('()', '').replace('[]', '').replace('{}', '');
  } while (s !== prev);
  return s.length === 0;
}
```

```java
public boolean isValid(String s) {
    String prev;
    do {
        prev = s;
        s = s.replace("()", "").replace("[]", "").replace("{}", "");
    } while (!s.equals(prev));
    return s.isEmpty();
}
```

```python
def is_valid(s):
    prev = None
    while s != prev:
        prev = s
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return s == ""
```

### Solution
type: optimal
name: Stack of open brackets
time: O(n)
space: O(n)

```javascript
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
```

```java
public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char ch : s.toCharArray()) {
        if (ch == '(') stack.push(')');
        else if (ch == '[') stack.push(']');
        else if (ch == '{') stack.push('}');
        else if (stack.isEmpty() || stack.pop() != ch) return false;
    }
    return stack.isEmpty();
}
```

```python
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
```

### Tests

```json
{
  "fn": "isValid",
  "cases": [
    {"args":["()[]{}"],"expect":true},
    {"args":["(]"],"expect":false},
    {"args":["([)]"],"expect":false},
    {"args":["{[]}"],"expect":true},
    {"args":["("],"expect":false},
    {"args":["]"],"expect":false}
  ]
}
```

## Min Stack
difficulty: medium
faq: true
tags: stack, design

### Question
Design a stack that supports `push(val)`, `pop()`, `top()` and `getMin()` — retrieving the minimum element — **all in O(1) time**.

**Example:** `push(-2)`, `push(0)`, `push(-3)`, `getMin()` → `-3`, `pop()`, `top()` → `0`, `getMin()` → `-2`.

### Answer
Store, alongside every value, the minimum of the stack *at the time it was pushed* (`min(val, previous min)`). The current minimum is then always on top, and popping automatically restores the previous minimum.

### Explanation
The minimum only changes when elements are pushed or popped, and a stack only changes at the top. So each stack entry can remember "the minimum of everything at or below me":

- `push(val)`: push `[val, min(val, currentMin)]` (or just `val` when empty).
- `pop()`: pop the pair — the new top's stored minimum is automatically correct.
- `top()`: first element of the top pair. `getMin()`: second element of the top pair.

Every operation is O(1); the cost is O(n) extra memory for the stored minimums.

### Solution
type: brute
name: Scan for the minimum
time: O(1) push/pop/top, O(n) getMin
space: O(n)

```javascript
class MinStack {
  constructor() {
    this.stack = [];
  }
  push(val) {
    this.stack.push(val);
  }
  pop() {
    this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return Math.min(...this.stack);
  }
}
```

```java
class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>();

    public void push(int val) { stack.push(val); }

    public void pop() { stack.pop(); }

    public int top() { return stack.peek(); }

    public int getMin() {
        int min = Integer.MAX_VALUE;
        for (int val : stack) min = Math.min(min, val);
        return min;
    }
}
```

```python
class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, val):
        self.stack.append(val)

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return min(self.stack)
```

### Solution
type: optimal
name: Store the running minimum with each entry
time: O(1) for every operation
space: O(n)

```javascript
class MinStack {
  constructor() {
    this.stack = []; // [value, minimum at or below this entry]
  }
  push(val) {
    const min = this.stack.length ? Math.min(val, this.getMin()) : val;
    this.stack.push([val, min]);
  }
  pop() {
    this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1][0];
  }
  getMin() {
    return this.stack[this.stack.length - 1][1];
  }
}
```

```java
class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>(); // {value, minimum at or below}

    public void push(int val) {
        int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[] {val, min});
    }

    public void pop() { stack.pop(); }

    public int top() { return stack.peek()[0]; }

    public int getMin() { return stack.peek()[1]; }
}
```

```python
class MinStack:
    def __init__(self):
        self.stack = []  # (value, minimum at or below this entry)

    def push(self, val):
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]
```

### Solution
type: alternate
name: Separate min stack
time: O(1) for every operation
space: O(n) worst case, often less

Keep a second stack that only receives a value when it's `<=` the current minimum. Pop from it only when the popped value equals its top. Saves memory when the minimum rarely changes.

```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.mins = [];
  }
  push(val) {
    this.stack.push(val);
    if (this.mins.length === 0 || val <= this.mins[this.mins.length - 1]) this.mins.push(val);
  }
  pop() {
    if (this.stack.pop() === this.mins[this.mins.length - 1]) this.mins.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return this.mins[this.mins.length - 1];
  }
}
```

```java
class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>();
    private final Deque<Integer> mins = new ArrayDeque<>();

    public void push(int val) {
        stack.push(val);
        if (mins.isEmpty() || val <= mins.peek()) mins.push(val);
    }

    public void pop() {
        if (stack.pop().equals(mins.peek())) mins.pop();
    }

    public int top() { return stack.peek(); }

    public int getMin() { return mins.peek(); }
}
```

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []

    def push(self, val):
        self.stack.append(val)
        if not self.mins or val <= self.mins[-1]:
            self.mins.append(val)

    def pop(self):
        if self.stack.pop() == self.mins[-1]:
            self.mins.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return self.mins[-1]
```

### Tests

```json
{
  "cls": "MinStack",
  "cases": [
    {"args":[["new"],["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]],"expect":[null,null,null,null,-3,null,0,-2]},
    {"args":[["new"],["push",0],["push",1],["push",0],["getMin"],["pop"],["getMin"]],"expect":[null,null,null,null,0,null,0]}
  ]
}
```

## Evaluate Reverse Polish Notation
difficulty: medium
faq: false
tags: array, stack, math

### Question
Evaluate an arithmetic expression given in Reverse Polish Notation as an array of tokens. Operators are `+`, `-`, `*`, `/`; operands are integers. Division truncates toward zero. The expression is always valid.

**Example:** `["2", "1", "+", "3", "*"]` → `9` (`(2 + 1) * 3`); `["4", "13", "5", "/", "+"]` → `6`.

### Answer
Scan tokens left to right with a stack. Push numbers; on an operator, pop the top two values (right operand first), apply the operator, and push the result. The final stack value is the answer.

### Explanation
In RPN every operator applies to the two most recent results — a natural stack.

1. For each token: if it's a number, push it.
2. If it's an operator: `b = pop()`, `a = pop()`, push `a op b`. Order matters for `-` and `/`.
3. Division must truncate toward zero: `Math.trunc(a / b)` in JavaScript, `int(a / b)` in Python (Python's `//` floors, which is wrong for negatives), plain `/` in Java.

### Solution
type: brute
name: Repeatedly collapse the first operator
time: O(n²)
space: O(n)

Find the first operator, replace it and its two preceding operands with the result, and repeat until one token is left.

```javascript
function evalRPN(tokens) {
  const ops = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.trunc(a / b),
  };
  const items = [...tokens];
  while (items.length > 1) {
    const i = items.findIndex((t) => t in ops);
    const value = ops[items[i]](Number(items[i - 2]), Number(items[i - 1]));
    items.splice(i - 2, 3, String(value));
  }
  return Number(items[0]);
}
```

```java
public int evalRPN(String[] tokens) {
    List<String> items = new ArrayList<>(Arrays.asList(tokens));
    while (items.size() > 1) {
        int i = 0;
        while (!"+-*/".contains(items.get(i)) || items.get(i).length() != 1) i++;
        int a = Integer.parseInt(items.get(i - 2)), b = Integer.parseInt(items.get(i - 1));
        int value = switch (items.get(i)) {
            case "+" -> a + b;
            case "-" -> a - b;
            case "*" -> a * b;
            default -> a / b;
        };
        items.subList(i - 2, i + 1).clear();
        items.add(i - 2, String.valueOf(value));
    }
    return Integer.parseInt(items.get(0));
}
```

```python
def eval_rpn(tokens):
    ops = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: int(a / b),
    }
    items = list(tokens)
    while len(items) > 1:
        i = next(i for i, t in enumerate(items) if t in ops)
        value = ops[items[i]](int(items[i - 2]), int(items[i - 1]))
        items[i - 2 : i + 1] = [str(value)]
    return int(items[0])
```

### Solution
type: optimal
name: Operand stack
time: O(n)
space: O(n)

```javascript
function evalRPN(tokens) {
  const stack = [];
  for (const token of tokens) {
    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const b = stack.pop();
      const a = stack.pop();
      if (token === '+') stack.push(a + b);
      else if (token === '-') stack.push(a - b);
      else if (token === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}
```

```java
public int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String token : tokens) {
        switch (token) {
            case "+" -> stack.push(stack.pop() + stack.pop());
            case "*" -> stack.push(stack.pop() * stack.pop());
            case "-" -> {
                int b = stack.pop(), a = stack.pop();
                stack.push(a - b);
            }
            case "/" -> {
                int b = stack.pop(), a = stack.pop();
                stack.push(a / b);
            }
            default -> stack.push(Integer.parseInt(token));
        }
    }
    return stack.pop();
}
```

```python
def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack.pop()
```

### Tests

```json
{
  "fn": "evalRPN",
  "py": "eval_rpn",
  "cases": [
    {"args":[["2","1","+","3","*"]],"expect":9},
    {"args":[["4","13","5","/","+"]],"expect":6},
    {"args":[["10","6","9","3","+","-11","*","/","*","17","+","5","+"]],"expect":22},
    {"args":[["7","-3","/"]],"expect":-2}
  ]
}
```

## Daily Temperatures
difficulty: medium
faq: true
tags: array, stack, monotonic-stack

### Question
Given an array `temperatures`, return an array `answer` where `answer[i]` is the number of days you have to wait after day `i` to get a warmer temperature. If there is no future warmer day, `answer[i] = 0`.

**Example:** `temperatures = [73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`.

### Answer
Use a **monotonic decreasing stack** of indices still waiting for a warmer day. When today is warmer than the day on top of the stack, pop it and record `today - thatDay`. Push today afterwards.

### Explanation
The stack holds days whose "next warmer day" hasn't been found yet, with temperatures decreasing from bottom to top.

For each day `i`:
1. While the stack isn't empty and `temperatures[i] > temperatures[top]`: pop `top`, set `answer[top] = i - top`.
2. Push `i`.

Days left on the stack at the end never see a warmer day and keep `0`. Each index is pushed and popped once: O(n).

### Solution
type: brute
name: Scan forward from each day
time: O(n²)
space: O(1) extra

```javascript
function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  for (let i = 0; i < temperatures.length; i++) {
    for (let j = i + 1; j < temperatures.length; j++) {
      if (temperatures[j] > temperatures[i]) {
        answer[i] = j - i;
        break;
      }
    }
  }
  return answer;
}
```

```java
public int[] dailyTemperatures(int[] temperatures) {
    int[] answer = new int[temperatures.length];
    for (int i = 0; i < temperatures.length; i++) {
        for (int j = i + 1; j < temperatures.length; j++) {
            if (temperatures[j] > temperatures[i]) {
                answer[i] = j - i;
                break;
            }
        }
    }
    return answer;
}
```

```python
def daily_temperatures(temperatures):
    n = len(temperatures)
    answer = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if temperatures[j] > temperatures[i]:
                answer[i] = j - i
                break
    return answer
```

### Solution
type: optimal
name: Monotonic decreasing stack
time: O(n)
space: O(n)

```javascript
function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const day = stack.pop();
      answer[day] = i - day;
    }
    stack.push(i);
  }
  return answer;
}
```

```java
public int[] dailyTemperatures(int[] temperatures) {
    int[] answer = new int[temperatures.length];
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < temperatures.length; i++) {
        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
            int day = stack.pop();
            answer[day] = i - day;
        }
        stack.push(i);
    }
    return answer;
}
```

```python
def daily_temperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []
    for i, temp in enumerate(temperatures):
        while stack and temp > temperatures[stack[-1]]:
            day = stack.pop()
            answer[day] = i - day
        stack.append(i)
    return answer
```

### Tests

```json
{
  "fn": "dailyTemperatures",
  "cases": [
    {"args":[[73,74,75,71,69,72,76,73]],"expect":[1,1,4,2,1,1,0,0]},
    {"args":[[30,60,90]],"expect":[1,1,0]}
  ]
}
```

## Largest Rectangle in Histogram
difficulty: hard
faq: true
tags: array, stack, monotonic-stack

### Question
Given an array `heights` representing a histogram where each bar has width 1, return the area of the largest rectangle that fits inside the histogram.

**Example:** `heights = [2, 1, 5, 6, 2, 3]` → `10` (bars `5, 6` with height 5 and width 2).

### Answer
For each bar, the widest rectangle using its full height extends until the first shorter bar on each side. A **monotonic increasing stack** finds those boundaries: when a shorter bar arrives, pop taller bars and compute their rectangles — the new bar is their right boundary and the element below them on the stack is their left boundary.

### Explanation
1. Iterate `i` from `0` to `n` (treat `heights[n]` as `0` to flush the stack at the end).
2. While the stack's top bar is taller than `heights[i]`: pop it as `h`. Its rectangle spans from just after the new stack top to `i - 1`, so `width = stack empty ? i : i - stack.top - 1`. Update `best` with `h * width`.
3. Push `i`.

Every bar is pushed and popped once — O(n).

### Solution
type: brute
name: Expand from every bar
time: O(n²)
space: O(1)

For each bar, fix the minimum height as you extend right, computing every rectangle that starts at that bar.

```javascript
function largestRectangleArea(heights) {
  let best = 0;
  for (let i = 0; i < heights.length; i++) {
    let minHeight = Infinity;
    for (let j = i; j < heights.length; j++) {
      minHeight = Math.min(minHeight, heights[j]);
      best = Math.max(best, minHeight * (j - i + 1));
    }
  }
  return best;
}
```

```java
public int largestRectangleArea(int[] heights) {
    int best = 0;
    for (int i = 0; i < heights.length; i++) {
        int minHeight = Integer.MAX_VALUE;
        for (int j = i; j < heights.length; j++) {
            minHeight = Math.min(minHeight, heights[j]);
            best = Math.max(best, minHeight * (j - i + 1));
        }
    }
    return best;
}
```

```python
def largest_rectangle_area(heights):
    best = 0
    for i in range(len(heights)):
        min_height = float("inf")
        for j in range(i, len(heights)):
            min_height = min(min_height, heights[j])
            best = max(best, min_height * (j - i + 1))
    return best
```

### Solution
type: optimal
name: Monotonic increasing stack
time: O(n)
space: O(n)

```javascript
function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}
```

```java
public int largestRectangleArea(int[] heights) {
    Deque<Integer> stack = new ArrayDeque<>();
    int best = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = i == heights.length ? 0 : heights[i];
        while (!stack.isEmpty() && heights[stack.peek()] > h) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            best = Math.max(best, height * width);
        }
        stack.push(i);
    }
    return best;
}
```

```python
def largest_rectangle_area(heights):
    stack = []
    best = 0
    for i in range(len(heights) + 1):
        h = 0 if i == len(heights) else heights[i]
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i - stack[-1] - 1 if stack else i
            best = max(best, height * width)
        stack.append(i)
    return best
```

### Tests

```json
{
  "fn": "largestRectangleArea",
  "cases": [
    {"args":[[2,1,5,6,2,3]],"expect":10},
    {"args":[[2,4]],"expect":4},
    {"args":[[2,1,2]],"expect":3}
  ]
}
```

## Next Greater Element I
difficulty: easy
faq: false
tags: array, stack, monotonic-stack, hash-map

### Question
You are given two arrays of distinct integers, `nums1` and `nums2`, where `nums1` is a subset of `nums2`. For each `x` in `nums1`, find the first element to the **right** of `x` in `nums2` that is greater than `x`, or `-1` if none exists.

**Example:** `nums1 = [4, 1, 2]`, `nums2 = [1, 3, 4, 2]` → `[-1, 3, -1]`.

### Answer
Precompute the next greater element for **every** value in `nums2` with a monotonic decreasing stack, storing results in a hash map. Then answer each query in `nums1` by lookup.

### Explanation
1. Walk `nums2`. While the stack's top is smaller than the current value, pop it and record `nextGreater[top] = current`.
2. Push the current value.
3. Values left on the stack have no greater element to their right.
4. Map each `x` in `nums1` to `nextGreater[x] ?? -1`.

This is O(n + m) instead of scanning `nums2` for every query.

### Solution
type: brute
name: Find each value, then scan right
time: O(n · m)
space: O(1) extra

```javascript
function nextGreaterElement(nums1, nums2) {
  return nums1.map((x) => {
    const start = nums2.indexOf(x);
    for (let j = start + 1; j < nums2.length; j++) {
      if (nums2[j] > x) return nums2[j];
    }
    return -1;
  });
}
```

```java
public int[] nextGreaterElement(int[] nums1, int[] nums2) {
    int[] result = new int[nums1.length];
    for (int i = 0; i < nums1.length; i++) {
        int j = 0;
        while (nums2[j] != nums1[i]) j++;
        result[i] = -1;
        for (j = j + 1; j < nums2.length; j++) {
            if (nums2[j] > nums1[i]) {
                result[i] = nums2[j];
                break;
            }
        }
    }
    return result;
}
```

```python
def next_greater_element(nums1, nums2):
    result = []
    for x in nums1:
        start = nums2.index(x)
        result.append(next((y for y in nums2[start + 1 :] if y > x), -1))
    return result
```

### Solution
type: optimal
name: Monotonic stack + hash map
time: O(n + m)
space: O(m)

```javascript
function nextGreaterElement(nums1, nums2) {
  const nextGreater = new Map();
  const stack = [];
  for (const num of nums2) {
    while (stack.length && stack[stack.length - 1] < num) nextGreater.set(stack.pop(), num);
    stack.push(num);
  }
  return nums1.map((x) => nextGreater.get(x) ?? -1);
}
```

```java
public int[] nextGreaterElement(int[] nums1, int[] nums2) {
    Map<Integer, Integer> nextGreater = new HashMap<>();
    Deque<Integer> stack = new ArrayDeque<>();
    for (int num : nums2) {
        while (!stack.isEmpty() && stack.peek() < num) nextGreater.put(stack.pop(), num);
        stack.push(num);
    }
    int[] result = new int[nums1.length];
    for (int i = 0; i < nums1.length; i++) result[i] = nextGreater.getOrDefault(nums1[i], -1);
    return result;
}
```

```python
def next_greater_element(nums1, nums2):
    next_greater = {}
    stack = []
    for num in nums2:
        while stack and stack[-1] < num:
            next_greater[stack.pop()] = num
        stack.append(num)
    return [next_greater.get(x, -1) for x in nums1]
```

### Tests

```json
{
  "fn": "nextGreaterElement",
  "cases": [
    {"args":[[4,1,2],[1,3,4,2]],"expect":[-1,3,-1]},
    {"args":[[2,4],[1,2,3,4]],"expect":[3,-1]}
  ]
}
```
