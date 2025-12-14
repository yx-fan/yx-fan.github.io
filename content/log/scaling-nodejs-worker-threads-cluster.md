---
title: "Scaling Node.js — Worker Threads & Cluster Mode"
date: 2025-10-15
categories: ["thought"]
tags: ["Node.js", "Scaling", "WorkerThreads", "Cluster"]
summary: "Node.js runs one event loop per process—only one CPU core is used. To scale, use Cluster for multi-process or Worker Threads for multi-thread. Both enable parallelism, but in different ways."
---

Node.js runs one event loop per process—only one CPU core is used. To scale, you need Cluster for multi-process or Worker Threads for multi-thread. Both enable parallelism, but in different ways.

The fundamental issue is that async I/O doesn't equal CPU parallelism. When you have heavy computation, it blocks the event loop. Workers and Clusters let Node.js use multiple cores, which is essential for taking full advantage of modern multi-core systems.

Cluster mode creates multiple processes, one per CPU core. Each process has its own event loop and memory space. This is ideal for web and API servers where you want to handle more concurrent requests. The operating system or process managers like PM2 handle load balancing across these processes. You can start it with something like `pm2 start app.js -i max` to spawn one process per core.

Cluster mode works best for high request concurrency scenarios—API gateways, REST backends, anything that needs to handle lots of lightweight requests that are mostly I/O-bound. It also provides strong fault isolation: if one process crashes, the others keep running. This is crucial for production systems where stability matters.

Worker Threads take a different approach. They run threads inside the same process, sharing memory and communicating via messages. This is ideal for CPU-heavy tasks like AI inference, encryption, or image processing. The key benefit is keeping the main thread responsive while heavy computation happens in parallel.

Worker Threads shine when you have per-request heavy computation—machine learning inference, image or video processing, or large data aggregation that needs to happen inside a single request. They're also useful for batch or background jobs that need to parallelize sub-tasks. The shared memory makes it efficient to pass large data structures around, though you need to be careful about thread safety.

Here's a quick comparison:

| Aspect | Cluster | Worker Threads |
| --- | --- | --- |
| Type | Multi-process | Multi-thread |
| Memory | Isolated | Shared |
| Use Case | Scale requests | Heavy computation |
| Crash Isolation | Strong | Weaker |
| Setup | Simpler | More code complexity |

The rule of thumb is straightforward: one core equals one Node process or worker. Having more workers than cores just wastes cycles on context switches. You can combine both approaches—use Cluster to parallelize requests across processes, and use Workers to parallelize tasks within each process.

The mental model I use is this: Cluster is horizontal scaling—more processes handling more requests. Worker Threads are vertical scaling—parallel computation inside one process. Choose Cluster for concurrency, Worker for computation. They solve different problems and can work together when you need both high concurrency and heavy computation.

