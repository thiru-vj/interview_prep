-- =============================================================================
-- Interview Prep — Seed Data
-- Idempotent: safe to re-run. Languages/topics/questions are upserted by their
-- unique slug, so re-running this script updates existing content in place
-- instead of creating duplicates.
-- Run this AFTER schema.sql.
-- =============================================================================

-- =============================================================================
-- Languages
-- =============================================================================
insert into public.languages (name, slug, description, icon, display_order)
values
  ('Java', 'java', 'Practice Core Java, OOP, Collections, exception handling, multithreading and modern Java interview questions.', 'coffee', 1),
  ('JavaScript', 'javascript', 'Practice JavaScript fundamentals, functions, objects, async programming and ES6+ interview questions.', 'file-code-2', 2),
  ('React', 'react', 'Practice React fundamentals, components, hooks, state management and performance interview questions.', 'atom', 3),
  ('SQL', 'sql', 'Practice SQL joins, aggregations, subqueries, CTEs, window functions and transaction interview questions.', 'database', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order;

-- =============================================================================
-- Topics
-- =============================================================================
insert into public.topics (language_id, name, slug, description, display_order)
select l.id, v.name, v.slug, v.description, v.display_order
from (values
  ('java', 'Core Java', 'core-java', 'Language basics, data types and core syntax.', 1),
  ('java', 'OOP', 'oop', 'Object-oriented programming principles in Java.', 2),
  ('java', 'Collections', 'collections', 'The Java Collections Framework.', 3),
  ('java', 'Exception Handling', 'exceptions', 'Handling errors and exceptions in Java.', 4),
  ('java', 'Multithreading', 'multithreading', 'Concurrency and multithreading in Java.', 5),
  ('java', 'Java 8+', 'java-8', 'Lambdas, streams and modern Java features.', 6),

  ('javascript', 'Basics', 'basics', 'Core JavaScript syntax and data types.', 1),
  ('javascript', 'Functions', 'functions', 'Functions, closures and scope.', 2),
  ('javascript', 'Objects', 'objects', 'Objects, prototypes and inheritance.', 3),
  ('javascript', 'Async JavaScript', 'async-javascript', 'Promises, async/await and the event loop.', 4),
  ('javascript', 'ES6+', 'es6-plus', 'Modern JavaScript syntax and features.', 5),
  ('javascript', 'DOM', 'dom', 'DOM manipulation and browser events.', 6),

  ('react', 'Fundamentals', 'fundamentals', 'Core React concepts and JSX.', 1),
  ('react', 'Components', 'components', 'Building and composing React components.', 2),
  ('react', 'Hooks', 'hooks', 'Built-in React hooks.', 3),
  ('react', 'State', 'state', 'State and data management in React.', 4),
  ('react', 'Performance', 'performance', 'Optimizing React application performance.', 5),
  ('react', 'Advanced React', 'advanced-react', 'Advanced patterns and rendering strategies.', 6),

  ('sql', 'Basics', 'basics', 'Core SQL syntax and concepts.', 1),
  ('sql', 'Joins', 'joins', 'Combining rows from multiple tables.', 2),
  ('sql', 'Aggregations', 'aggregations', 'GROUP BY and aggregate functions.', 3),
  ('sql', 'Subqueries', 'subqueries', 'Nested queries and their uses.', 4),
  ('sql', 'CTE', 'cte', 'Common Table Expressions.', 5),
  ('sql', 'Window Functions', 'window-functions', 'Analytic window functions.', 6),
  ('sql', 'Indexes', 'indexes', 'Indexing strategies and query performance.', 7),
  ('sql', 'Transactions', 'transactions', 'Transactions and ACID properties.', 8)
) as v(language_slug, name, slug, description, display_order)
join public.languages l on l.slug = v.language_slug
on conflict (language_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

-- =============================================================================
-- Questions
-- =============================================================================
insert into public.questions (
  language_id, topic_id, slug, question, answer, example, code, code_language, difficulty, tags, display_order
)
select l.id, t.id, v.slug, v.question, v.answer, v.example, v.code, v.code_language, v.difficulty, v.tags, v.display_order
from (values

-- ------------------------------------------------------------------
-- JAVA — Core Java
-- ------------------------------------------------------------------
('java','core-java','java-core-java-001',
 'What is the difference between JDK, JRE, and JVM?',
 'The JVM (Java Virtual Machine) is the runtime engine that executes Java bytecode and provides platform independence. The JRE (Java Runtime Environment) bundles the JVM with the core class libraries needed to run Java applications. The JDK (Java Development Kit) includes the JRE plus development tools such as the compiler (javac), debugger and other utilities needed to write and build Java programs.',
 'JDK = JRE + development tools. JRE = JVM + libraries.',
 null,null,'easy',ARRAY['java','basics','jvm']::text[],1),

('java','core-java','java-core-java-002',
 'What is the difference between == and .equals() in Java?',
 '== compares references for objects (whether two variables point to the same memory location) and compares values for primitives. .equals() is a method that compares the logical content/value of two objects, and its behavior depends on whether the class overrides it. For example, String overrides equals() to compare character sequences instead of references.',
 'new String("hi") == new String("hi") returns false, but .equals() returns true.',
 'String a = new String("hi");\nString b = new String("hi");\nSystem.out.println(a == b);        // false\nSystem.out.println(a.equals(b));   // true',
 'java','easy',ARRAY['java','strings']::text[],2),

('java','core-java','java-core-java-003',
 'What is the difference between String, StringBuilder, and StringBuffer?',
 'String is immutable — every modification creates a new object, which can be wasteful in loops. StringBuilder is mutable and optimized for single-threaded string manipulation. StringBuffer is also mutable but its methods are synchronized, making it thread-safe at the cost of some performance. In most modern code, StringBuilder is preferred unless multiple threads mutate the same buffer.',
 null,
 'StringBuilder sb = new StringBuilder();\nsb.append("Hello").append(" ").append("World");\nSystem.out.println(sb.toString());',
 'java','medium',ARRAY['java','strings','performance']::text[],3),

('java','core-java','java-core-java-004',
 'What is the difference between final, finally, and finalize?',
 'final is a keyword used to declare constants, prevent method overriding, or prevent class inheritance. finally is a block that always executes after a try/catch, typically used for cleanup like closing resources. finalize() is a method the garbage collector calls before reclaiming an object''s memory, though it is deprecated since Java 9 and should be avoided in favor of try-with-resources.',
 null,null,null,'medium',ARRAY['java','keywords']::text[],4),

('java','core-java','java-core-java-005',
 'What is autoboxing and unboxing in Java?',
 'Autoboxing is the automatic conversion the compiler performs from a primitive type to its corresponding wrapper object (e.g. int to Integer). Unboxing is the reverse conversion, from a wrapper object back to its primitive type. This happens implicitly when primitives and wrapper types are mixed, such as when adding a primitive int to an Integer in a collection.',
 'Integer boxed = 10; // autoboxing\nint unboxed = boxed; // unboxing',
 null,null,'easy',ARRAY['java','basics']::text[],5),

-- ------------------------------------------------------------------
-- JAVA — OOP
-- ------------------------------------------------------------------
('java','oop','java-oop-001',
 'What are the four pillars of OOP?',
 'The four pillars are encapsulation (bundling data and methods together and restricting direct access via access modifiers), abstraction (hiding implementation details and exposing only essential behavior), inheritance (allowing a class to acquire properties and behavior from a parent class), and polymorphism (allowing objects to take multiple forms, typically through method overriding and overloading).',
 null,null,null,'easy',ARRAY['java','oop']::text[],1),

('java','oop','java-oop-002',
 'What is the difference between method overloading and overriding?',
 'Overloading occurs when multiple methods in the same class share a name but differ in parameter list (number, type, or order) — it is resolved at compile time. Overriding occurs when a subclass provides a specific implementation of a method already defined in its superclass with the same signature — it is resolved at runtime based on the actual object type.',
 null,
 'class Animal {\n    void sound() { System.out.println("Animal sound"); }\n}\nclass Dog extends Animal {\n    @Override\n    void sound() { System.out.println("Bark"); } // overriding\n}',
 'java','easy',ARRAY['java','oop']::text[],2),

('java','oop','java-oop-003',
 'What is the difference between an abstract class and an interface?',
 'An abstract class can have both abstract and concrete methods, constructors, and instance fields, and a class can extend only one abstract class. An interface traditionally declares only method signatures (though it can have default and static methods since Java 8) and a class can implement multiple interfaces. Use an abstract class for closely related classes sharing implementation, and an interface to define a contract across unrelated classes.',
 null,null,null,'medium',ARRAY['java','oop']::text[],3),

('java','oop','java-oop-004',
 'What is polymorphism and how is it implemented in Java?',
 'Polymorphism means "many forms" — the ability of an object to behave differently depending on context. Java implements compile-time (static) polymorphism through method overloading, and runtime (dynamic) polymorphism through method overriding combined with upcasting, where a parent class reference points to a child class object and the JVM resolves the actual method to call at runtime.',
 'Animal a = new Dog(); a.sound(); // calls Dog''s overridden sound()',
 null,null,'medium',ARRAY['java','oop']::text[],4),

('java','oop','java-oop-005',
 'What is the difference between composition and inheritance?',
 'Inheritance models an "is-a" relationship where a subclass extends a superclass and inherits its behavior, which can lead to tight coupling and fragile hierarchies. Composition models a "has-a" relationship where a class holds a reference to another class and delegates behavior to it, which is generally more flexible. The common guideline is to "favor composition over inheritance" to keep designs loosely coupled.',
 null,null,null,'medium',ARRAY['java','oop','design']::text[],5),

-- ------------------------------------------------------------------
-- JAVA — Collections
-- ------------------------------------------------------------------
('java','collections','java-collections-001',
 'What is the difference between ArrayList and LinkedList?',
 'ArrayList is backed by a resizable array, giving O(1) random access but O(n) insertion/removal in the middle since elements must shift. LinkedList is backed by a doubly linked list, giving O(1) insertion/removal at known positions but O(n) random access since it must traverse nodes. ArrayList is usually preferred unless the workload involves frequent insertions/deletions away from the end.',
 null,null,null,'easy',ARRAY['java','collections']::text[],1),

('java','collections','java-collections-002',
 'What is the difference between HashMap and Hashtable?',
 'HashMap is not synchronized and allows one null key and multiple null values, making it faster but not thread-safe. Hashtable is synchronized (thread-safe) and does not allow null keys or values. In modern code, ConcurrentHashMap is generally preferred over Hashtable when thread safety is required, since it offers better concurrency.',
 null,null,null,'medium',ARRAY['java','collections','concurrency']::text[],2),

('java','collections','java-collections-003',
 'How does HashMap work internally?',
 'HashMap stores entries in an array of buckets. When a key is put, its hashCode() is computed and mapped to a bucket index. If multiple keys hash to the same bucket (a collision), entries are stored as a linked list within that bucket, or as a balanced tree if the bucket grows beyond a threshold (since Java 8, for performance). Looking up a value hashes the key, finds the bucket, then uses equals() to locate the matching entry.',
 null,null,null,'hard',ARRAY['java','collections','hashmap']::text[],3),

('java','collections','java-collections-004',
 'What is the difference between Comparable and Comparator?',
 'Comparable is implemented by the class itself to define its "natural ordering" via a single compareTo() method. Comparator is a separate class that defines custom ordering logic via compare(), letting you sort the same objects in multiple different ways without modifying the original class.',
 null,
 'class Employee implements Comparable<Employee> {\n    int salary;\n    public int compareTo(Employee other) {\n        return this.salary - other.salary;\n    }\n}',
 'java','medium',ARRAY['java','collections','sorting']::text[],4),

('java','collections','java-collections-005',
 'What is the difference between HashSet, LinkedHashSet, and TreeSet?',
 'HashSet stores unique elements with no guaranteed order and offers O(1) average add/contains. LinkedHashSet maintains insertion order while still preventing duplicates. TreeSet stores elements in sorted order (natural ordering or a supplied Comparator) using a red-black tree, giving O(log n) operations.',
 null,null,null,'medium',ARRAY['java','collections']::text[],5),

-- ------------------------------------------------------------------
-- JAVA — Exception Handling
-- ------------------------------------------------------------------
('java','exceptions','java-exceptions-001',
 'What is the difference between checked and unchecked exceptions?',
 'Checked exceptions (like IOException) are checked at compile time — a method must either handle them with try/catch or declare them with throws. Unchecked exceptions (like NullPointerException) extend RuntimeException and are not checked at compile time; they usually indicate programming bugs rather than recoverable conditions.',
 null,null,null,'easy',ARRAY['java','exceptions']::text[],1),

('java','exceptions','java-exceptions-002',
 'What is the purpose of try-with-resources?',
 'try-with-resources automatically closes any resource that implements AutoCloseable (such as streams or database connections) once the try block finishes, even if an exception occurs. It removes the need for a manual finally block to close resources and helps prevent resource leaks.',
 null,
 'try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {\n    System.out.println(reader.readLine());\n} // reader is closed automatically',
 'java','medium',ARRAY['java','exceptions']::text[],2),

('java','exceptions','java-exceptions-003',
 'What is the difference between throw and throws?',
 'throw is used inside a method body to actually raise an exception instance at a specific point. throws is used in a method signature to declare that the method might propagate one or more checked exceptions to its caller, without handling them itself.',
 'void readFile() throws IOException {\n    throw new IOException("File not found");\n}',
 null,null,'easy',ARRAY['java','exceptions']::text[],3),

('java','exceptions','java-exceptions-004',
 'Can you have a try block without a catch block?',
 'Yes. A try block can be paired with just a finally block (no catch) if you only need guaranteed cleanup code without handling the exception locally — the exception still propagates to the caller. Similarly, try-with-resources does not require a catch block since the resource closing itself is the point.',
 null,null,null,'easy',ARRAY['java','exceptions']::text[],4),

('java','exceptions','java-exceptions-005',
 'What happens if an exception is thrown in a finally block?',
 'If a finally block itself throws an exception, it suppresses any exception that was already propagating from the try or catch block — the new exception from finally becomes the one visible to the caller, and the original is lost (unless explicitly captured as a suppressed exception). This is why finally blocks should generally avoid code that can throw.',
 null,null,null,'medium',ARRAY['java','exceptions']::text[],5),

-- ------------------------------------------------------------------
-- JAVA — Multithreading
-- ------------------------------------------------------------------
('java','multithreading','java-multithreading-001',
 'What is the difference between a process and a thread?',
 'A process is an independent program running in its own memory space with its own resources. A thread is a lightweight unit of execution within a process; multiple threads in the same process share the same memory space (heap) but have their own stack, making inter-thread communication faster but requiring careful synchronization.',
 null,null,null,'easy',ARRAY['java','multithreading']::text[],1),

('java','multithreading','java-multithreading-002',
 'What is the difference between a synchronized method and a synchronized block?',
 'A synchronized method locks the entire method using the object''s (or class''s, for static methods) intrinsic lock for its whole duration. A synchronized block lets you lock only the critical section of code and choose the lock object explicitly, which reduces contention and improves performance by keeping the locked region as small as possible.',
 null,
 'public void increment() {\n    synchronized (this) {\n        count++;\n    }\n}',
 'java','medium',ARRAY['java','multithreading','concurrency']::text[],2),

('java','multithreading','java-multithreading-003',
 'What is the difference between wait() and sleep()?',
 'wait() is defined on Object, must be called within a synchronized block, and releases the lock it holds while the thread waits until notified. sleep() is a static Thread method that pauses the current thread for a fixed time without releasing any locks it holds. wait() is used for inter-thread communication; sleep() is simply used to pause execution.',
 null,null,null,'medium',ARRAY['java','multithreading']::text[],3),

('java','multithreading','java-multithreading-004',
 'What is a deadlock and how can it be avoided?',
 'A deadlock occurs when two or more threads are blocked forever, each waiting for a lock the other holds — for example, Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1. Deadlocks can be avoided by always acquiring locks in a consistent global order, using timeouts (tryLock), minimizing the scope of locks, or using higher-level concurrency utilities instead of manual locking.',
 null,null,null,'hard',ARRAY['java','multithreading','concurrency']::text[],4),

('java','multithreading','java-multithreading-005',
 'What is the Java Memory Model and why does volatile matter?',
 'The Java Memory Model (JMM) defines how and when changes made by one thread to shared variables become visible to other threads, since each thread may cache variables locally for performance. Declaring a variable volatile ensures that every read sees the most recently written value and prevents certain compiler/CPU reorderings, which is essential for correctness in lock-free, multi-threaded code — though it does not provide atomicity for compound operations like increment.',
 null,null,null,'hard',ARRAY['java','multithreading','jmm']::text[],5),

-- ------------------------------------------------------------------
-- JAVA — Java 8+
-- ------------------------------------------------------------------
('java','java-8','java-java-8-001',
 'What are lambda expressions in Java?',
 'Lambda expressions, introduced in Java 8, provide a concise syntax for implementing a functional interface (an interface with a single abstract method) without writing a full anonymous class. They enable a more functional programming style, particularly useful with the Stream API and for passing behavior as arguments.',
 null,
 'Runnable r = () -> System.out.println("Running");\nlist.forEach(item -> System.out.println(item));',
 'java','easy',ARRAY['java','java8','lambda']::text[],1),

('java','java-8','java-java-8-002',
 'What is a functional interface?',
 'A functional interface is an interface with exactly one abstract method, which makes it usable as the target type of a lambda expression or method reference. Java provides built-in ones like Runnable, Comparator, Function, Predicate and Supplier, and you can define your own using the @FunctionalInterface annotation, which lets the compiler enforce the single-abstract-method rule.',
 null,
 '@FunctionalInterface\ninterface Calculator {\n    int operate(int a, int b);\n}\nCalculator add = (a, b) -> a + b;',
 'java','medium',ARRAY['java','java8']::text[],2),

('java','java-8','java-java-8-003',
 'What is the Stream API and why is it useful?',
 'The Stream API provides a declarative way to process sequences of elements (from collections, arrays, or I/O) using operations like filter, map, reduce and collect. Streams are lazily evaluated, can be chained fluently, and can run in parallel with minimal code change, making data-processing code more concise and readable than manual loops.',
 null,
 'List<String> names = List.of("Alice", "Bob", "Charlie");\nList<String> result = names.stream()\n    .filter(n -> n.length() > 3)\n    .map(String::toUpperCase)\n    .collect(Collectors.toList());',
 'java','medium',ARRAY['java','java8','streams']::text[],3),

('java','java-8','java-java-8-004',
 'What is the difference between map() and flatMap() in streams?',
 'map() transforms each element into exactly one new element, producing a stream of the same "shape" (e.g. Stream<String> to Stream<Integer>). flatMap() transforms each element into a stream of elements and then flattens all those streams into a single stream, which is useful when each input maps to zero or more outputs, such as flattening a List<List<String>> into a single Stream<String>.',
 null,
 'List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4));\nList<Integer> flat = nested.stream()\n    .flatMap(List::stream)\n    .collect(Collectors.toList()); // [1, 2, 3, 4]',
 'java','medium',ARRAY['java','java8','streams']::text[],4),

('java','java-8','java-java-8-005',
 'What is Optional and what problem does it solve?',
 'Optional<T> is a container object introduced in Java 8 that may or may not hold a non-null value. It forces callers to explicitly handle the "value might be absent" case (via methods like isPresent(), orElse(), or map()) instead of returning null and risking a NullPointerException, making the possibility of a missing value visible in the method''s type signature.',
 null,
 'Optional<String> name = Optional.ofNullable(getName());\nString result = name.orElse("Unknown");',
 'java','medium',ARRAY['java','java8']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — Basics
-- ------------------------------------------------------------------
('javascript','basics','javascript-basics-001',
 'What are the different data types in JavaScript?',
 'JavaScript has seven primitive types — string, number, boolean, null, undefined, symbol, and bigint — plus the object type, which covers objects, arrays, and functions. Primitives are immutable and compared by value, while objects are compared by reference.',
 null,null,null,'easy',ARRAY['javascript','basics']::text[],1),

('javascript','basics','javascript-basics-002',
 'What is the difference between var, let, and const?',
 'var is function-scoped, gets hoisted and initialized as undefined, and can be redeclared. let is block-scoped, hoisted but not initialized (temporal dead zone), and can be reassigned but not redeclared in the same scope. const is also block-scoped like let, but cannot be reassigned after initialization — though objects/arrays declared with const can still have their contents mutated.',
 null,
 'let count = 1;\ncount = 2; // ok\nconst limit = 10;\nlimit = 20; // TypeError',
 'javascript','easy',ARRAY['javascript','basics','scope']::text[],2),

('javascript','basics','javascript-basics-003',
 'What is the difference between == and ===?',
 '=== is the strict equality operator — it compares both value and type without any conversion. == is the loose equality operator — it performs type coercion before comparing, which can lead to surprising results like "0" == 0 being true. Using === is generally recommended to avoid unexpected coercion bugs.',
 '"" == 0        // true (coerced)\n"" === 0       // false (different types)',
 null,null,'easy',ARRAY['javascript','basics']::text[],3),

('javascript','basics','javascript-basics-004',
 'What is hoisting in JavaScript?',
 'Hoisting is JavaScript''s behavior of moving variable and function declarations to the top of their scope during the compile phase, before code executes. Function declarations are fully hoisted (usable before their definition), var declarations are hoisted but initialized as undefined, and let/const are hoisted into a "temporal dead zone" where accessing them before declaration throws a ReferenceError.',
 'console.log(x); // undefined, not an error\nvar x = 5;',
 null,null,'medium',ARRAY['javascript','basics']::text[],4),

('javascript','basics','javascript-basics-005',
 'What is the difference between null and undefined?',
 'undefined means a variable has been declared but has not yet been assigned a value, or a function did not explicitly return anything. null is an explicit assignment representing "no value" or "empty," deliberately set by the developer. typeof undefined is "undefined", while typeof null is (famously, due to a long-standing bug) "object".',
 null,null,null,'easy',ARRAY['javascript','basics']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — Functions
-- ------------------------------------------------------------------
('javascript','functions','javascript-functions-001',
 'What is a closure in JavaScript?',
 'A closure is formed when a function "remembers" the variables from its enclosing lexical scope even after that outer function has finished executing. This lets an inner function continue to access and manipulate private variables from its outer function, which is commonly used to create private state, memoization, and factory functions.',
 null,
 'function makeCounter() {\n    let count = 0;\n    return () => ++count;\n}\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2',
 'javascript','medium',ARRAY['javascript','functions','closures']::text[],1),

('javascript','functions','javascript-functions-002',
 'What is the difference between function declaration and function expression?',
 'A function declaration (function foo() {}) is hoisted completely, so it can be called before its definition in the code. A function expression (const foo = function() {}) is assigned to a variable, and only the variable declaration is hoisted, not the function body — so calling it before the assignment throws an error.',
 null,null,null,'easy',ARRAY['javascript','functions']::text[],2),

('javascript','functions','javascript-functions-003',
 'What is the "this" keyword and how is it determined?',
 '"this" refers to the object that is currently executing the function, but its value is determined by how the function is called, not where it is defined. In a method call it is the object before the dot, in a plain function call it is undefined (in strict mode) or the global object, and arrow functions do not have their own "this" — they inherit it lexically from the enclosing scope. call, apply, and bind can also explicitly set "this".',
 null,null,null,'medium',ARRAY['javascript','functions','this']::text[],3),

('javascript','functions','javascript-functions-004',
 'What is currying in JavaScript?',
 'Currying is a technique that transforms a function taking multiple arguments into a sequence of functions that each take a single argument. This enables partial application, where you can fix some arguments early and reuse the resulting function with different remaining arguments.',
 null,
 'const add = (a) => (b) => a + b;\nconst add5 = add(5);\nadd5(3); // 8',
 'javascript','medium',ARRAY['javascript','functions','functional']::text[],4),

('javascript','functions','javascript-functions-005',
 'What is the difference between call, apply, and bind?',
 'All three let you explicitly set the value of "this" for a function. call() invokes the function immediately, passing arguments individually. apply() also invokes immediately, but takes arguments as an array. bind() does not invoke the function immediately — it returns a new function with "this" (and optionally some arguments) permanently bound, to be called later.',
 null,
 'function greet(greeting) { return `${greeting}, ${this.name}`; }\ngreet.call({name: "Amy"}, "Hi");\ngreet.apply({name: "Amy"}, ["Hi"]);\nconst bound = greet.bind({name: "Amy"});\nbound("Hi");',
 'javascript','medium',ARRAY['javascript','functions','this']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — Objects
-- ------------------------------------------------------------------
('javascript','objects','javascript-objects-001',
 'What is prototypal inheritance in JavaScript?',
 'Every JavaScript object has an internal link to another object called its prototype. When a property or method is accessed and not found on the object itself, the engine looks up the prototype chain until it finds it or reaches null. This lets objects share behavior without classical class-based inheritance, and is the mechanism underlying JavaScript''s class syntax as well.',
 null,null,null,'medium',ARRAY['javascript','objects','prototype']::text[],1),

('javascript','objects','javascript-objects-002',
 'What is the difference between shallow copy and deep copy?',
 'A shallow copy duplicates only the top-level properties of an object — nested objects are still shared by reference between the original and the copy, so mutating a nested object affects both. A deep copy recursively duplicates all nested objects/arrays so the copy is fully independent of the original. structuredClone() or JSON.parse(JSON.stringify()) are common ways to deep copy, while {...obj} or Object.assign() perform a shallow copy.',
 null,null,null,'medium',ARRAY['javascript','objects']::text[],2),

('javascript','objects','javascript-objects-003',
 'What are getters and setters in JavaScript objects?',
 'Getters and setters let you define methods that are accessed like plain properties. A getter runs custom logic when a property is read, and a setter runs custom logic when a property is assigned, which is useful for computed properties or validation without changing how consumers interact with the object.',
 null,
 'const person = {\n    firstName: "Jane",\n    get fullName() { return `${this.firstName} Doe`; }\n};\nperson.fullName; // "Jane Doe"',
 'javascript','easy',ARRAY['javascript','objects']::text[],3),

('javascript','objects','javascript-objects-004',
 'What is object destructuring?',
 'Destructuring is a syntax that lets you unpack properties from objects (or elements from arrays) into individual variables in a single, concise statement, optionally with renaming and default values.',
 'const { name, age = 18 } = user;',
 null,null,'easy',ARRAY['javascript','objects','es6']::text[],4),

('javascript','objects','javascript-objects-005',
 'What is the difference between Object.freeze() and Object.seal()?',
 'Object.freeze() makes an object fully immutable — existing properties cannot be changed, added, or removed. Object.seal() prevents adding or removing properties, but existing properties can still be modified as long as they are writable. Both only apply shallowly, so nested objects remain mutable unless frozen/sealed individually.',
 null,null,null,'medium',ARRAY['javascript','objects']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — Async JavaScript
-- ------------------------------------------------------------------
('javascript','async-javascript','javascript-async-javascript-001',
 'What is the event loop in JavaScript?',
 'JavaScript is single-threaded, so the event loop is the mechanism that lets it handle asynchronous operations without blocking. The call stack executes synchronous code; when an async operation (like a timer or network request) completes, its callback is placed in a task queue. The event loop continuously checks whether the call stack is empty, and if so, moves the next queued callback onto the stack to execute.',
 null,null,null,'hard',ARRAY['javascript','async','event-loop']::text[],1),

('javascript','async-javascript','javascript-async-javascript-002',
 'What is the difference between a Promise and a callback?',
 'A callback is simply a function passed as an argument to be invoked later, which can lead to deeply nested "callback hell" when chaining multiple async steps. A Promise is an object representing the eventual result (or failure) of an async operation, offering .then()/.catch() chaining, better error propagation, and composability through methods like Promise.all().',
 null,null,null,'medium',ARRAY['javascript','async','promises']::text[],2),

('javascript','async-javascript','javascript-async-javascript-003',
 'What is async/await and how does it relate to Promises?',
 'async/await is syntactic sugar built on top of Promises that lets asynchronous code be written and read like synchronous code. An async function always returns a Promise, and await pauses execution within that function until the awaited Promise settles, unwrapping its resolved value or throwing its rejection as a catchable error.',
 null,
 'async function getUser(id) {\n    const res = await fetch(`/api/users/${id}`);\n    return res.json();\n}',
 'javascript','medium',ARRAY['javascript','async','promises']::text[],3),

('javascript','async-javascript','javascript-async-javascript-004',
 'What is the difference between microtasks and macrotasks?',
 'Macrotasks include things like setTimeout callbacks, DOM events, and I/O — each macrotask runs to completion, then the event loop yields to rendering before the next one. Microtasks include Promise callbacks (.then/.catch/.finally) and queueMicrotask — the entire microtask queue is drained after each macrotask (and after the initial synchronous script) before the next macrotask runs, which is why Promise callbacks run before a setTimeout(fn, 0).',
 null,null,null,'hard',ARRAY['javascript','async','event-loop']::text[],4),

('javascript','async-javascript','javascript-async-javascript-005',
 'How does Promise.all differ from Promise.race and Promise.allSettled?',
 'Promise.all() resolves when all input promises resolve (returning an array of results) or rejects as soon as any one rejects. Promise.race() settles as soon as the first promise settles, whether fulfilled or rejected. Promise.allSettled() waits for every promise to settle regardless of outcome, returning an array describing each result as either fulfilled or rejected, which is useful when you need all outcomes without short-circuiting on failure.',
 null,null,null,'medium',ARRAY['javascript','async','promises']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — ES6+
-- ------------------------------------------------------------------
('javascript','es6-plus','javascript-es6-plus-001',
 'What are template literals?',
 'Template literals, delimited by backticks, allow embedded expressions via ${...} interpolation and support multi-line strings without concatenation, making string building more readable than traditional quoted strings.',
 'const greeting = `Hello, ${name}! You are ${age} years old.`;',
 null,null,'easy',ARRAY['javascript','es6']::text[],1),

('javascript','es6-plus','javascript-es6-plus-002',
 'What is the spread operator and how does it differ from rest parameters?',
 'The spread operator (...) expands an iterable (array, string, or object) into individual elements, commonly used to copy or merge arrays/objects or pass array elements as function arguments. Rest parameters use the same ... syntax but do the opposite — they collect multiple individual arguments into a single array within a function signature.',
 'const arr = [...[1,2], ...[3,4]]; // spread: [1,2,3,4]\nfunction sum(...nums) { return nums.reduce((a,b) => a+b); } // rest',
 null,null,'easy',ARRAY['javascript','es6']::text[],2),

('javascript','es6-plus','javascript-es6-plus-003',
 'What are arrow functions and how do they differ from regular functions?',
 'Arrow functions provide a shorter syntax for writing functions and do not bind their own "this", arguments, or super — they inherit these lexically from the enclosing scope, which makes them convenient for callbacks. They also cannot be used as constructors (no "new") and do not have a prototype property.',
 'const square = (x) => x * x;',
 null,null,'easy',ARRAY['javascript','es6','functions']::text[],3),

('javascript','es6-plus','javascript-es6-plus-004',
 'What are ES6 modules and how do import/export work?',
 'ES6 modules let JavaScript files share code through explicit export and import statements instead of relying on global scope. A module can have named exports (multiple per file) or a single default export, and importing code chooses which bindings to bring into its own scope. Unlike scripts, modules are automatically in strict mode and each module has its own top-level scope.',
 null,
 '// math.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// main.js\nimport multiply, { add } from "./math.js";',
 'javascript','medium',ARRAY['javascript','es6','modules']::text[],4),

('javascript','es6-plus','javascript-es6-plus-005',
 'What are default parameters in JavaScript?',
 'Default parameters let a function parameter fall back to a specified value if the caller omits the argument or passes undefined, removing the need for manual "if undefined" checks inside the function body.',
 'function greet(name = "Guest") { return `Hello, ${name}`; }\ngreet(); // "Hello, Guest"',
 null,null,'easy',ARRAY['javascript','es6','functions']::text[],5),

-- ------------------------------------------------------------------
-- JAVASCRIPT — DOM
-- ------------------------------------------------------------------
('javascript','dom','javascript-dom-001',
 'What is event delegation?',
 'Event delegation is a pattern where a single event listener is attached to a common parent element instead of individual listeners on each child. Because events bubble up the DOM, the parent''s handler can inspect event.target to determine which child triggered it. This reduces memory usage and automatically handles dynamically added children without re-attaching listeners.',
 null,
 'document.getElementById("list").addEventListener("click", (e) => {\n    if (e.target.tagName === "LI") {\n        console.log("Clicked:", e.target.textContent);\n    }\n});',
 'javascript','medium',ARRAY['javascript','dom','events']::text[],1),

('javascript','dom','javascript-dom-002',
 'What is the difference between event bubbling and event capturing?',
 'These are the two phases of DOM event propagation. In capturing, the event travels from the document root down to the target element. In bubbling, after reaching the target, the event travels back up from the target to the root. By default, addEventListener listens during the bubbling phase unless the third argument is set to true, which listens during capturing instead.',
 null,null,null,'medium',ARRAY['javascript','dom','events']::text[],2),

('javascript','dom','javascript-dom-003',
 'What is the difference between preventDefault() and stopPropagation()?',
 'preventDefault() stops the browser''s default action for an event, such as a link navigating or a form submitting, but the event still bubbles/propagates normally. stopPropagation() stops the event from continuing to bubble (or capture) to other elements, but does not prevent the browser''s default behavior for the element the event happened on. They can be used together or independently.',
 null,null,null,'medium',ARRAY['javascript','dom','events']::text[],3),

('javascript','dom','javascript-dom-004',
 'What is the difference between innerHTML and textContent?',
 'innerHTML gets or sets the HTML markup inside an element, parsing any tags it contains — which can introduce XSS risks if used with untrusted input. textContent gets or sets the raw text content only, treating everything (including tags) as plain text, which is safer and generally faster when HTML parsing is not needed.',
 null,null,null,'easy',ARRAY['javascript','dom']::text[],4),

('javascript','dom','javascript-dom-005',
 'What is debouncing and throttling?',
 'Debouncing delays invoking a function until a specified time has passed since the last time it was triggered, which is useful for things like search-input handlers where you only want to act once typing pauses. Throttling ensures a function runs at most once per specified time interval regardless of how often it is triggered, which is useful for high-frequency events like scroll or resize.',
 null,
 'function debounce(fn, delay) {\n    let timer;\n    return (...args) => {\n        clearTimeout(timer);\n        timer = setTimeout(() => fn(...args), delay);\n    };\n}',
 'javascript','medium',ARRAY['javascript','dom','performance']::text[],5),

-- ------------------------------------------------------------------
-- REACT — Fundamentals
-- ------------------------------------------------------------------
('react','fundamentals','react-fundamentals-001',
 'What is React and what problem does it solve?',
 'React is a JavaScript library for building user interfaces out of reusable components. It solves the problem of manually and inefficiently synchronizing the DOM with application state by letting developers describe what the UI should look like for a given state, while React efficiently figures out how to update the actual DOM to match.',
 null,null,null,'easy',ARRAY['react','fundamentals']::text[],1),

('react','fundamentals','react-fundamentals-002',
 'What is the virtual DOM and how does it work?',
 'The virtual DOM is a lightweight in-memory representation of the real DOM, kept as plain JavaScript objects. When state changes, React builds a new virtual DOM tree, compares ("diffs") it against the previous one, and computes the minimal set of real DOM mutations needed, then applies only those changes. This batching and minimization of direct DOM operations is what makes updates efficient.',
 null,null,null,'medium',ARRAY['react','fundamentals']::text[],2),

('react','fundamentals','react-fundamentals-003',
 'What is JSX?',
 'JSX is a syntax extension for JavaScript that lets you write HTML-like markup directly within JavaScript code. It is not valid JavaScript on its own — build tools like Babel or the Vite/SWC compiler transform it into React.createElement() calls (or the modern automatic JSX runtime) before the code runs in the browser.',
 'const element = <h1>Hello, {name}</h1>;',
 null,null,'easy',ARRAY['react','fundamentals','jsx']::text[],3),

('react','fundamentals','react-fundamentals-004',
 'What is the difference between React elements and components?',
 'A React element is a plain, immutable JavaScript object describing what should appear on screen (like {type: "h1", props: {...}}) — it is cheap to create. A component is a function (or class) that accepts props and returns elements describing the UI; components are the reusable building blocks that produce elements when rendered.',
 null,null,null,'easy',ARRAY['react','fundamentals']::text[],4),

('react','fundamentals','react-fundamentals-005',
 'What is the difference between a library and a framework, and where does React fit?',
 'A framework typically dictates the overall architecture of an application and calls your code ("inversion of control"), whereas a library is a focused tool that your code calls as needed. React is considered a library because it focuses specifically on the view layer — routing, state management, and data fetching are left to the developer''s choice of additional libraries (like React Router), rather than being built in.',
 null,null,null,'easy',ARRAY['react','fundamentals']::text[],5),

-- ------------------------------------------------------------------
-- REACT — Components
-- ------------------------------------------------------------------
('react','components','react-components-001',
 'What is the difference between functional and class components?',
 'Functional components are plain JavaScript functions that return JSX and use hooks (like useState, useEffect) to manage state and side effects. Class components extend React.Component, manage state via this.state/this.setState, and use lifecycle methods like componentDidMount. Since the introduction of hooks in React 16.8, functional components are the standard approach for new code.',
 null,null,null,'easy',ARRAY['react','components']::text[],1),

('react','components','react-components-002',
 'What are props in React?',
 'Props (short for properties) are read-only inputs passed from a parent component to a child component, similar to function arguments. They let data flow down the component tree and allow a component to be configured and reused with different values, but a child should never mutate the props it receives.',
 'function Greeting({ name }) { return <p>Hello, {name}!</p>; }\n<Greeting name="Sam" />',
 null,null,'easy',ARRAY['react','components','props']::text[],2),

('react','components','react-components-003',
 'What is prop drilling and how can it be avoided?',
 'Prop drilling happens when data must be passed down through several intermediate components that do not need it themselves, just to reach a deeply nested component that does. It can be avoided using the Context API for moderately shared data, or a dedicated state management library for larger applications, both of which let deeply nested components read data directly without every intermediate layer forwarding it.',
 null,null,null,'medium',ARRAY['react','components','context']::text[],3),

('react','components','react-components-004',
 'What is the difference between controlled and uncontrolled components?',
 'A controlled component has its form value driven entirely by React state — the input''s value comes from state and every change updates that state via onChange, making React the "single source of truth." An uncontrolled component keeps its own internal DOM state, and React reads the current value only when needed (e.g. via a ref), which is closer to traditional HTML form behavior.',
 null,
 '// Controlled\nconst [value, setValue] = useState("");\n<input value={value} onChange={(e) => setValue(e.target.value)} />',
 'jsx','medium',ARRAY['react','components','forms']::text[],4),

('react','components','react-components-005',
 'What is the significance of the key prop in lists?',
 'The key prop gives React a stable identity for each item in a list, letting it correctly match elements between renders to determine what was added, removed, or reordered. Using a stable, unique identifier (like an item ID) as the key — instead of the array index — avoids subtle bugs where component state gets mismatched to the wrong item after the list changes.',
 null,
 '{items.map(item => <li key={item.id}>{item.name}</li>)}',
 'jsx','medium',ARRAY['react','components','lists']::text[],5),

-- ------------------------------------------------------------------
-- REACT — Hooks
-- ------------------------------------------------------------------
('react','hooks','react-hooks-001',
 'What is the useState hook and how does it work?',
 'useState is a hook that adds local state to a functional component. It returns a pair — the current state value and a setter function — and calling the setter schedules a re-render with the updated value. Each call to useState is independent, and React preserves the state between renders based on the order hooks are called in.',
 null,
 'const [count, setCount] = useState(0);\n<button onClick={() => setCount(count + 1)}>{count}</button>',
 'jsx','easy',ARRAY['react','hooks','usestate']::text[],1),

('react','hooks','react-hooks-002',
 'What is the useEffect hook and when does it run?',
 'useEffect lets you run side effects (data fetching, subscriptions, manually touching the DOM) in a functional component. By default it runs after every render; passing a dependency array limits it to run only when those dependencies change, and an empty array makes it run once after the initial mount. Returning a cleanup function from the effect lets you tear down subscriptions or timers before the effect re-runs or the component unmounts.',
 null,
 'useEffect(() => {\n    const id = setInterval(() => console.log("tick"), 1000);\n    return () => clearInterval(id);\n}, []);',
 'jsx','medium',ARRAY['react','hooks','useeffect']::text[],2),

('react','hooks','react-hooks-003',
 'What is useRef used for in React?',
 'useRef returns a mutable object with a .current property that persists across renders without causing a re-render when it changes. It is commonly used to hold a direct reference to a DOM element (e.g. to call .focus()) or to store any mutable value, like a previous state or a timer ID, that should not trigger re-rendering when updated.',
 null,
 'const inputRef = useRef(null);\n<input ref={inputRef} />\ninputRef.current.focus();',
 'jsx','medium',ARRAY['react','hooks','useref']::text[],3),

('react','hooks','react-hooks-004',
 'What is the difference between useMemo and useCallback?',
 'useMemo memoizes the result of a computation, recalculating it only when its dependencies change, which is useful for avoiding expensive recalculations. useCallback memoizes the function reference itself rather than a computed value, which is useful for keeping a stable function identity across renders — for example, to prevent unnecessary re-renders of a memoized child component that receives the function as a prop.',
 null,null,null,'medium',ARRAY['react','hooks','performance']::text[],4),

('react','hooks','react-hooks-005',
 'What are the rules of hooks and why do they exist?',
 'Hooks must only be called at the top level of a function component or custom hook (never inside loops, conditions, or nested functions), and only from React function components or other custom hooks. These rules exist because React relies on the consistent call order of hooks between renders to correctly associate each hook call with its internal state — breaking the order would corrupt state tracking.',
 null,null,null,'medium',ARRAY['react','hooks']::text[],5),

-- ------------------------------------------------------------------
-- REACT — State
-- ------------------------------------------------------------------
('react','state','react-state-001',
 'What is the difference between state and props?',
 'Props are inputs passed into a component from its parent and are read-only from the receiving component''s perspective. State is data owned and managed internally by a component that can change over time, typically in response to user interaction, and updating it triggers a re-render.',
 null,null,null,'easy',ARRAY['react','state']::text[],1),

('react','state','react-state-002',
 'What is lifting state up?',
 'Lifting state up means moving shared state from a child component to their closest common ancestor, so that multiple sibling components can read and update the same data through props passed down from that ancestor. This is the standard React pattern for keeping related components in sync without duplicating state.',
 null,null,null,'medium',ARRAY['react','state']::text[],2),

('react','state','react-state-003',
 'What is the Context API and when should you use it?',
 'The Context API lets you share values (like theme, locale, or authenticated user) across a component tree without manually passing props through every level. It is best suited for data that many components at different nesting levels need, such as global UI settings — for frequently changing, high-frequency data, a dedicated state management solution is often a better fit since context updates re-render all consumers.',
 null,
 'const ThemeContext = createContext("light");\nfunction App() {\n    return (\n        <ThemeContext.Provider value="dark">\n            <Toolbar />\n        </ThemeContext.Provider>\n    );\n}',
 'jsx','medium',ARRAY['react','state','context']::text[],3),

('react','state','react-state-004',
 'What is the difference between local state and global state management?',
 'Local state lives inside a single component (via useState/useReducer) and is only relevant to that component and its children. Global state is shared and accessible across many unrelated parts of the application — managed via Context, or a dedicated library — and is appropriate when multiple distant components need to read or update the same data.',
 null,null,null,'medium',ARRAY['react','state']::text[],4),

('react','state','react-state-005',
 'Why should you avoid mutating state directly in React?',
 'React determines whether to re-render by comparing state references between renders (especially with React.memo, useMemo, and PureComponent). Mutating an object or array in place keeps the same reference, so React may not detect the change and skip a necessary re-render. Always create a new object/array (e.g. with spread syntax) when updating state so React can correctly detect the change.',
 'setItems(prev => [...prev, newItem]); // correct\n// items.push(newItem); setItems(items); // incorrect — same reference',
 null,null,'medium',ARRAY['react','state']::text[],5),

-- ------------------------------------------------------------------
-- REACT — Performance
-- ------------------------------------------------------------------
('react','performance','react-performance-001',
 'What causes unnecessary re-renders in React?',
 'Common causes include a parent re-rendering and passing new object/array/function references as props each time (even if the values are logically the same), updating context that many components consume, or state updates higher in the tree than necessary. Tools like React.memo, useMemo, and useCallback can prevent re-renders caused by unstable references, while restructuring component boundaries can limit how far a state change propagates.',
 null,null,null,'medium',ARRAY['react','performance']::text[],1),

('react','performance','react-performance-002',
 'What is React.memo and when should it be used?',
 'React.memo is a higher-order component that wraps a functional component and skips re-rendering it if its props have not changed (using a shallow comparison by default). It is most useful for components that render often with the same props and are expensive to re-render — wrapping every component in memo indiscriminately adds overhead without benefit.',
 null,
 'const ExpensiveList = React.memo(function ExpensiveList({ items }) {\n    return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n});',
 'jsx','medium',ARRAY['react','performance']::text[],2),

('react','performance','react-performance-003',
 'What is code splitting and how does React.lazy help?',
 'Code splitting breaks a large JavaScript bundle into smaller chunks that are loaded on demand rather than all at once, reducing initial load time. React.lazy() lets you define a component that is loaded via a dynamic import() only when it is actually rendered, typically paired with a Suspense boundary to show a fallback while the chunk loads.',
 null,
 'const Settings = React.lazy(() => import("./Settings"));\n<Suspense fallback={<Spinner />}>\n    <Settings />\n</Suspense>',
 'jsx','medium',ARRAY['react','performance']::text[],3),

('react','performance','react-performance-004',
 'What is virtualization/windowing and when is it needed?',
 'Virtualization renders only the list items currently visible within the scrollable viewport (plus a small buffer), instead of rendering every item in a potentially huge list. This dramatically reduces the number of DOM nodes and improves scroll performance, and is needed when rendering lists with hundreds or thousands of items, such as a chat log or data table.',
 null,null,null,'hard',ARRAY['react','performance']::text[],4),

('react','performance','react-performance-005',
 'What is the difference between reconciliation and rendering?',
 'Rendering is the process where React calls your component functions to figure out what the new virtual DOM tree should look like for the current state. Reconciliation is the subsequent "diffing" process where React compares that new tree against the previous one to determine the minimal set of real DOM operations required, which are then committed to the actual DOM.',
 null,null,null,'hard',ARRAY['react','performance','internals']::text[],5),

-- ------------------------------------------------------------------
-- REACT — Advanced React
-- ------------------------------------------------------------------
('react','advanced-react','react-advanced-react-001',
 'What are error boundaries in React?',
 'Error boundaries are components (currently must be class components) that implement componentDidCatch and/or static getDerivedStateFromError to catch JavaScript errors thrown anywhere in their child component tree during rendering, and display a fallback UI instead of crashing the whole application. They do not catch errors in event handlers, async code, or server-side rendering.',
 null,null,null,'medium',ARRAY['react','advanced']::text[],1),

('react','advanced-react','react-advanced-react-002',
 'What are React Portals used for?',
 'Portals let you render a child component''s content into a DOM node that exists outside its parent component''s DOM hierarchy, while the component still behaves as if it were nested normally in the React tree (events still bubble through the React tree). This is commonly used for modals, tooltips, and dropdowns that need to visually escape a parent''s overflow or z-index constraints.',
 null,
 'createPortal(<Modal />, document.getElementById("modal-root"));',
 'jsx','medium',ARRAY['react','advanced']::text[],2),

('react','advanced-react','react-advanced-react-003',
 'What is server-side rendering (SSR) and how does it differ from client-side rendering?',
 'In client-side rendering, the browser downloads a mostly empty HTML shell and JavaScript that renders the UI after loading. In server-side rendering, the server generates the full HTML for a page on each request and sends it to the browser already populated, which improves perceived load time and SEO, after which React "hydrates" the markup on the client to attach interactivity.',
 null,null,null,'hard',ARRAY['react','advanced','ssr']::text[],3),

('react','advanced-react','react-advanced-react-004',
 'What are higher-order components (HOCs)?',
 'A higher-order component is a function that takes a component and returns a new component with additional props or behavior, following the pattern of composing functions. HOCs were a common way to share cross-cutting logic (like authentication checks or data fetching) before hooks became prevalent, and are still seen in some libraries.',
 null,
 'function withLogging(Component) {\n    return function Wrapped(props) {\n        console.log("Rendering", Component.name);\n        return <Component {...props} />;\n    };\n}',
 'jsx','medium',ARRAY['react','advanced']::text[],4),

('react','advanced-react','react-advanced-react-005',
 'What is the difference between the render props pattern and custom hooks?',
 'The render props pattern shares logic by passing a function as a prop (often called "render" or "children") that a component calls with some internal state, letting the caller decide what to render. Custom hooks achieve similar reuse of stateful logic but without adding extra component nesting ("wrapper hell"), by simply extracting logic into a reusable function that any component can call directly — which is why hooks have largely replaced render props and HOCs in modern React code.',
 null,null,null,'hard',ARRAY['react','advanced','hooks']::text[],5),

-- ------------------------------------------------------------------
-- SQL — Basics
-- ------------------------------------------------------------------
('sql','basics','sql-basics-001',
 'What is the difference between DELETE, TRUNCATE, and DROP?',
 'DELETE removes rows one at a time (optionally filtered with WHERE), is logged, and can be rolled back within a transaction. TRUNCATE removes all rows at once by deallocating data pages, is faster than DELETE, resets identity columns, and is minimally logged. DROP removes the entire table structure along with its data from the database entirely.',
 null,null,null,'medium',ARRAY['sql','basics']::text[],1),

('sql','basics','sql-basics-002',
 'What is the difference between a primary key and a unique key?',
 'A primary key uniquely identifies each row in a table, cannot contain NULL values, and a table can have only one. A unique key also enforces uniqueness of its column values, but it can allow one or more NULLs (since NULL is not considered equal to another NULL), and a table can have multiple unique keys.',
 null,null,null,'easy',ARRAY['sql','basics','keys']::text[],2),

('sql','basics','sql-basics-003',
 'What is the difference between WHERE and HAVING?',
 'WHERE filters individual rows before any grouping or aggregation happens, and cannot reference aggregate functions. HAVING filters groups after GROUP BY has been applied, and is used specifically to filter based on aggregate results, such as showing only departments with an average salary above a threshold.',
 null,
 'SELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;',
 'sql','easy',ARRAY['sql','basics','aggregation']::text[],3),

('sql','basics','sql-basics-004',
 'What is normalization and why is it important?',
 'Normalization is the process of organizing tables and columns to reduce data redundancy and improve data integrity, typically by splitting data into related tables following a series of normal forms (1NF, 2NF, 3NF, etc.). It prevents anomalies during insert/update/delete operations, though it can be intentionally relaxed ("denormalized") in read-heavy systems to trade some redundancy for query performance.',
 null,null,null,'medium',ARRAY['sql','basics','design']::text[],4),

-- ------------------------------------------------------------------
-- SQL — Joins
-- ------------------------------------------------------------------
('sql','joins','sql-joins-001',
 'What is the difference between INNER JOIN and OUTER JOIN?',
 'INNER JOIN returns only the rows that have matching values in both joined tables. OUTER JOIN (LEFT, RIGHT, or FULL) returns matching rows plus unmatched rows from one or both sides, filling in NULLs for columns from the table that has no match.',
 null,
 'SELECT e.name, d.name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;',
 'sql','easy',ARRAY['sql','joins']::text[],1),

('sql','joins','sql-joins-002',
 'What is the difference between LEFT JOIN and RIGHT JOIN?',
 'LEFT JOIN returns all rows from the left (first-listed) table along with matching rows from the right table, filling in NULL for right-side columns when there is no match. RIGHT JOIN does the opposite, returning all rows from the right table with matching rows from the left. A RIGHT JOIN can always be rewritten as an equivalent LEFT JOIN by swapping table order, which is why LEFT JOIN is far more commonly used in practice.',
 null,null,null,'easy',ARRAY['sql','joins']::text[],2),

('sql','joins','sql-joins-003',
 'What is a self join and when would you use one?',
 'A self join joins a table to itself, typically using table aliases to distinguish the two "copies." It is useful for comparing rows within the same table, such as finding employees who share the same manager, or comparing each employee''s salary to their manager''s salary stored in the same employees table.',
 null,
 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;',
 'sql','medium',ARRAY['sql','joins']::text[],3),

('sql','joins','sql-joins-004',
 'What is the difference between a JOIN and a UNION?',
 'JOIN combines columns from two or more tables side by side based on a related column, producing wider rows. UNION combines the result rows of two or more SELECT statements vertically into a single result set, requiring each SELECT to have the same number of columns with compatible types; UNION removes duplicate rows by default while UNION ALL keeps them.',
 null,null,null,'medium',ARRAY['sql','joins']::text[],4),

-- ------------------------------------------------------------------
-- SQL — Aggregations
-- ------------------------------------------------------------------
('sql','aggregations','sql-aggregations-001',
 'What is the difference between COUNT(*), COUNT(column), and COUNT(DISTINCT column)?',
 'COUNT(*) counts all rows in the group, including rows with NULLs in any column. COUNT(column) counts only the rows where that specific column is not NULL. COUNT(DISTINCT column) counts the number of unique non-NULL values in that column.',
 null,null,null,'medium',ARRAY['sql','aggregations']::text[],1),

('sql','aggregations','sql-aggregations-002',
 'What is the purpose of GROUP BY?',
 'GROUP BY collapses rows that share the same values in specified columns into a single summary row, so that aggregate functions like COUNT, SUM, AVG, MIN, and MAX can be computed per group rather than across the whole table.',
 null,
 'SELECT department, COUNT(*) AS employee_count\nFROM employees\nGROUP BY department;',
 'sql','easy',ARRAY['sql','aggregations']::text[],2),

('sql','aggregations','sql-aggregations-003',
 'What is the difference between aggregate functions and window functions?',
 'Aggregate functions (with GROUP BY) collapse multiple rows into a single summary row per group, losing the individual row detail. Window functions compute an aggregate or ranking value across a set of related rows (a "window") but still return one row per original row, letting you see both the individual row data and the aggregate result side by side.',
 null,null,null,'medium',ARRAY['sql','aggregations','window-functions']::text[],3),

('sql','aggregations','sql-aggregations-004',
 'How do you find duplicate rows in a table using SQL?',
 'Group the rows by the column(s) that define a "duplicate," then use HAVING COUNT(*) > 1 to filter to only the groups that appear more than once.',
 null,
 'SELECT email, COUNT(*) AS occurrences\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;',
 'sql','medium',ARRAY['sql','aggregations']::text[],4),

-- ------------------------------------------------------------------
-- SQL — Subqueries
-- ------------------------------------------------------------------
('sql','subqueries','sql-subqueries-001',
 'What is a subquery and what are its types?',
 'A subquery is a query nested inside another query, used to compute an intermediate result that the outer query uses. Common types include scalar subqueries (return a single value), row/column subqueries (return one row or column), and table subqueries (return a full result set), and they can appear in the SELECT, FROM, WHERE, or HAVING clauses.',
 null,null,null,'medium',ARRAY['sql','subqueries']::text[],1),

('sql','subqueries','sql-subqueries-002',
 'What is the difference between a correlated and non-correlated subquery?',
 'A non-correlated subquery is independent of the outer query — it can be run on its own and its result is computed once. A correlated subquery references a column from the outer query, so it must be conceptually re-evaluated for every row processed by the outer query, which can make it significantly slower on large datasets.',
 null,
 '-- Correlated: references outer query''s e alias\nSELECT name FROM employees e\nWHERE salary > (\n    SELECT AVG(salary) FROM employees WHERE department_id = e.department_id\n);',
 'sql','hard',ARRAY['sql','subqueries']::text[],2),

('sql','subqueries','sql-subqueries-003',
 'What is the difference between IN, EXISTS, and ANY/ALL in subqueries?',
 'IN checks whether a value matches any value in a list/subquery result. EXISTS checks only whether a subquery returns any rows at all, without caring about the actual values, and can often be more efficient since it can short-circuit on the first match. ANY compares a value against each value returned by a subquery and is true if any comparison is true, while ALL requires the comparison to hold for every returned value.',
 null,null,null,'medium',ARRAY['sql','subqueries']::text[],3),

('sql','subqueries','sql-subqueries-004',
 'Can a subquery be used in the SELECT clause?',
 'Yes — a scalar subquery (one that returns a single value) can be used directly in the SELECT list to compute a per-row derived value, such as showing each employee''s salary alongside their department''s average salary.',
 null,
 'SELECT name, salary,\n    (SELECT AVG(salary) FROM employees) AS company_avg\nFROM employees;',
 'sql','medium',ARRAY['sql','subqueries']::text[],4),

-- ------------------------------------------------------------------
-- SQL — CTE
-- ------------------------------------------------------------------
('sql','cte','sql-cte-001',
 'What is a Common Table Expression (CTE)?',
 'A CTE is a named, temporary result set defined with a WITH clause that exists only for the duration of the query that follows it. CTEs improve readability by breaking complex queries into logical, named steps, and can be referenced multiple times within the same query.',
 null,
 'WITH high_earners AS (\n    SELECT * FROM employees WHERE salary > 80000\n)\nSELECT department, COUNT(*) FROM high_earners GROUP BY department;',
 'sql','medium',ARRAY['sql','cte']::text[],1),

('sql','cte','sql-cte-002',
 'What is the difference between a CTE and a subquery?',
 'Functionally they can often achieve the same result, but a CTE is defined once with a name and can be referenced multiple times within the outer query, while a subquery is inline and would need to be repeated if used more than once. CTEs also improve readability for complex, multi-step logic and support recursion, which plain subqueries do not.',
 null,null,null,'medium',ARRAY['sql','cte','subqueries']::text[],2),

('sql','cte','sql-cte-003',
 'What is a recursive CTE and when would you use one?',
 'A recursive CTE references itself to repeatedly process hierarchical or graph-like data, such as an organizational chart or category tree. It consists of an "anchor" member (the base case) and a "recursive" member that references the CTE itself, combined with UNION ALL, continuing until the recursive member returns no more rows.',
 null,
 'WITH RECURSIVE org_chart AS (\n    SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL\n    UNION ALL\n    SELECT e.id, e.name, e.manager_id\n    FROM employees e\n    JOIN org_chart o ON e.manager_id = o.id\n)\nSELECT * FROM org_chart;',
 'sql','hard',ARRAY['sql','cte','recursion']::text[],3),

('sql','cte','sql-cte-004',
 'Can you use multiple CTEs in a single query?',
 'Yes — multiple CTEs can be defined in a single WITH clause, separated by commas, and later CTEs can reference earlier ones defined in the same clause, allowing you to build up complex logic in clear, sequential steps.',
 'WITH a AS (...), b AS (SELECT * FROM a WHERE ...)\nSELECT * FROM b;',
 null,null,'easy',ARRAY['sql','cte']::text[],4),

-- ------------------------------------------------------------------
-- SQL — Window Functions
-- ------------------------------------------------------------------
('sql','window-functions','sql-window-functions-001',
 'What is a window function and how does it differ from a normal aggregate function?',
 'A window function performs a calculation across a set of rows related to the current row (defined by an OVER clause), but unlike GROUP BY aggregation, it does not collapse those rows — each original row is preserved in the output alongside the computed value. This makes it possible to show both detail rows and aggregate context (like a running total or rank) in the same result set.',
 null,null,null,'medium',ARRAY['sql','window-functions']::text[],1),

('sql','window-functions','sql-window-functions-002',
 'What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?',
 'ROW_NUMBER() assigns a unique, sequential number to each row within a partition regardless of ties. RANK() assigns the same rank to tied rows but skips subsequent rank numbers (e.g. 1, 2, 2, 4). DENSE_RANK() also assigns the same rank to ties, but does not skip numbers afterward (e.g. 1, 2, 2, 3).',
 null,
 'SELECT name, salary,\n    RANK() OVER (ORDER BY salary DESC) AS salary_rank\nFROM employees;',
 'sql','hard',ARRAY['sql','window-functions']::text[],2),

('sql','window-functions','sql-window-functions-003',
 'What does the PARTITION BY clause do?',
 'PARTITION BY divides the result set into groups ("partitions") for the purpose of a window function, similar to how GROUP BY groups rows for aggregation — except the window function is computed independently within each partition while every row is still returned individually.',
 null,
 'SELECT name, department, salary,\n    AVG(salary) OVER (PARTITION BY department) AS dept_avg\nFROM employees;',
 'sql','medium',ARRAY['sql','window-functions']::text[],3),

('sql','window-functions','sql-window-functions-004',
 'How would you calculate a running total using SQL?',
 'Use the SUM() window function with an ORDER BY inside the OVER clause; by default this frames the calculation from the start of the partition up to the current row, producing a cumulative sum as the order progresses.',
 null,
 'SELECT order_date, amount,\n    SUM(amount) OVER (ORDER BY order_date) AS running_total\nFROM orders;',
 'sql','medium',ARRAY['sql','window-functions']::text[],4),

-- ------------------------------------------------------------------
-- SQL — Indexes
-- ------------------------------------------------------------------
('sql','indexes','sql-indexes-001',
 'What is an index and how does it improve query performance?',
 'An index is a separate data structure (commonly a B-tree) that stores a sorted reference to column values and pointers to the corresponding table rows. It lets the database locate matching rows quickly via a fast lookup instead of scanning every row in the table ("full table scan"), which is especially valuable for large tables and columns frequently used in WHERE, JOIN, or ORDER BY clauses.',
 null,null,null,'medium',ARRAY['sql','indexes','performance']::text[],1),

('sql','indexes','sql-indexes-002',
 'What is the difference between a clustered and non-clustered index?',
 'A clustered index determines the actual physical order in which table rows are stored on disk, so a table can have only one clustered index (often the primary key). A non-clustered index is a separate structure that stores the indexed column values along with pointers back to the actual row location, so a table can have multiple non-clustered indexes.',
 null,null,null,'hard',ARRAY['sql','indexes']::text[],2),

('sql','indexes','sql-indexes-003',
 'What are the trade-offs of adding too many indexes to a table?',
 'While indexes speed up reads, every additional index must also be updated on every INSERT, UPDATE, and DELETE, which slows down write performance and consumes extra disk space. The general guideline is to index columns that are frequently filtered, joined, or sorted on, rather than indexing every column indiscriminately.',
 null,null,null,'medium',ARRAY['sql','indexes','performance']::text[],3),

-- ------------------------------------------------------------------
-- SQL — Transactions
-- ------------------------------------------------------------------
('sql','transactions','sql-transactions-001',
 'What is a transaction and what are the ACID properties?',
 'A transaction is a sequence of one or more SQL operations executed as a single logical unit of work, which either fully succeeds or fully fails. ACID describes the guarantees a reliable transaction provides: Atomicity (all-or-nothing execution), Consistency (the database moves from one valid state to another), Isolation (concurrent transactions do not interfere with each other''s intermediate results), and Durability (once committed, changes survive even a system crash).',
 null,null,null,'medium',ARRAY['sql','transactions','acid']::text[],1),

('sql','transactions','sql-transactions-002',
 'What is the difference between COMMIT and ROLLBACK?',
 'COMMIT permanently saves all changes made during the current transaction to the database, making them visible to other sessions. ROLLBACK undoes all changes made during the current transaction, reverting the database to the state it was in before the transaction began, typically used when an error occurs partway through a multi-step operation.',
 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;',
 null,null,'easy',ARRAY['sql','transactions']::text[],2),

('sql','transactions','sql-transactions-003',
 'What are the different transaction isolation levels?',
 'The SQL standard defines four isolation levels, in increasing order of strictness: Read Uncommitted (may see uncommitted changes from other transactions — "dirty reads"), Read Committed (only sees committed data, but values can change between reads within the same transaction), Repeatable Read (guarantees the same row returns the same value throughout the transaction, but new rows matching a query can still appear — "phantom reads"), and Serializable (fully isolates transactions as if they ran one at a time, preventing all anomalies at the cost of the most contention).',
 null,null,null,'hard',ARRAY['sql','transactions','isolation']::text[],3)

) as v(language_slug, topic_slug, slug, question, answer, example, code, code_language, difficulty, tags, display_order)
join public.languages l on l.slug = v.language_slug
join public.topics t on t.language_id = l.id and t.slug = v.topic_slug
on conflict (slug) do update set
  question = excluded.question,
  answer = excluded.answer,
  example = excluded.example,
  code = excluded.code,
  code_language = excluded.code_language,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  display_order = excluded.display_order,
  topic_id = excluded.topic_id,
  language_id = excluded.language_id;
