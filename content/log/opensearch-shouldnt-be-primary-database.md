---
title: "Why OpenSearch Shouldn't Be Used as a Primary Database"
date: 2025-07-15
categories: ["thought"]
tags: ["OpenSearch", "System Design"]
summary: "OpenSearch is built for search, not for storage. Its architecture prioritizes high-performance retrieval and aggregation, not transactional integrity or consistency."
---

OpenSearch is built for search, not for storage. Its architecture prioritizes high-performance retrieval and aggregation, not transactional integrity or consistency. It works best as a supplementary query and analytics layer, not as the system of record.

There are several fundamental reasons why OpenSearch shouldn't be used as a primary database. First, it lacks ACID properties—writes can partially succeed, and updates and deletes are essentially "mark and rebuild" operations with no rollback capability. This makes it completely unsuitable for critical data like orders, payments, or inventory where transactional guarantees are essential.

Second, OpenSearch operates on eventual consistency, not strong consistency. The default refresh interval is around one second, which means writes can be temporarily invisible. If a node crashes before the refresh happens, you can lose data. This is fine for search indexes where a slight delay doesn't matter, but catastrophic for a primary database.

Third, there's no relational or constraint model. No primary key enforcement, no foreign keys, no joins, and no check constraints. You simply cannot ensure referential integrity or relational correctness. You can't model complex relationships between entities the way you can with a proper relational database.

Fourth, write performance is a concern. Every update triggers new segment writes and merges, which causes high I/O and disk fragmentation under heavy write loads. The system is optimized for reads, not writes.

Fifth, the storage overhead is significant. Each field gets its own specialized index—inverted indexes for text, BKD trees for numeric ranges, geo indexes for location data, and so on. This results in storage that's two to three times the raw data size. Fine for a search layer where you're trading storage for query speed, but wasteful for a primary database.

Finally, durability is weak. Data persistence is decoupled from indexing refresh, so crashes can lose unflushed records. You don't have the same durability guarantees that you get with a proper database that ensures writes are persisted before acknowledging them.

The right way to use OpenSearch is in a layered architecture. Your primary database—PostgreSQL or MySQL—handles transactions, integrity, and serves as the source of truth. OpenSearch sits on top as the search and analytics layer, handling fuzzy searches and real-time aggregations. Then you have visualization tools like Kibana or Grafana for monitoring and dashboards. The principle is simple: databases ensure correctness, OpenSearch ensures visibility.

I've seen this pattern work well in logistics systems. Core data like orders, statuses, and routes stays in MySQL or PostgreSQL. Change streams flow through Kafka, Debezium, or Logstash into OpenSearch, which powers:

- Fast fuzzy tracking searches
- Real-time delay and exception analytics  
- Geo heatmaps and operational dashboards

OpenSearch acts as the performance accelerator, not the source of truth. Never build business logic on top of OpenSearch. Keep your RDBMS as the authoritative data source, and use OpenSearch only for search, aggregation, and visibility through proper data pipelines. It's a powerful tool when used correctly, but trying to use it as a primary database is asking for trouble.

