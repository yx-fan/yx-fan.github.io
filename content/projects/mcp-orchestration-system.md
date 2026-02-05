---
title: "MCP Orchestration System: Production-Oriented Agent Control Plane"
date: 2026-02-05T00:00:00Z
summary: "A production-oriented MCP (Model Control Plane) orchestration system designed to manage agentic workflows with statefulness, extensibility, cost control, and multi-step reasoning capabilities."
draft: false
image: "/images/System_Design.png"
tags:
  [
    "System Design",
    "AI Orchestration",
    "LLM",
    "LangGraph",
    "Redis",
    "Vector Database",
    "Microservices",
  ]
---

### 1. Overview

As large language models become increasingly capable, many systems treat them as the center of the architecture: a single prompt in, a single response out. While this approach is sufficient for demos, it quickly breaks down in production settings that require statefulness, extensibility, cost control, and multi-step reasoning.

This project implements a production-oriented MCP (Model Control Plane) orchestration system designed to manage agentic workflows in a structured, observable, and evolvable manner.

Rather than framing the system as "an AI agent," it is deliberately designed as a control plane that coordinates intent understanding, workflow planning, conditional execution, state and memory management, and post-execution validation and persistence.

The core philosophy of this project is that agent behavior is a system concern, not a prompt engineering problem.

---

### 2. Architecture Design

At a high level, the system is composed of five conceptual layers: API Layer, MCP Control Plane, Workflow Layer, Execution Layer, and State & Memory Layer. Each layer has a clearly defined responsibility and interacts with adjacent layers through explicit contracts rather than implicit coupling.

![MCP Orchestration Architecture](/images/MCP_Orchestration_Architecture.png)

The orchestration flow is strictly top-down, while state and memory operate as managed side channels rather than being embedded directly into execution logic.

#### API Layer

The API layer provides a single, stable entry point for all user interactions via a `/chat` endpoint. Its responsibilities are intentionally limited to request validation, session management, metadata normalization, and error boundary enforcement. The API layer does not perform any business logic, intent classification, or agent invocation. This separation ensures that external interface stability is preserved even as internal workflows evolve.

The layer is built using Node.js and Express for the RESTful API framework, with cookie-based or token-based session tracking and schema validation middleware (e.g., Joi, Zod) for request validation.

#### MCP Control Plane

At the center of the system is the MCP Orchestrator, which acts as a single control plane for all request lifecycles. The control plane is responsible for pre-processing and normalization hooks (query sanitization, context enrichment), intent resolution using a multi-tier strategy (rule → LLM → default), workflow selection and planning (dynamic workflow graph construction), state hydration and persistence (session state management), and post-processing and response assembly (result validation and formatting).

This design avoids the common pitfall of "agent sprawl," where individual agents independently manage memory, routing, and execution decisions. All coordination logic is centralized, observable, and testable. Key components include the Orchestrator (main coordination engine), Intent Router (three-tier intent resolution system), Pre/Post-Process Hooks (extensible processing pipeline), and State Manager (session and workflow state coordination).

Intent understanding is treated as a routing problem, not a generative one. The system applies a deterministic, cost-aware, three-level strategy: rule-based matching for high-confidence, low-latency cases (e.g., keyword matching, regex patterns), LLM-based semantic classification for ambiguous queries requiring semantic understanding, and explicit default fallback to guarantee forward progress under uncertainty. By making intent resolution explicit, the system avoids hidden prompt branching and ensures predictable behavior under failure or uncertainty.

#### Workflow Layer

A critical design decision in this system is the strict separation between workflow planning and workflow execution. The Workflow Planner (LangGraph Builder) dynamically constructs a workflow graph based on resolved intent, domain-specific configuration, and conditional execution rules. This planning phase is declarative and configuration-driven, enabling workflows to be modified without touching execution code.

The Workflow Runtime executes the compiled graph asynchronously, handling node sequencing, conditional routing, and state propagation between nodes. This separation allows planning-time decisions to remain stable while execution-time behavior adapts dynamically to runtime state. The layer uses LangGraph for workflow graph construction and execution, async/await for non-blocking execution, and YAML/JSON for configuration-driven workflow definitions.

#### Execution Layer

Execution is performed by Agents and Nodes, each designed as a focused, side-effect-aware component. Examples include question type analysis nodes (classify question types: factual, analytical, creative), entity or context resolution nodes (extract and resolve entities from queries), RAG retrieval nodes (semantic search and retrieval from vector store), answer synthesis nodes (generate responses using LLM), and reflection or evaluation nodes (quality assessment and validation).

