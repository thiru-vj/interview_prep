## Reverse Linked List
difficulty: easy
faq: true
tags: linked-list, recursion

### Question
Given the `head` of a singly linked list, reverse the list and return the new head.

**Example:** `1 → 2 → 3 → 4 → 5` → `5 → 4 → 3 → 2 → 1`.

### Answer
Walk the list once with three pointers — `prev`, `curr`, `next`. For each node, save `next`, point `curr.next` back at `prev`, then advance `prev` and `curr`. When `curr` is null, `prev` is the new head.

### Explanation
1. `prev = null`, `curr = head`.
2. While `curr`: `next = curr.next`; `curr.next = prev`; `prev = curr`; `curr = next`.
3. Return `prev`.

Saving `next` before rewiring is the key step — otherwise you lose the rest of the list. The recursive version reverses the tail first, then hooks the current node on the end, at the cost of O(n) stack space.

### Solution
type: brute
name: Copy values into an array, rebuild
time: O(n)
space: O(n)

```javascript
function reverseList(head) {
  const values = [];
  for (let node = head; node; node = node.next) values.push(node.val);
  let node = head;
  while (node) {
    node.val = values.pop();
    node = node.next;
  }
  return head;
}
```

```java
public ListNode reverseList(ListNode head) {
    Deque<Integer> values = new ArrayDeque<>();
    for (ListNode node = head; node != null; node = node.next) values.push(node.val);
    for (ListNode node = head; node != null; node = node.next) node.val = values.pop();
    return head;
}
```

```python
def reverse_list(head):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    node = head
    while node:
        node.val = values.pop()
        node = node.next
    return head
```

### Solution
type: optimal
name: Iterative pointer reversal
time: O(n)
space: O(1)

```javascript
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

```python
def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
```

### Solution
type: alternate
name: Recursive
time: O(n)
space: O(n) recursion stack

```javascript
function reverseList(head) {
  if (!head || !head.next) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}
```

```java
public ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```

```python
def reverse_list(head):
    if not head or not head.next:
        return head
    new_head = reverse_list(head.next)
    head.next.next = head
    head.next = None
    return new_head
```

### Tests

```json
{
  "fn": "reverseList",
  "opts": {"in":["list"],"out":"list"},
  "cases": [
    {"args":[[1,2,3,4,5]],"expect":[5,4,3,2,1]},
    {"args":[[1,2]],"expect":[2,1]},
    {"args":[[]],"expect":[]}
  ]
}
```

## Merge Two Sorted Lists
difficulty: easy
faq: true
tags: linked-list, recursion, two-pointers

### Question
Given the heads of two sorted linked lists `list1` and `list2`, merge them into one sorted list by splicing together their nodes, and return its head.

**Example:** `1 → 2 → 4` and `1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`.

### Answer
Use a **dummy head** and a `tail` pointer. Repeatedly attach the smaller of the two current nodes to `tail` and advance that list. When one list runs out, attach the remainder of the other.

### Explanation
1. `dummy = new ListNode()`, `tail = dummy`.
2. While both lists are non-empty: link `tail.next` to the smaller head, advance that head and `tail`.
3. `tail.next = list1 ?? list2` — the rest is already sorted.
4. Return `dummy.next`.

The dummy node removes the special case of choosing the first head. No new nodes are created, so space is O(1).

### Solution
type: brute
name: Collect values, sort, rebuild
time: O((m + n) log(m + n))
space: O(m + n)

```javascript
function mergeTwoLists(list1, list2) {
  const values = [];
  for (let n = list1; n; n = n.next) values.push(n.val);
  for (let n = list2; n; n = n.next) values.push(n.val);
  values.sort((a, b) => a - b);
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of values) tail = tail.next = new ListNode(v);
  return dummy.next;
}
```

```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    List<Integer> values = new ArrayList<>();
    for (ListNode n = list1; n != null; n = n.next) values.add(n.val);
    for (ListNode n = list2; n != null; n = n.next) values.add(n.val);
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
def merge_two_lists(list1, list2):
    values = []
    for node in (list1, list2):
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
name: Iterative merge with a dummy head
time: O(m + n)
space: O(1)

