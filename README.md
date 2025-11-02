# GreenSquare — Project Files


Monorepo for the **GreenSquare** application: infrastructure as code, backend services, and a web UI — all in one place.

GreenSquare is a carbon-credit trading platform that connects landowners who sequester carbon with companies looking to offset emissions.

> This repo contains the project files that were developed for my Software Engineering class in a 3 person team. Folders currently include `infra/`, `lands/`, `marketplace/`, `users-service/`, and `web-app/`. The codebase mixes Go, Terraform (HCL), JavaScript/CSS/HTML, and a bit of Python.

---

## Table of Contents

- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Infrastructure (Terraform)](#infrastructure-terraform)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)

---

## Architecture

```
+------------------+         +------------------+         +------------------+
|  web-app (JS)    |  --->   |  gateway/FE calls|  --->   |  backend services |
|  static/SPA      |         |  (fetch/XHR)     |         |  (Go microservices)|
+------------------+         +------------------+         +------------------+
                                                             |      |       |
                                                             v      v       v
                                                         users   lands   marketplace
                                                              (Go services)

                    +-------------------------------- Infrastructure -------------------------------+
                    |  infra/ (Terraform): networks, databases, secrets, buckets, IAM, etc.         |
                    +--------------------------------------------------------------------------------+
```

**High level:**

- **web-app/** — a lightweight front-end (vanilla JS/HTML/CSS) that talks directly to the services (or through a simple gateway/proxy you configure).
- **Go services** — `users-service/`, `lands/`, `marketplace/` implement application domains and expose HTTP APIs.
- **infra/** — Terraform IaC to provision cloud resources (provider/config to be set by you).

---

## Repository Layout

```
infra/           # Infrastructure as Code (Terraform)
lands/           # Go service (domain: lands)
marketplace/     # Go service (domain: marketplace)
users-service/   # Go service (domain: users/auth)
web-app/         # Frontend (JS/CSS/HTML)
```

---

## Prerequisites

- **Go** ≥ 1.21 (recommended 1.22+)
- **Node.js** ≥ 18 (recommended 20+)
- **Terraform** ≥ 1.5 (recommended 1.6+)
- **Git**
- **Docker** (optional, but useful for DBs/reverse-proxy)

---

## Quick Start (Local Dev)

### 1) Clone

```bash
git clone https://github.com/pmacoutinho/greensquare-projectFiles.git
cd greensquare-projectFiles
```

### 2) Configure environment

Create per-service `.env` files (see [Environment Variables](#environment-variables)). Example:

```bash
cp users-service/.env.example users-service/.env  # if present
cp lands/.env.example lands/.env                  # if present
cp marketplace/.env.example marketplace/.env      # if present
```

If you use a local DB, spin it up (Docker example for Postgres):

```bash
docker run --name gsq-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=greensquare -d postgres:16
```

### 3) Run backend services

From the repo root:

```bash
# Users
(cd users-service && go mod tidy && go run ./...)

# Lands
(cd lands && go mod tidy && go run ./...)

# Marketplace
(cd marketplace && go mod tidy && go run ./...)
```

> If the services define `main.go` at the folder root you can also `go run .`.

### 4) Run the frontend

If `web-app/` has a package.json:

```bash
cd web-app
npm install
npm run dev   # or npm start / npm run serve
```

If it’s a static site without Node tooling:

```bash
cd web-app
python -m http.server 5173    # or use any static server
```

Open the printed URL (e.g., http://localhost:5173).

---

## Infrastructure (Terraform)

> The `infra/` folder contains Terraform configuration. Configure your cloud provider (e.g., AWS/GCP/Azure) and credentials before applying.

```bash
cd infra
terraform init

# Optional: select a workspace for dev/stage/prod
terraform workspace new dev || true
terraform workspace select dev

# Review and apply
terraform plan -out tfplan
terraform apply tfplan
```

**Notes**

- Store sensitive values in a **tfvars** file or a secure secret manager.
- Use remote state (e.g., S3 + DynamoDB, Google Cloud Storage, Azure Storage) for team collaboration.
- Tag resources and separate environments by workspace/folders.

---

## Development Workflow

- **Go formatting:** `gofmt -w .`
- **Live reload (optional):** use [`air`](https://github.com/cosmtrek/air) or similar during development.
- **Git branching:** `main` stays clean; use feature branches and PRs.
- **Commits:** conventional commits (e.g., `feat:`, `fix:`, `chore:`) are encouraged.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-thing`
2. Make changes with tests where reasonable.
3. Run formatters/linters.
4. Open a PR describing the change and how to test it.
