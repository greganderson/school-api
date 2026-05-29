# Agent Usage Guide

This project has 51 specialized subagents. Use them proactively — delegate to them instead of doing the work yourself whenever a task matches their domain. This produces better, more specialized output and keeps the main context clean.

## How to Use Agents

Invoke agents via the `Agent` tool with `subagent_type` set to the agent name. Run independent agents in parallel. Always prefer an agent over handling the task yourself when one clearly fits.

---

## Orchestration Layer (Use First for Complex Tasks)

These agents coordinate other agents and manage cross-cutting concerns. When a task involves multiple domains or ongoing workflows, start here.

| Agent | When to Use |
|-------|-------------|
| `workflow-orchestrator` | Multi-step processes spanning several domains; design state machines and error recovery flows |
| `multi-agent-coordinator` | Coordinating concurrent agents that need to share state or synchronize work |
| `agent-organizer` | Assembling the right team of agents for a complex project; task decomposition |
| `codebase-orchestrator` | Repository-wide refactoring with human approval loops and risk-weighted proposals |
| `context-manager` | Shared state or metadata that multiple agents need to access or update |
| `task-distributor` | Distributing large workloads across multiple workers with priority and deadline constraints |
| `workflow-orchestrator` | Business process automation with branching, compensation, and transaction management |
| `performance-monitor` | Setting up observability and metrics collection across the system |
| `error-coordinator` | Distributed error handling, cascade prevention, circuit breakers |
| `knowledge-synthesizer` | Extracting patterns from agent interactions; organizational learning |
| `it-ops-orchestrator` | IT operations tasks spanning PowerShell, .NET, Azure, M365, Active Directory |
| `agent-installer` | Discovering and installing new agents from the awesome-claude-code-subagents repo |

---

## Planning and Product (Use Before Implementing)

Use these agents at the start of a new feature, epic, or project to ensure you're building the right thing the right way.

| Agent | When to Use |
|-------|-------------|
| `architect-reviewer` | Evaluating system design, technology choices, or architectural patterns before building |
| `product-manager` | Defining product strategy, prioritizing features, writing requirements |
| `project-manager` | Project planning, risk registers, timeline management, stakeholder coordination |
| `scrum-master` | Sprint planning, retrospectives, velocity analysis, impediment removal |
| `backlog-grooming` | Cleaning up a backlog; story refinement and estimation sessions |

---

## Implementation Agents (Use When Writing Code)

### Language and Framework Specialists

Delegate language-specific work to these agents rather than writing the code yourself.

| Agent | When to Use |
|-------|-------------|
| `python-pro` | Type-safe Python code, async patterns, data processing, general Python work |
| `typescript-pro` | Advanced TypeScript generics, complex type patterns, end-to-end type safety |
| `fastapi-developer` | Python async APIs with FastAPI, Pydantic v2, dependency injection |
| `nextjs-developer` | Next.js 14+ App Router, server components, Core Web Vitals, SEO |
| `backend-developer` | Server-side APIs, microservices, Node.js/Python/Go backends |
| `frontend-developer` | React, Vue, Angular applications; component systems |
| `mobile-developer` | React Native cross-platform apps; iOS/Android native optimization |
| `websocket-engineer` | Real-time bidirectional features; Socket.IO; high-concurrency connections |
| `cli-developer` | Command-line tools; interactive prompts; shell completions |

### Design

| Agent | When to Use |
|-------|-------------|
| `api-designer` | Designing new REST/GraphQL APIs; OpenAPI specs; versioning strategies |
| `ui-designer` | Visual design systems, component libraries, interaction patterns, accessibility annotations |

---

## Infrastructure and DevOps

| Agent | When to Use |
|-------|-------------|
| `devops-engineer` | CI/CD pipelines, IaC (Terraform/Ansible), container orchestration |
| `deployment-engineer` | Deployment strategies (blue-green, canary, rolling); release pipelines |
| `docker-expert` | Dockerfile optimization, multi-stage builds, image security hardening |
| `database-administrator` | DB performance tuning, high availability, disaster recovery, migrations |
| `build-engineer` | Build system optimization; reducing compile times; caching strategies |

