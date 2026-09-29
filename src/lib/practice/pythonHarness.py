"""
Runs Python practice code against a problem's test cases. Loaded into Pyodide inside a
Web Worker (see pythonRunner.worker.ts), which calls run_practice().

Mirrors jsHarness.ts: both must convert inputs, outputs and normalisers the same way
(and match the types validated by scripts/generate-dsa-seed.mjs).
"""

import copy
import json
import sys
import traceback

sys.setrecursionlimit(3000)


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def _to_list(values):
    dummy = tail = ListNode()
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def _from_list(head):
    if not isinstance(head, ListNode):
        return head if head is not None else []
    out = []
    while head is not None and len(out) < 10_000:  # cap so a cyclic result can't hang
        out.append(head.val)
        head = head.next
    return out


def _to_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i, q = 1, 0
    while q < len(queue) and i < len(values):
        node = queue[q]
        q += 1
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root


def _from_tree(root):
    if root is not None and not isinstance(root, TreeNode):
        return root
    out = []
    queue = [root]
    q = 0
    while q < len(queue) and len(out) < 100_000:
        node = queue[q]
        q += 1
        if node is not None:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out


def _to_cycle(arg):
    values, pos = arg
    head = _to_list(values)
    if head is not None and pos >= 0:
        tail, target, i = head, head, 0
        while tail.next is not None:
            if i == pos:
                target = tail
            tail = tail.next
            i += 1
        if pos == len(values) - 1:
            target = tail
        tail.next = target
    return head


def _to_graph(adjacency):
    if not adjacency:
        return None
    nodes = [Node(i + 1) for i in range(len(adjacency))]
    for i, neighbors in enumerate(adjacency):
        nodes[i].neighbors = [nodes[v - 1] for v in neighbors]
    return nodes[0]


def _from_graph(node):
    if not isinstance(node, Node):
        return node if node is not None else []
    seen = {node.val: node}
    queue = [node]
    q = 0
    while q < len(queue):
        for nxt in queue[q].neighbors or []:
            if nxt is not None and nxt.val not in seen:
                seen[nxt.val] = nxt
                queue.append(nxt)
        q += 1
    return [[n.val for n in (seen[v].neighbors or [])] for v in sorted(seen)]


IN = {
    "list": _to_list,
    "tree": _to_tree,
    "cycle": _to_cycle,
    "node": lambda v: TreeNode(v),
    "lists": lambda v: [_to_list(x) for x in v],
    "graph": _to_graph,
}

OUT = {
    "list": _from_list,
    "tree": _from_tree,
    "val": lambda v: getattr(v, "val", None),
    "graph": _from_graph,
    "self": lambda v: v,
}


def _key(value):
    return json.dumps(value, separators=(",", ":"), sort_keys=True)


def _sort_deep(value):
    return sorted((_sort_deep(v) for v in value), key=_key) if isinstance(value, list) else value


def _as_list(value):
    return value if isinstance(value, list) else [value]


NORMS = {
    "sortDeep": _sort_deep,
    "sortOuter": lambda v: sorted(_as_list(v), key=_key),
    "sortFlat": lambda v: sorted(_as_list(v), key=_key),
    "sortInner": lambda v: [sorted(_as_list(row), key=_key) for row in _as_list(v)],
    "palin": lambda v: [len(v), v == v[::-1]] if isinstance(v, str) else v,
}


def _plain(value):
    """Converts a result into JSON data: tuples/sets → lists, integral floats → ints, objects → repr."""

    def convert(v, depth=0):
        if depth > 200:
            return "…"
        if isinstance(v, float):
            if v != v or v in (float("inf"), float("-inf")):
                return str(v)
            return int(v) if v.is_integer() else v
        if isinstance(v, (bool, int, str)) or v is None:
            return v
        if isinstance(v, (list, tuple)):
            return [convert(x, depth + 1) for x in v]
        if isinstance(v, (set, frozenset)):
            return sorted((convert(x, depth + 1) for x in v), key=_key)
        if isinstance(v, dict):
            return {str(k): convert(x, depth + 1) for k, x in v.items()}
        return repr(v)

    return convert(value)


def _snake(name):
    return "".join("_" + c.lower() if c.isupper() else c for c in name)


def _describe(error):
    return "".join(traceback.format_exception_only(type(error), error)).strip()


def _load(code, name):
    namespace = {"ListNode": ListNode, "TreeNode": TreeNode, "Node": Node, "__name__": "solution"}
    exec(compile(code, "solution.py", "exec"), namespace)
    return namespace.get(name)


def _run_case(entry, spec, raw_args):
    opts = spec.get("opts") or {}
    args = copy.deepcopy(raw_args)

    if spec.get("cls"):
        instance = None
        out = []
        for op in args:
            name, op_args = op[0], op[1:]
            if name == "new":
                instance = entry(*op_args)
                out.append(None)
            else:
                if instance is None:
                    raise RuntimeError("The first operation must construct the class")
                out.append(getattr(instance, _snake(name))(*op_args))
        return out

    if opts.get("intersect"):
        a, b, shared = args
        tail = _to_list(shared)

        def join(values):
            head = _to_list(values)
            if head is None:
                return tail
            node = head
            while node.next is not None:
                node = node.next
            node.next = tail
            return head

        return OUT["val"](entry(join(a), join(b)))

    types = opts.get("in") or []
    args = [IN[types[i]](a) if i < len(types) and types[i] else a for i, a in enumerate(args)]
    out = entry(*args)
    if opts.get("mutates"):
        return OUT[opts["mutates"]](args[0])
    if opts.get("prefix"):
        return [out, args[0][:out]]
    return OUT[opts["out"]](out) if opts.get("out") else out


def run_practice(code, spec_json, cases_json, reference_code=None):
    spec = json.loads(spec_json)
    cases = json.loads(cases_json)
    is_class = bool(spec.get("cls"))
    name = spec["cls"] if is_class else spec.get("py") or _snake(spec["fn"])

    try:
        entry = _load(code, name)
    except BaseException as error:  # SyntaxError, NameError at import time, ...
        return json.dumps({"error": _describe(error), "cases": []})
    if not callable(entry):
        kind = "class" if is_class else "function"
        return json.dumps({"error": f'Expected a {kind} named "{name}" — keep the starter signature.', "cases": []})

    reference = None
    if reference_code and any("expect" not in c for c in cases):
        try:
            reference = _load(reference_code, name)
        except BaseException:
            reference = None

    norm_name = (spec.get("opts") or {}).get("norm")
    norm = NORMS[norm_name] if norm_name else (lambda v: v)
    results = []
    for case in cases:
        result = {"input": case["args"]}
        has_expected = "expect" in case
        if has_expected:
            result["expected"] = case["expect"]
        elif callable(reference):
            try:
                result["expected"] = _plain(_run_case(reference, spec, case["args"]))
                has_expected = True
            except BaseException as error:
                result["expected"] = f"Reference solution failed: {_describe(error)} — check the input format."
        try:
            result["actual"] = _plain(_run_case(entry, spec, case["args"]))
        except RecursionError:
            result["error"] = "RecursionError: maximum recursion depth exceeded"
        except BaseException as error:
            result["error"] = _describe(error)
        if has_expected:
            result["passed"] = "error" not in result and _key(norm(result["actual"])) == _key(norm(result["expected"]))
        results.append(result)

    return json.dumps({"cases": results})