```javascript
function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}
```

```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(), tail = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            tail.next = list1;
            list1 = list1.next;
        } else {
            tail.next = list2;
            list2 = list2.next;
        }
        tail = tail.next;
    }
    tail.next = list1 != null ? list1 : list2;
    return dummy.next;
}
```

```python
def merge_two_lists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next
```

### Solution
type: alternate
name: Recursive merge
time: O(m + n)
space: O(m + n) recursion stack

```javascript
function mergeTwoLists(list1, list2) {
  if (!list1) return list2;
  if (!list2) return list1;
  if (list1.val <= list2.val) {
    list1.next = mergeTwoLists(list1.next, list2);
    return list1;
  }
  list2.next = mergeTwoLists(list1, list2.next);
  return list2;
}
```

```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    if (list1 == null) return list2;
    if (list2 == null) return list1;
    if (list1.val <= list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    }
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
}
```

```python
def merge_two_lists(list1, list2):
    if not list1:
        return list2
    if not list2:
        return list1
    if list1.val <= list2.val:
        list1.next = merge_two_lists(list1.next, list2)
        return list1
    list2.next = merge_two_lists(list1, list2.next)
    return list2
```

### Tests

```json
{
  "fn": "mergeTwoLists",
  "opts": {"in":["list","list"],"out":"list"},
  "cases": [
    {"args":[[1,2,4],[1,3,4]],"expect":[1,1,2,3,4,4]},
    {"args":[[],[]],"expect":[]},
    {"args":[[],[0]],"expect":[0]}
  ]
}
```

## Linked List Cycle
difficulty: easy
faq: true
tags: linked-list, two-pointers, floyd

### Question
Given `head`, the head of a linked list, determine whether the list contains a cycle — i.e. some node can be reached again by continuously following `next`.

**Example:** `3 → 2 → 0 → -4 → (back to 2)` → `true`; `1 → 2` → `false`.

### Answer
**Floyd's tortoise and hare:** move a `slow` pointer one step and a `fast` pointer two steps at a time. If there's a cycle, `fast` eventually laps `slow` and they meet; if `fast` reaches the end, there's no cycle.

### Explanation
Once both pointers are inside a cycle, the gap between them shrinks by exactly one node per step (fast gains one step on slow), so they must meet within one lap — no chance of "jumping over".

1. `slow = fast = head`.
2. While `fast && fast.next`: `slow = slow.next`, `fast = fast.next.next`; if `slow === fast`, return `true`.
3. Return `false`.

O(1) space, versus O(n) for remembering visited nodes in a set.

### Solution
type: brute
name: Remember visited nodes
time: O(n)
space: O(n)

```javascript
function hasCycle(head) {
  const seen = new Set();
  for (let node = head; node; node = node.next) {
    if (seen.has(node)) return true;
    seen.add(node);
  }
  return false;
}
```

```java
public boolean hasCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    for (ListNode node = head; node != null; node = node.next) {
        if (!seen.add(node)) return true;
    }
    return false;
}
```

```python
def has_cycle(head):
    seen = set()
    node = head
    while node:
        if node in seen:
            return True
        seen.add(node)
        node = node.next
    return False
```

### Solution
type: optimal
name: Floyd's fast and slow pointers
time: O(n)
space: O(1)