---

## Quality, Testing, and Security

Run multiple QA/security agents in parallel after implementation — they catch different classes of issues.

| Agent | When to Use |
|-------|-------------|
| `code-reviewer` | Code quality review; security vulnerabilities; best practices enforcement |
| `qa-expert` | Test strategy, test planning, defect management across the full lifecycle |
| `test-automator` | Building test frameworks, CI/CD test integration, automation scripts |
| `accessibility-tester` | WCAG 2.1 compliance, keyboard navigation, screen reader compatibility |
| `ui-ux-tester` | Exhaustive UI/UX testing using browser automation; defect reports with visual evidence |
| `performance-engineer` | Profiling, load testing, bottleneck elimination, scalability validation |
| `security-auditor` | Compliance audits (SOC2, GDPR, HIPAA), risk assessments, control reviews |
| `penetration-tester` | Authorized offensive security testing; OWASP Top 10 validation |
| `chaos-engineer` | Resilience testing; controlled failure injection; game day planning |

---

## Debugging and Incident Response

| Agent | When to Use |
|-------|-------------|
| `debugger` | Diagnosing bugs; root cause analysis; resolving specific failures |
| `error-detective` | Correlating errors across distributed services; identifying error patterns |
| `incident-responder` | Active security breaches or service outages; evidence preservation |
| `devops-incident-responder` | Production incidents; postmortems; MTTR reduction |

---

## Documentation

| Agent | When to Use |
|-------|-------------|
| `readme-generator` | Writing a README from actual repo contents; zero-hallucination, scan-first approach |
| `api-documenter` | OpenAPI specifications; interactive API docs portals; multi-language SDK examples |
| `documentation-engineer` | Larger documentation systems; tutorials; docs sites; automation pipelines |

---

## Code Maintenance

| Agent | When to Use |
|-------|-------------|
| `refactoring-specialist` | Transforming complex or duplicated code while preserving behavior |
| `dependency-manager` | Security vulnerability scanning, version conflict resolution, license audits |
| `git-workflow-manager` | Establishing branching strategies, Git hooks, PR automation, release workflows |

---

## Recommended Workflows

### Starting a New Feature
1. `architect-reviewer` — validate the design approach
2. `api-designer` — define the API contract
3. `backend-developer` / `fastapi-developer` / `nextjs-developer` — implement
4. `frontend-developer` — build the UI
5. Run in parallel: `code-reviewer`, `qa-expert`, `security-auditor`
6. `test-automator` — wire up CI/CD tests
7. `deployment-engineer` — deploy

### Debugging a Production Issue
1. `error-detective` — identify patterns across logs and services
2. `debugger` — isolate the root cause
3. `devops-incident-responder` — coordinate response and postmortem

### Improving an Existing Codebase
1. `codebase-orchestrator` — map the repo, propose weighted priorities
2. `refactoring-specialist` — execute approved refactors
3. `performance-engineer` — profile and optimize
4. `dependency-manager` — audit and update dependencies
5. `security-auditor` — review security posture

### Before a Release
Run these in parallel:
- `qa-expert` — final test coverage review
- `security-auditor` — security gate check
- `performance-engineer` — load test validation
- `accessibility-tester` — WCAG compliance check
- `readme-generator` or `api-documenter` — update docs

---

## Model Notes

Several agents use more capable (but slower/costlier) models by default:
- **Opus**: `architect-reviewer`, `code-reviewer`, `security-auditor`, `penetration-tester`, `multi-agent-coordinator`, `codebase-orchestrator`, `workflow-orchestrator`
- **Haiku**: `deployment-engineer`, `accessibility-tester`, `build-engineer`, `dependency-manager`, `documentation-engineer`, `git-workflow-manager`, `product-manager`, `project-manager`, `scrum-master`, `api-documenter`, `task-distributor`, `performance-monitor`, `agent-installer`
- **Sonnet**: everything else

Use the Opus-model agents for consequential decisions. Use the Haiku-model agents freely for lower-stakes or high-frequency tasks.