Nodes operate on a shared state object but do not own persistence, routing, or lifecycle concerns. This keeps execution logic composable and easy to reason about. LLM interactions are treated as external dependencies, not architectural anchors. Node types include QA Nodes for question-answering workflows, RAG Nodes for retrieval-augmented generation, Tool Nodes for external API integrations, and Reflection Nodes for self-evaluation and quality checks.

#### State & Memory

State management is explicitly divided into two categories. Session State and Conversation History are managed in Redis, used for session-scoped persistent state, multi-turn conversation history, and workflow continuity across requests. Temporary execution fields are explicitly filtered and never persisted, preventing state pollution.

Vector Store is used exclusively for retrieval-augmented generation, long-term semantic memory, and domain-specific document grounding. The orchestrator determines when and how vector memory is accessed—execution nodes never fetch memory autonomously. Technologies include Redis for session state, conversation history, and temporary caching; Vector Database (e.g., Milvus, Pinecone, Weaviate) for semantic search; and JSON-based state serialization.

---

### 3. Design Challenges and Solutions

#### Centralized Orchestration vs. Distributed Autonomy

Distributed agent autonomy is attractive conceptually but fragile operationally. Without centralized control, it's difficult to enforce consistent policies, maintain observability, and handle errors uniformly. The solution is to centralize all orchestration logic in the MCP Orchestrator, with agents and nodes operating as pure functions without autonomous routing or memory access. All coordination decisions flow through a single control plane.

#### Workflow Configuration vs. Hard-Coded Logic

Hard-coding workflow logic makes experimentation expensive and domain expansion difficult. The system uses declarative configuration (YAML/JSON) to define workflows, separates workflow planning from execution, and enables runtime workflow graph construction based on intent and configuration.

#### State Scoping and Memory Management

Mixing temporary execution state with persistent session state leads to memory leaks, unintended coupling, and long-term drift. The solution explicitly separates session state (Redis) from execution state (in-memory), filters temporary fields before persistence, and uses vector store exclusively for RAG and long-term memory, not session state.

#### Cost Control and LLM Usage

Uncontrolled LLM invocations lead to unpredictable costs and latency. The system implements tiered intent resolution (use rules first, LLM only when necessary), explicit LLM invocation points rather than implicit prompt branching, and cost tracking and budget enforcement at the orchestrator level.

#### System Evolution and Extensibility

Adding new agents, tools, or workflows should not require restructuring the core architecture. The system achieves this through plugin-based node architecture, configuration-driven workflow definitions, clear extension points (hooks, nodes, intent handlers), and backward-compatible API contracts.

---

### 4. Key Engineering Decisions

Orchestration is centralized by design. Distributed agent autonomy is attractive conceptually but fragile operationally. Centralizing orchestration enables consistent policy enforcement, observability, and error handling.

Workflows are configuration, not code. Workflow graphs are driven by declarative configuration rather than hard-coded logic. This dramatically lowers the cost of experimentation and domain expansion.

State is explicitly scoped. By separating temporary execution state from persistent session state, the system avoids memory leaks, unintended coupling, and long-term drift.

LLMs are dependencies, not the system. LLMs are invoked deliberately and contextually. They do not control routing, memory access, or lifecycle decisions.

The system is designed to evolve. New agents, tools, memory backends, and workflow patterns can be introduced without restructuring the core architecture.

---

### 5. Scalability and Future Development

The MCP orchestration system is designed for production-scale deployment and continuous evolution. Scalability features include horizontal scaling through stateless orchestrator design enabling multi-instance deployment, async execution with non-blocking workflow runtime supporting high concurrency, caching strategy using Redis to reduce redundant LLM calls and database queries, and load balancing via API Gateway distributing traffic across orchestrator instances.

Future enhancements include multi-modal support to extend nodes for handling images, audio, and video, advanced reflection with self-correction and iterative improvement loops, domain-specific workflows with industry-specific workflow templates, observability dashboard for real-time monitoring of workflow execution and costs, and A/B testing framework to compare workflow variations for optimization.

---

### 6. Conclusion

This project demonstrates that scalable agentic systems require control planes, not clever prompts. By treating intent resolution, workflow planning, execution, and memory as separate but coordinated responsibilities, the MCP architecture provides a robust foundation for building complex, multi-step AI systems that remain understandable, testable, and extensible.

The resulting system is not a chatbot—it is an agent orchestration platform capable of supporting diverse domains, evolving workflows, and production-level operational constraints. The architecture's emphasis on explicit contracts, centralized orchestration, and configuration-driven workflows ensures that the system can evolve without becoming unmaintainable, making it suitable for production environments where reliability, observability, and cost control are paramount.