```javascript
function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

```java
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
```

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

### Tests

```json
{
  "fn": "hasCycle",
  "opts": {"in":["cycle"]},
  "cases": [
    {"args":[[[3,2,0,-4],1]],"expect":true},
    {"args":[[[1,2],0]],"expect":true},
    {"args":[[[1],-1]],"expect":false},
    {"args":[[[],-1]],"expect":false},
    {"args":[[[1],0]],"expect":true}
  ]
}
```

## Remove Nth Node From End of List
difficulty: medium
faq: true
tags: linked-list, two-pointers

### Question
Given the `head` of a linked list, remove the `n`-th node from the end of the list and return its head. `n` is always valid.

**Example:** `1 → 2 → 3 → 4 → 5`, `n = 2` → `1 → 2 → 3 → 5`.

### Answer
Put two pointers `n` nodes apart, starting from a dummy node before the head. Advance both until the leading pointer hits the last node; the trailing pointer is then just before the node to remove, so skip it with `slow.next = slow.next.next`.

### Explanation
1. `dummy.next = head`; `fast = slow = dummy`.
2. Move `fast` forward `n` steps.
3. Move both until `fast.next` is null. The gap of `n` nodes means `slow.next` is the `n`-th node from the end.
4. `slow.next = slow.next.next`; return `dummy.next`.

The dummy node handles removing the head itself (when `n` equals the list length) without a special case. One pass, O(1) space.

### Solution
type: brute
name: Count the length, then remove
time: O(L) — two passes
space: O(1)

```javascript
function removeNthFromEnd(head, n) {
  let length = 0;
  for (let node = head; node; node = node.next) length++;
  const dummy = new ListNode(0, head);
  let prev = dummy;
  for (let i = 0; i < length - n; i++) prev = prev.next;
  prev.next = prev.next.next;
  return dummy.next;
}
```

```java
public ListNode removeNthFromEnd(ListNode head, int n) {
    int length = 0;
    for (ListNode node = head; node != null; node = node.next) length++;
    ListNode dummy = new ListNode(0, head), prev = dummy;
    for (int i = 0; i < length - n; i++) prev = prev.next;
    prev.next = prev.next.next;
    return dummy.next;
}
```

```python
def remove_nth_from_end(head, n):
    length = 0
    node = head
    while node:
        length += 1
        node = node.next
    dummy = ListNode(0, head)
    prev = dummy
    for _ in range(length - n):
        prev = prev.next
    prev.next = prev.next.next
    return dummy.next
```

### Solution
type: optimal
name: Two pointers n apart (one pass)
time: O(L)
space: O(1)

```javascript
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}
```

```java
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head), fast = dummy, slow = dummy;
    for (int i = 0; i < n; i++) fast = fast.next;
    while (fast.next != null) {
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}
```

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next
```

### Tests

```json
{
  "fn": "removeNthFromEnd",
  "opts": {"in":["list"],"out":"list"},
  "cases": [
    {"args":[[1,2,3,4,5],2],"expect":[1,2,3,5]},
    {"args":[[1],1],"expect":[]},
    {"args":[[1,2],1],"expect":[1]},
    {"args":[[1,2],2],"expect":[2]}
  ]
}
```

## Reorder List
difficulty: medium
faq: false
tags: linked-list, two-pointers, reversal

### Question
Given the head of a list `L0 → L1 → … → Ln-1 → Ln`, reorder it **in place** to `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`. Only node links may change, not values.

**Example:** `1 → 2 → 3 → 4 → 5` → `1 → 5 → 2 → 4 → 3`.

### Answer
Three classic steps: find the middle with fast/slow pointers, reverse the second half, then merge the two halves by alternating nodes.

### Explanation
1. **Split:** `slow`/`fast` pointers — when `fast` reaches the end, `slow` is at the end of the first half. Cut the list after `slow`.
2. **Reverse** the second half (so `Ln` comes first).
3. **Weave:** take one node from the first half, then one from the reversed second half, and repeat.

Each step is O(n) with O(1) extra space. Combining these building blocks is exactly what interviewers look for here.

### Solution
type: brute
name: Store nodes in an array, relink by index
time: O(n)
space: O(n)

```javascript
function reorderList(head) {
  const nodes = [];
  for (let node = head; node; node = node.next) nodes.push(node);
  let i = 0;
  let j = nodes.length - 1;
  while (i < j) {
    nodes[i].next = nodes[j];
    i++;
    if (i === j) break;
    nodes[j].next = nodes[i];
    j--;
  }
  if (nodes.length) nodes[i].next = null;
}
```

```java
public void reorderList(ListNode head) {
    List<ListNode> nodes = new ArrayList<>();
    for (ListNode node = head; node != null; node = node.next) nodes.add(node);
    int i = 0, j = nodes.size() - 1;
    while (i < j) {
        nodes.get(i).next = nodes.get(j);
        i++;
        if (i == j) break;
        nodes.get(j).next = nodes.get(i);
        j--;
    }
    if (!nodes.isEmpty()) nodes.get(i).next = null;
}
```

