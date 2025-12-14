---
title: "Async / Await Explained — What Actually Happens Under the Hood"
date: 2025-09-15
categories: ["thought"]
tags: ["JavaScript", "AsyncAwait", "EventLoop", "Promise"]
summary: "async/await doesn't make code run in parallel. It's syntactic sugar over Promises that makes asynchronous logic read like synchronous flow, working by pausing and resuming execution through the event loop."
---

`async/await` doesn't make code "run in parallel." It's syntactic sugar over Promises that makes asynchronous logic read like synchronous flow. Behind the scenes, it works by pausing and resuming execution through the event loop.

The first thing to understand is that `async` functions always return a Promise. `await` only works inside an `async` function and pauses it until the Promise resolves. The rest of the function is scheduled as a continuation—a microtask—in the event loop. When I say "pause," I mean it's logical, not physical. The thread never actually stops.

Here's what actually happens when you use `await`:

```jsx
const data = await fetchData();
console.log(data);
```

First, `fetchData()` executes and returns a Promise. Then this function suspends, giving control back to the event loop. When the Promise resolves, the callback—in this case, the `console.log`—is queued as a microtask. After current tasks finish, the event loop resumes this function. The program keeps running other tasks while waiting. That's the key: the waiting happens without blocking.

The relationship with the event loop is crucial. JavaScript has two main queues: macro-tasks for things like timers, I/O, and messages, and micro-tasks for Promise continuations and `await` callbacks. After each macro-task completes, all pending micro-tasks run before the next cycle begins. This means `await` callbacks always run before timers or I/O callbacks in the next tick. It's a predictable ordering that makes async code more reliable.

Sometimes `await` is meaningless. If the awaited value isn't a Promise, it's wrapped in `Promise.resolve()` instantly. Synchronous functions don't "pause" anything. For example, `await add(1, 2)` executes immediately—there's no waiting, just extra overhead.

The question is when `await` actually matters:

| Operation Type | Should Await? | Reason |
| --- | --- | --- |
| File / Network / DB I/O | ✅ Yes | Async I/O, needs event loop resume |
| CPU-bound calculation | ❌ No | Blocks anyway |
| Simulated async (delay, Promise) | ⚙️ Optional | For flow control |
| UI / timer coordination | ⚙️ Sometimes | To yield event loop control |

There are common misunderstandings about `await`. People think `await` makes code run faster, but it doesn't—it only waits smarter. Some think `await` creates threads, but there are no threads, just scheduling. The real power of `await` is improving readability and sequencing. It makes asynchronous code look synchronous, which reduces cognitive load and makes it easier to reason about execution order.

The flow is straightforward: call an async function, execute until the first `await`, register the Promise, yield to the event loop, wait for the Promise to resolve, resume the continuation, and finish the function. It's a dance between the function and the event loop, with the event loop orchestrating when things happen.

The mental model I keep coming back to is this: `await` doesn't block the CPU—it just says, "I'll come back when my data's ready." The CPU keeps working on other things, and when your data arrives, you get notified and continue where you left off. It's efficient because you're not wasting cycles waiting for things you can't control.

