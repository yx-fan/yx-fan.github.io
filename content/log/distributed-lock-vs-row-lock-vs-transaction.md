---
title: "Distributed Lock vs Row Lock vs Transaction"
date: 2026-01-15
categories: ["thought"]
tags: ["Database", "Concurrency", "Distributed Systems", "Transactions", "System Design"]
summary: "These three mechanisms solve different problems at different layers: distributed locks protect business execution, row locks protect data mutation, and transactions define lock scope and atomicity."
---

Distributed locks, row locks, and transactions solve different problems at different layers. It's easy to confuse them, but understanding what each one protects makes the distinction clear.

A distributed lock protects business execution. It answers the question: should this operation run at all? You acquire it before business logic starts, and it prevents the same workflow from being executed concurrently across services or workers. Think of it as a gatekeeper at the application level.

Common implementations use Redis, ZooKeeper, or database-based locking mechanisms. The lock is typically keyed by a business identifier—like an order ID or user ID—and has a timeout to prevent deadlocks. If two workers try to process the same order simultaneously, only one will acquire the lock and proceed. The other will either wait or fail fast, depending on your implementation.

The key characteristic of a distributed lock is that it exists outside the database transaction. You might acquire it, do some external API calls, perform database operations, and then release it. The lock protects the entire business workflow, not just the database operations.

A row-level lock protects data mutation. It answers the question: who is allowed to modify this specific row right now? Row locks take effect immediately when the locking SQL is executed—like `SELECT … FOR UPDATE`—and remain active until the surrounding transaction commits or rolls back. This is about controlling access to specific data rows.

When you execute `SELECT * FROM orders WHERE id = 123 FOR UPDATE`, the database immediately locks that row. Other transactions trying to modify the same row will block until your transaction completes. This prevents lost updates and ensures that when you read a value, modify it, and write it back, no one else has changed it in between.

Row locks are database-internal mechanisms. They're automatic, they're fast, and they work within the transaction boundary. But they only protect what happens inside the database. If your business logic involves external systems, API calls, or multiple database operations that need to be coordinated, row locks alone won't help.

A transaction is not a lock. It's a lifecycle boundary that groups SQL statements together and defines how long acquired locks live. The key point is that locks don't wait for `COMMIT` to become effective—they are enforced as soon as they are acquired. The transaction just determines when those locks are released.

This is a common misconception. People think that locks only take effect when you commit, but that's not how it works. When you execute `SELECT … FOR UPDATE`, the lock is acquired immediately. Other transactions will block right away, not wait for your commit. The transaction boundary defines when the lock is released—either on commit or rollback.

Transactions provide atomicity: either all statements succeed or none do. They provide isolation: changes are invisible to other transactions until commit. They provide consistency: the database remains in a valid state. And they provide durability: committed changes persist. But the locking behavior happens immediately, not at commit time.

Why are all three needed? They solve different problems that often occur together. Consider a scenario where you need to process a payment: you want to ensure only one worker processes it (distributed lock), you want to prevent concurrent updates to the account balance (row lock), and you want to ensure the debit and credit operations happen atomically (transaction).

Distributed locks prevent duplicated business execution. Without them, you might send two payment requests to an external gateway, or process the same order twice. Row locks prevent concurrent writes to the same data. Without them, you might have race conditions where two transactions read the same balance, both subtract an amount, and both write back, losing one of the updates. Transactions ensure atomicity and define lock scope. Without them, you can't guarantee that related operations succeed or fail together.

They're complementary, not interchangeable. You can't use a distributed lock to prevent concurrent database writes—it's too coarse-grained and doesn't integrate with the database's concurrency control. You can't use row locks to prevent duplicate business operations—they only protect database access, not the broader workflow. And transactions don't prevent duplicate execution—they just ensure that when execution happens, the database operations are atomic.