```python
def reorder_list(head):
    nodes = []
    node = head
    while node:
        nodes.append(node)
        node = node.next
    i, j = 0, len(nodes) - 1
    while i < j:
        nodes[i].next = nodes[j]
        i += 1
        if i == j:
            break
        nodes[j].next = nodes[i]
        j -= 1
    if nodes:
        nodes[i].next = None
```

### Solution
type: optimal
name: Find middle, reverse second half, weave
time: O(n)
space: O(1)

```javascript
function reorderList(head) {
  if (!head) return;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let first = head;
  second = prev;
  while (second) {
    const n1 = first.next;
    const n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
}
```

```java
public void reorderList(ListNode head) {
    if (head == null) return;
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode second = slow.next, prev = null;
    slow.next = null;
    while (second != null) {
        ListNode next = second.next;
        second.next = prev;
        prev = second;
        second = next;
    }
    ListNode first = head;
    second = prev;
    while (second != null) {
        ListNode n1 = first.next, n2 = second.next;
        first.next = second;
        second.next = n1;
        first = n1;
        second = n2;
    }
}
```

```python
def reorder_list(head):
    if not head:
        return
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    second, slow.next = slow.next, None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2
```

### Tests

```json
{
  "fn": "reorderList",
  "opts": {"in":["list"],"mutates":"list"},
  "cases": [
    {"args":[[1,2,3,4]],"expect":[1,4,2,3]},
    {"args":[[1,2,3,4,5]],"expect":[1,5,2,4,3]},
    {"args":[[1]],"expect":[1]},
    {"args":[[1,2]],"expect":[1,2]}
  ]
}
```

## Add Two Numbers
difficulty: medium
faq: true
tags: linked-list, math

### Question
Two non-negative integers are stored as linked lists in **reverse** digit order (the ones digit first). Add them and return the sum as a linked list in the same format.

**Example:** `2 → 4 → 3` (342) + `5 → 6 → 4` (465) → `7 → 0 → 8` (807).

### Answer
Add digit by digit like on paper, starting from the heads (the least significant digits), carrying `sum / 10` into the next position. Keep going while either list has digits **or** a carry remains.

### Explanation
1. `dummy`, `tail = dummy`, `carry = 0`.
2. While `l1 || l2 || carry`: `sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry`; append node `sum % 10`; `carry = floor(sum / 10)`; advance the lists.
3. Return `dummy.next`.

The final `carry` check produces the extra leading digit (e.g. `5 + 5 = 10` → `0 → 1`). Converting the lists to numbers instead would overflow for long inputs.

### Solution
type: brute
name: Convert to big integers and back
time: O(m + n)
space: O(m + n)

Works only because JavaScript `BigInt`, Java `BigInteger` and Python `int` are arbitrary precision — with fixed-width integers this overflows, which is why interviewers expect digit-by-digit addition.

```javascript
function addTwoNumbers(l1, l2) {
  const toBig = (node) => {
    let digits = '';
    for (; node; node = node.next) digits = node.val + digits;
    return BigInt(digits);
  };
  const sum = (toBig(l1) + toBig(l2)).toString();
  const dummy = new ListNode();
  let tail = dummy;
  for (let i = sum.length - 1; i >= 0; i--) tail = tail.next = new ListNode(Number(sum[i]));
  return dummy.next;
}
```

```java
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    String sum = toBig(l1).add(toBig(l2)).toString();
    ListNode dummy = new ListNode(), tail = dummy;
    for (int i = sum.length() - 1; i >= 0; i--) {
        tail.next = new ListNode(sum.charAt(i) - '0');
        tail = tail.next;
    }
    return dummy.next;
}

private java.math.BigInteger toBig(ListNode node) {
    StringBuilder digits = new StringBuilder();
    for (; node != null; node = node.next) digits.append(node.val);
    return new java.math.BigInteger(digits.reverse().toString());
}
```

```python
def add_two_numbers(l1, l2):
    def to_int(node):
        digits = []
        while node:
            digits.append(str(node.val))
            node = node.next
        return int("".join(reversed(digits)))

    total = str(to_int(l1) + to_int(l2))
    dummy = tail = ListNode()
    for ch in reversed(total):
        tail.next = ListNode(int(ch))
        tail = tail.next
    return dummy.next
```

