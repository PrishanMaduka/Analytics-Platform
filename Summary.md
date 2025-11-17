. Requirements Document Summary
Purpose

Defines the functional, non-functional, and data requirements for building native Android and iOS SDKs that enable telemetry and performance monitoring for ADLcom's Monitoring Experience Layer (MxL) platform.

Problem & Objective

ADLcom's monitoring tools were fragmented and inconsistent across teams.

MxL standardizes data collection (metrics, logs, traces, UX telemetry) for improved incident detection, consistency, and scalability.

Goal: Deliver lightweight, platform-native SDKs to capture telemetry data in a standardized format.

Key Business Drivers

Faster issue detection and resolution (reduce MTTD and MTTR).

Better user experience insights through performance monitoring, heatmaps, and replays.

Unified SDK improves developer productivity.

Support marketing teams with push notification analytics.

In-Scope Features

Crash & Error Reporting – Capture crash types, traces, and session info.

Performance Monitoring – Measure startup time, UI rendering, ANRs, CPU/memory usage, battery, and thread counts.

Network Monitoring – Track request/response times, payloads, errors, and endpoint performance.

User Interaction Tracking – Capture user journeys (screen views, taps, drop-offs).

Session & User Context – Maintain session continuity with user/device metadata.

Custom Logging – Structured logs (DEBUG, INFO, WARN, ERROR, FATAL) with contextual data.

Distributed Tracing – OpenTelemetry/OpenTracing integration with trace/span IDs.

Data Privacy & Security – PII redaction, AES-256 encryption, GDPR/CCPA compliance.

Offline Handling – Local caching, batching, and retry with exponential backoff.

Push Notifications – Track delivery/open actions and latency.

Heatmaps & Replays – UX analytics via anonymized interaction capture.

Remote Configuration – Dynamic feature toggles and sampling updates.

Secure Data Transmission – HTTPS/TLS 1.2+, optional certificate pinning.

Backend/Frontend Integration – Unified ingestion into MxL pipeline.

Dashboard & Alerts Integration – For real-time monitoring and reporting.

Out-of-Scope

Monetization/licensing models.

SDKs for hybrid frameworks (React Native, Ionic, Cordova).

Constraints

Budget and resource limitations.

Compliance with GDPR/POPIA.

Platform restrictions (Android/iOS policies).

Coordination across backend and frontend teams.

Risks

SDK performance impact (battery, latency).

Data privacy or regulatory violations.

Integration complexity with backend or apps.

Testing coverage gaps across devices.

Scope creep and third-party dependency risks.

Functional & Non-Functional Requirements

Lightweight (<2% CPU overhead).

Scalable, reliable, maintainable, and developer-friendly.

Secure encryption and anonymization.

Compliance with all privacy standards.

24/7 availability, modular SDK architecture, and accurate metrics.

Data Model

Defines telemetry data categories:
Crash logs, performance metrics, network data, interaction events, sessions, push data, and configuration settings.
Includes validation rules, data relationships, and privacy enforcement.

Use Cases

UC001–UC012 mirror the functional scope (crashes, performance, tracing, privacy, etc.) and outline the main flows, actors, preconditions, and postconditions.

🧩 2. High-Level Design (HLD) Document Summary
Purpose

Outlines the architecture and design for implementing the SDK-based mobile monitoring system, focusing on integration, scalability, and performance.

Architecture Overview
Core Concept

The MXL SDK is embedded in Android/iOS apps to capture telemetry and send it securely to MXL backend services.
Backend processes telemetry through Kafka pipelines and exposes dashboards for visualization and analysis.

Architecture Layers

Client Layer (SDK + Mobile App)

Captures telemetry: crashes, network calls, sessions, and UI interactions.

Transmits data via HTTPS with OAuth 2.0 authentication.

Security/Network Layer

WAF: Protects ingestion endpoints.

Load Balancer: Routes SDK traffic for scalability and SSL termination.

MXL Backend Layer

Ingestion API Gateway: Receives telemetry and routes to Kafka.

Kafka: High-throughput, fault-tolerant event streaming.

Stream Processor: Enriches, aggregates, and structures data.

Remote Config Service: Provides live SDK config updates (sampling, toggles).

Data Storage Layer

ClickHouse: Analytical metrics and time-series storage.

PostgreSQL: SDK configuration and metadata.

Redis: Cache layer for fast lookups and temporary storage.

Frontend Layer

MXL Dashboards: Visualization, analytics, and alert configuration for developers and product managers.

Technology Stack

SDKs: Kotlin/Groovy (Android), Swift/Objective-C (iOS)

Backend: Node.js (Fastify), Go

Frontend: React (Next.js)

Infra: OpenShift, Kafka, Redis, ClickHouse, PostgreSQL

Auth: OAuth2

Tracing: OpenTelemetry

Load Balancer: HAProxy

ORM: Prisma

Design Patterns Used

Microservices Architecture – Independent, scalable services.

Event-Driven Architecture – Kafka-based decoupling.

Layered (N-Tier) – Client → Security → Backend → Storage → UI.

Cache-Aside – Redis caching.

Repository Pattern – Clean separation of logic and data access.

MVC (Frontend) – Modular and maintainable UI layer.

Key Use Cases

Same 12 functional scenarios as in the Requirements doc, implemented via SDK-backend interaction:

Crash/ANR capture

App performance monitoring

Network tracing

Session/user context management

Privacy enforcement

Remote configuration

UX heatmaps and replays

Impact Assessment

Systems impacted: Mobile apps, MXL backend (Kafka, ClickHouse, Redis, PostgreSQL), dashboards, and network infrastructure.

Processes impacted: Incident management, change control, RCA, and performance monitoring workflows.

NFRs: SDK designed to minimize CPU/memory impact, network overhead, and ensure data privacy and high availability.

Future Architecture

Migration to AWS Cloud using EKS, S3/MinIO for telemetry, and CloudWatch for observability — ensuring elastic scalability and cloud-native resilience.