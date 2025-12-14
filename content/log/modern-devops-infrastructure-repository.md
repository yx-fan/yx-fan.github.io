---
title: "How to Build a Modern DevOps Infrastructure Repository"
date: 2025-11-15
categories: ["thought"]
tags: ["DevOps", "Infrastructure", "Terraform", "Kubernetes", "IaC"]
summary: "A clean, layered, and cloud-native foundation for managing infrastructure both locally and in the cloud. Separates provisioning, orchestration, persistence, and automation into modular layers."
---

This structure provides a clean, layered, and cloud-native foundation for managing infrastructure both locally in a homelab and in the cloud. It separates provisioning, orchestration, persistence, and automation into modular layers—making deployments reproducible, scalable, and easy to evolve.

The repository follows a layered architecture that mirrors real-world cloud stack layers: environment setup, infrastructure, orchestration, application, automation, and delivery. The flow is bootstrap, then Terraform, then Docker, then K3s, then apps, then automation, and finally CI/CD. Each layer builds on the previous one, creating a clear separation of concerns.

The bootstrap layer handles system setup and environment preparation. This includes scripts for installing K3s, Terraform, Go, Docker, and configuring firewalls. It's the foundation that gets everything else running. Think of it as Layer 0—the system bootstrap and environment setup that prepares the machine for everything else.

The Terraform layer is where infrastructure-as-code lives. It's organized into reusable modules for K3s provisioning, network rules and routing, persistent volumes, Cloudflare DNS and tunnel configuration, Docker-based databases, and monitoring setup. Environment-specific definitions live in separate directories—one for homelab, one for AWS, each with its own main.tf, terraform.tfvars, and backend configuration. This unified IaC approach ensures reproducible deployment anywhere, whether you're running in a homelab or on AWS.

The Docker services layer handles persistent host services that are stateful. This includes PostgreSQL, Redis, MinIO for object storage, each with their own docker-compose.yaml, backup and restore scripts, and environment configuration. These run outside K3s on stable Docker volumes because databases, caches, and object storage need persistence and don't need the elasticity that Kubernetes provides.

The K8s layer is where cluster-level orchestration happens with K3s. It contains native YAML manifests for Ingress, ConfigMaps, Secrets, and Jobs, plus Helm chart value files for Prometheus, Grafana, nginx-ingress, and Cloudflare tunnel. There's a Makefile for one-command deploy, lint, and sync operations. This is where stateless, scalable services live.

The apps layer contains application services that run on K3s. Each app—whether it's a Go, Node, or Python API service, or a background worker—has its own Dockerfile, deployment manifests, service definitions, and documentation. These are the actual applications that users interact with, running in the Kubernetes cluster.

The automation layer brings intelligence to the infrastructure. Written in Go or Python, it includes components for automating Terraform plans, monitoring cluster state, handling observability logic, managing webhooks and alerts, and scheduling periodic backups. This is where self-healing and monitoring logic lives, making the infrastructure more autonomous.

The scripts layer contains manual or periodic scripts for operations like backing up everything, cleaning up resources, updating container images, deploying all services, and restoring from backups. These are the operational tools that don't fit into the automation layer but are still essential for day-to-day management.

Finally, the CI/CD layer uses GitHub Actions workflows for Terraform planning and applying, Docker image building, and K3s deployments. This brings GitOps-style continuous delivery to the infrastructure, ensuring that changes are tested, reviewed, and deployed systematically.

The key insight is the separation between stateful and stateless services. Databases, caches, and object storage run outside K3s on stable Docker volumes because they need persistence and don't benefit from Kubernetes' scaling model. Application and vector services run inside K3s because they need scalability and elasticity. This separation ensures that each type of service runs in the environment that best suits its needs.

The unified infrastructure-as-code approach means Terraform, Helm, and Kustomize work together to ensure reproducible deployment anywhere. Whether you're deploying to a homelab or AWS, the same code and processes apply. The automation-ready design means the infrastructure can monitor itself, heal itself, and deploy itself through GitOps-style continuous delivery.

The mental model is bottom to top: foundation, then infrastructure, then orchestration, then automation, then delivery. Each layer depends on the layers below it, and each layer adds a new capability. Bootstrap sets up the system, Terraform defines the infrastructure, Docker provides persistent services, K3s orchestrates applications, apps deliver value, automation adds intelligence, and CI/CD ensures continuous improvement.