### Solution
type: optimal
name: Digit-by-digit addition with carry
time: O(max(m, n))
space: O(1) extra (output list excluded)

```javascript
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy;
  let carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    tail = tail.next = new ListNode(sum % 10);
    carry = Math.floor(sum / 10);
    l1 = l1 && l1.next;
    l2 = l2 && l2.next;
  }
  return dummy.next;
}
```

```java
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(), tail = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int sum = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry;
        tail.next = new ListNode(sum % 10);
        tail = tail.next;
        carry = sum / 10;
        if (l1 != null) l1 = l1.next;
        if (l2 != null) l2 = l2.next;
    }
    return dummy.next;
}
```

```python
def add_two_numbers(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
        tail.next = ListNode(total % 10)
        tail = tail.next
        carry = total // 10
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next
```

### Tests

```json
{
  "fn": "addTwoNumbers",
  "opts": {"in":["list","list"],"out":"list"},
  "cases": [
    {"args":[[2,4,3],[5,6,4]],"expect":[7,0,8]},
    {"args":[[0],[0]],"expect":[0]},
    {"args":[[9,9,9,9,9,9,9],[9,9,9,9]],"expect":[8,9,9,9,0,0,0,1]}
  ]
}
```

## Middle of the Linked List
difficulty: easy
faq: false
tags: linked-list, two-pointers

### Question
Given the `head` of a singly linked list, return the middle node. If there are two middle nodes, return the **second** one.

**Example:** `1 → 2 → 3 → 4 → 5` → node `3`; `1 → 2 → 3 → 4 → 5 → 6` → node `4`.

### Answer
Move `slow` one step and `fast` two steps at a time. When `fast` reaches the end, `slow` is at the middle.

### Explanation
`fast` covers twice the distance of `slow`, so when `fast` has walked the whole list, `slow` has walked half of it.

Loop while `fast && fast.next`. For even lengths, this stops with `slow` on the second middle node, as required. (Looping while `fast.next && fast.next.next` would give the *first* middle instead — a useful variant for splitting lists, as in *Reorder List*.)

### Solution
type: brute
name: Count, then walk to the middle
time: O(n) — two passes
space: O(1)

```javascript
function middleNode(head) {
  let length = 0;
  for (let node = head; node; node = node.next) length++;
  let node = head;
  for (let i = 0; i < Math.floor(length / 2); i++) node = node.next;
  return node;
}
```

```java
public ListNode middleNode(ListNode head) {
    int length = 0;
    for (ListNode node = head; node != null; node = node.next) length++;
    ListNode node = head;
    for (int i = 0; i < length / 2; i++) node = node.next;
    return node;
}
```

```python
def middle_node(head):
    length = 0
    node = head
    while node:
        length += 1
        node = node.next
    node = head
    for _ in range(length // 2):
        node = node.next
    return node
```

### Solution
type: optimal
name: Fast and slow pointers
time: O(n)
space: O(1)

```javascript
function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
```

```java
public ListNode middleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
```

```python
def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

### Tests

```json
{
  "fn": "middleNode",
  "opts": {"in":["list"],"out":"list"},
  "cases": [
    {"args":[[1,2,3,4,5]],"expect":[3,4,5]},
    {"args":[[1,2,3,4,5,6]],"expect":[4,5,6]},
    {"args":[[1]],"expect":[1]}
  ]
}
```

## Intersection of Two Linked Lists
difficulty: easy
faq: false
tags: linked-list, two-pointers, hash-set

### Question
Given the heads of two singly linked lists `headA` and `headB`, return the node at which they intersect (the first node they **share**), or `null` if they don't intersect. The lists contain no cycles and must keep their structure.

**Example:** `A: 4 → 1 ↘` and `B: 5 → 6 → 1 ↘` both continuing into shared `8 → 4 → 5` → the node `8`.

### Answer
Walk two pointers, one per list. When a pointer reaches the end of its list, redirect it to the head of the **other** list. Both pointers then travel `lenA + lenB` steps in total, so they line up and meet at the intersection — or both reach `null` together if there is none.

### Explanation
Say A has `a` unique nodes, B has `b`, and they share `c`. Pointer 1 walks `a + c` then `b`; pointer 2 walks `b + c` then `a`. After `a + b + c` steps both are at the start of the shared part.

If there's no intersection (`c = 0`), both reach `null` after `a + b` steps and the loop ends, returning `null`. Note that intersection means the **same node object**, not equal values.

### Solution
type: brute
name: Hash set of A's nodes
time: O(m + n)
space: O(m)

```javascript
function getIntersectionNode(headA, headB) {
  const seen = new Set();
  for (let node = headA; node; node = node.next) seen.add(node);
  for (let node = headB; node; node = node.next) {
    if (seen.has(node)) return node;
  }
  return null;
}
```

```java
public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    Set<ListNode> seen = new HashSet<>();
    for (ListNode node = headA; node != null; node = node.next) seen.add(node);
    for (ListNode node = headB; node != null; node = node.next) {
        if (seen.contains(node)) return node;
    }
    return null;
}
```

```python
def get_intersection_node(head_a, head_b):
    seen = set()
    node = head_a
    while node:
        seen.add(node)
        node = node.next
    node = head_b
    while node:
        if node in seen:
            return node
        node = node.next
    return None
```

### Solution
type: optimal
name: Two pointers that switch lists
time: O(m + n)
space: O(1)

```javascript
function getIntersectionNode(headA, headB) {
  let a = headA;
  let b = headB;
  while (a !== b) {
    a = a ? a.next : headB;
    b = b ? b.next : headA;
  }
  return a;
}
```

```java
public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    ListNode a = headA, b = headB;
    while (a != b) {
        a = a != null ? a.next : headB;
        b = b != null ? b.next : headA;
    }
    return a;
}
```

```python
def get_intersection_node(head_a, head_b):
    a, b = head_a, head_b
    while a is not b:
        a = a.next if a else head_b
        b = b.next if b else head_a
    return a
```

### Tests

```json
{
  "fn": "getIntersectionNode",
  "py": "get_intersection_node",
  "opts": {"intersect":true},
  "cases": [
    {"args":[[4,1],[5,6,1],[8,4,5]],"expect":8},
    {"args":[[2,6,4],[1,5],[]],"expect":null},
    {"args":[[],[3],[2,4]],"expect":2}
  ]
}
```

## LRU Cache
difficulty: medium
faq: true
tags: linked-list, hash-map, design

### Question
Design a Least Recently Used cache with a fixed `capacity`:

- `get(key)` returns the value if present (and marks it most recently used), otherwise `-1`.
- `put(key, value)` inserts or updates the key (marking it most recently used). If this exceeds `capacity`, evict the **least recently used** key.

Both operations must run in **O(1)** average time.

**Example:** capacity 2: `put(1,1)`, `put(2,2)`, `get(1)` → `1`, `put(3,3)` (evicts 2), `get(2)` → `-1`.

### Answer
Combine a **hash map** (key → node) with a **doubly linked list** ordered by recency. The map finds a node in O(1); the list moves it to the front or removes the tail in O(1) because each node knows both neighbours.

### Explanation
- Keep sentinel `head` and `tail` nodes so there are no empty-list edge cases. Most recent sits right after `head`, least recent right before `tail`.
- `get(key)`: look up the node; if found, unlink it and re-insert it after `head`; return its value.
- `put(key, value)`: if the key exists, update and move it to the front. Otherwise create a node, insert it at the front and add it to the map; if the size exceeds `capacity`, remove the node before `tail` and delete its key from the map.

The node must store its key, so eviction can remove the map entry. Many languages ship this combination: `LinkedHashMap` (Java), `OrderedDict` (Python), and insertion-ordered `Map` (JavaScript).

### Solution
type: brute
name: Array ordered by recency
time: O(n) per operation
space: O(capacity)

Keep `[key, value]` pairs in an array, most recent last. Finding and moving an entry requires a linear scan.

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.entries = []; // [key, value], least recent first
  }
  get(key) {
    const i = this.entries.findIndex(([k]) => k === key);
    if (i === -1) return -1;
    const [entry] = this.entries.splice(i, 1);
    this.entries.push(entry);
    return entry[1];
  }
  put(key, value) {
    const i = this.entries.findIndex(([k]) => k === key);
    if (i !== -1) this.entries.splice(i, 1);
    this.entries.push([key, value]);
    if (this.entries.length > this.capacity) this.entries.shift();
  }
}
```

```java
class LRUCache {
    private final int capacity;
    private final List<int[]> entries = new ArrayList<>(); // {key, value}, least recent first

    public LRUCache(int capacity) { this.capacity = capacity; }

    public int get(int key) {
        for (int i = 0; i < entries.size(); i++) {
            if (entries.get(i)[0] == key) {
                int[] entry = entries.remove(i);
                entries.add(entry);
                return entry[1];
            }
        }
        return -1;
    }

    public void put(int key, int value) {
        entries.removeIf(e -> e[0] == key);
        entries.add(new int[] {key, value});
        if (entries.size() > capacity) entries.remove(0);
    }
}
```

```python
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.entries = []  # [key, value], least recent first

    def get(self, key):
        for i, (k, v) in enumerate(self.entries):
            if k == key:
                self.entries.append(self.entries.pop(i))
                return v
        return -1

    def put(self, key, value):
        self.entries = [e for e in self.entries if e[0] != key]
        self.entries.append([key, value])
        if len(self.entries) > self.capacity:
            self.entries.pop(0)
```

### Solution
type: optimal
name: Hash map + doubly linked list
time: O(1) per operation
space: O(capacity)

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, val: null, prev: null, next: null };
    this.tail = { key: null, val: null, prev: this.head, next: null };
    this.head.next = this.tail;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  addFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node);
    this.addFront(node);
    return node.val;
  }
  put(key, value) {
    let node = this.map.get(key);
    if (node) {
      node.val = value;
      this.remove(node);
    } else {
      node = { key, val: value, prev: null, next: null };
      this.map.set(key, node);
    }
    this.addFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}
```

```java
class LRUCache {
    private static class DNode {
        int key, val;
        DNode prev, next;
        DNode(int key, int val) { this.key = key; this.val = val; }
    }

    private final int capacity;
    private final Map<Integer, DNode> map = new HashMap<>();
    private final DNode head = new DNode(0, 0), tail = new DNode(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(DNode node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFront(DNode node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        DNode node = map.get(key);
        if (node == null) return -1;
        remove(node);
        addFront(node);
        return node.val;
    }

    public void put(int key, int value) {
        DNode node = map.get(key);
        if (node != null) {
            node.val = value;
            remove(node);
        } else {
            node = new DNode(key, value);
            map.put(key, node);
        }
        addFront(node);
        if (map.size() > capacity) {
            DNode lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}
```

```python
class _Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head, self.tail = _Node(), _Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if not node:
            return -1
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        node = self.map.get(key)
        if node:
            node.val = value
            self._remove(node)
        else:
            node = _Node(key, value)
            self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]
```

### Solution
type: alternate
name: Built-in ordered map
time: O(1) per operation
space: O(capacity)

Each language's insertion-ordered map already is "hash map + linked list". Worth mentioning in an interview — but expect to be asked to build the manual version too.

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // iterates in insertion order: oldest first
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value);
  }
}
```

```java
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true: get() moves an entry to the end
        this.capacity = capacity;
    }

    public int get(int key) { return super.getOrDefault(key, -1); }

    public void put(int key, int value) { super.put(key, value); }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}
```

```python
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
```

### Tests

```json
{
  "cls": "LRUCache",
  "cases": [
    {"args":[["new",2],["put",1,1],["put",2,2],["get",1],["put",3,3],["get",2],["put",4,4],["get",1],["get",3],["get",4]],"expect":[null,null,null,1,null,-1,null,-1,3,4]},
    {"args":[["new",2],["put",2,1],["put",2,2],["get",2],["put",1,1],["put",4,1],["get",2]],"expect":[null,null,null,2,null,null,-1]},
    {"args":[["new",1],["put",2,1],["get",2],["put",3,2],["get",2],["get",3]],"expect":[null,null,1,null,-1,2]}
  ]
}
```
