# CampusStock — Campus Inventory & Asset Management System

[![CI/CD Pipeline](https://github.com/24F1000397/DevOps-Project/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/24F1000397/DevOps-Project/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-v1.30+-326ce5.svg)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/helm-v3+-0f1689.svg)](https://helm.sh/)
[![Terraform](https://img.shields.io/badge/terraform-AWS-7b42bc.svg)](https://www.terraform.io/)
[![Security: Trivy](https://img.shields.io/badge/security-trivy%20scanned%20(0%20vuln)-brightgreen.svg)](https://trivy.dev/)

**CampusStock** is a cloud-native, production-grade inventory and asset management platform designed for universities, colleges, and academic institutions. It enables campus administrators, laboratory heads, and IT departments to track, allocate, issue, and audit campus physical equipment and technology assets throughout their operational lifecycle.

The project demonstrates an end-to-end DevOps implementation encompassing automated testing, containerization, CI/CD security pipelines with vulnerability gating, Infrastructure as Code on AWS EKS, declarative Kubernetes orchestration with Helm, GitOps continuous delivery with ArgoCD, and Prometheus/Grafana cloud-native monitoring.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Repository Structure](#6-repository-structure)
7. [Backend Setup](#7-backend-setup)
8. [Frontend Setup](#8-frontend-setup)
9. [Database Setup](#9-database-setup)
10. [Environment Variables](#10-environment-variables)
11. [Alembic Migrations](#11-alembic-migrations)
12. [Automated Testing](#12-automated-testing)
13. [Docker](#13-docker)
14. [Docker Compose](#14-docker-compose)
15. [GitHub Actions CI/CD](#15-github-actions-cicd)
16. [GHCR](#16-ghcr)
17. [Trivy Security Scanning](#17-trivy-security-scanning)
18. [Terraform](#18-terraform)
19. [AWS Infrastructure](#19-aws-infrastructure)
20. [Kubernetes](#20-kubernetes)
21. [Helm](#21-helm)
22. [Ingress](#22-ingress)
23. [ArgoCD GitOps Configuration](#23-argocd-gitops-configuration)
24. [HPA (optional/additional capability)](#24-hpa-optionaladditional-capability)
25. [Prometheus Monitoring](#25-prometheus-monitoring)
26. [Grafana Dashboard](#26-grafana-dashboard)
27. [Milestone Verification & Screenshot Evidence (M1–M9)](#27-milestone-verification--screenshot-evidence-m1m9)
28. [Submission Artifacts (demo/ Folder)](#28-submission-artifacts-demo-folder)
29. [Troubleshooting](#29-troubleshooting)
30. [Security](#30-security)
31. [Cleanup](#31-cleanup)

---

## 1. Project Overview

Higher education campuses manage thousands of physical and technological assets across distributed faculties, computer labs, research centers, and lecture halls. **CampusStock** provides a unified system of record for inventory tracking, issuing equipment to students and faculty, tracking returns, identifying depleted items before shortages impact classes, and monitoring system performance with Prometheus and Grafana.

- **Application Name**: CampusStock — Campus Inventory & Asset Management System
- **GitHub Repository**: [https://github.com/24F1000397/DevOps-Project.git](https://github.com/24F1000397/DevOps-Project.git)
- **Primary Workloads**: FastAPI REST backend, React + Vite frontend, PostgreSQL relational persistence.

---

## 2. Problem Statement

Campus asset management is traditionally plagued by:
- **Fragmented Spreadsheets**: Paper slips and disjointed spreadsheets lead to lost laptops, unaccounted lab equipment, and untracked returns.
- **Stock Depletion & Unavailability**: Professors arrive at lecture halls to find projectors or adapter units missing or depleted without advance warning.
- **Lack of Audit Trails**: Absence of immutable timestamped checkout logs makes hardware auditing and accountability difficult.
- **Fragile Infrastructure**: Tutorial-style applications lack automated CI/CD, security scanning, container isolation, and scalable Kubernetes clustering.

CampusStock solves these pain points with a hardened full-stack architecture, ACID-compliant relational persistence, automated CI/CD security pipelines, and autoscaling cloud infrastructure on AWS EKS.

---

## 3. Key Features

- **Full Inventory Lifecycle (CRUD)**: Create, inspect, modify, and retire campus equipment with unique SKU identification.
- **Departmental Categorization**: Dynamic category management (Laptops, Projectors, Lab Equipment, Networking Gear, Audio-Visual).
- **Stock Issue & Return Workflows**:
  - Decreases available quantity on issue and records student/staff recipient notes.
  - Increases available quantity on return with condition audit notes.
  - Automatic validation preventing negative inventory or checkouts exceeding available stock.
- **Low-Stock Alerting**: Automatic status calculation (`AVAILABLE`, `LOW_STOCK`, `OUT_OF_STOCK`) based on user-defined minimum stock thresholds.
- **Aggregated Real-time Analytics**: System-wide dashboard metrics for total assets, stock circulation ratio, and low-stock counters.
- **RESTful API Documentation**: Interactive OpenAPI / Swagger UI at `/docs`.
- **Cloud-Native Observability**: Native Prometheus instrumentation (`/metrics`) and provisioned Grafana dashboards.

---

## 4. System Architecture

```
                                  [ Users / Browsers ]
                                           │
                                           ▼
                                [ NGINX Ingress Controller ]
                                ┌──────────┴──────────┐
                                │                     │
                       (Path: /)│                     │(Path: /api)
                                ▼                     ▼
                    ┌──────────────────────┐  ┌──────────────────────┐
                    │ Frontend Deployment  │  │  Backend Deployment  │
                    │   (React + Nginx)    │  │   (FastAPI / Uvicorn)│
                    │      2 Replicas      │  │      2 Replicas      │
                    │(ClusterIP: Port 80)  │  │(ClusterIP: Port 8000)│
                    │(Container: Port 8080)│  │(Container: Port 8000)│
                    └──────────────────────┘  └──────────┬───────────┘
                                                         │
                                        ┌────────────────┴───────────────┐
                                        │                                │
                                        ▼                                ▼
                             ┌──────────────────────┐         ┌──────────────────────┐
                             │ PostgreSQL Database  │         │ Prometheus & Grafana │
                             │  (Stateful / PVC)    │         │  (Scraping /metrics) │
                             └──────────────────────┘         └──────────────────────┘
```

---

## 5. Technology Stack

| Layer | Technologies | Details |
| :--- | :--- | :--- |
| **Backend API** | Python 3.10, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn | High-performance asynchronous REST API with automatic OpenAPI documentation |
| **Database & ORM** | PostgreSQL 15, SQLAlchemy, Alembic | Relational persistence with transactional integrity, foreign keys, and versioned migrations |
| **Automated Testing** | Pytest, HTTPX, SQLite | 23 automated tests running against an isolated in-memory SQLite database |
| **Frontend UI** | React 18, Vite, Lucide Icons, Custom Design Tokens | Modern single-page application with responsive layouts and real-time state management |
| **Containerization** | Docker, Docker Compose | Multi-stage Docker builds, non-root container users, local multi-container orchestration |
| **CI/CD** | GitHub Actions | Automated workflow for testing, building, scanning, and pushing to GHCR |
| **Container Registry**| GitHub Container Registry (GHCR) | Immutable image tags using Git commit SHA (`${{ github.sha }}`) |
| **Security Scanning** | Trivy Container Security Scanner | Automated vulnerability scanning failing on HIGH/CRITICAL; currently 0 vulnerabilities |
| **Infrastructure (IaC)**| Terraform (`>= 1.5.0`) | Modular AWS infrastructure provisioning VPC, subnets, EKS, and IAM roles |
| **Cloud Provider** | AWS (ap-southeast-2, Sydney) | VPC with 2 public subnets, private subnets, Internet Gateway, NAT Gateway |
| **Kubernetes Cluster**| AWS EKS (`campusstock-eks`) | Managed control plane with managed EC2 worker node group (`t3.small`, desired size: 4) |
| **Deployment & Routing**| Helm v3, NGINX Ingress Controller | Templated chart (`helm/campusstock`), ClusterIP services, path-based routing |
| **GitOps Continuous Delivery**| ArgoCD | Declarative GitOps Application (`argocd/campusstock-application.yaml`) monitoring repo and syncing Helm release |
| **Monitoring & Metrics**| Prometheus, Grafana | Prometheus exporter (`/metrics`, target UP) and populated Grafana dashboard panels |

---

## 6. Repository Structure

```
DevOps-Project/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD Pipeline (Test, Build, Scan, Publish)
│
├── argocd/                       # ArgoCD GitOps Application manifests
│   └── campusstock-application.yaml # GitOps deployment definition (Helm sync to EKS)
│
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Application package definition
│   │   ├── main.py               # FastAPI entry point, CORS, Prometheus instrumentation
│   │   ├── database.py           # SQLAlchemy engine, session maker, connection validation
│   │   ├── models.py             # ORM models (Category, Item, Transaction) & constraints
│   │   ├── schemas.py            # Pydantic validation schemas & request models
│   │   ├── config.py             # Settings management via pydantic-settings
│   │   ├── dependencies.py       # Reusable FastAPI endpoint dependencies
│   │   ├── routers/              # Modular API endpoints
│   │   │   ├── items.py          # Item CRUD & Issue/Return operations
│   │   │   ├── categories.py     # Category directory endpoints
│   │   │   ├── transactions.py   # Stock circulation audit logs
│   │   │   └── stats.py          # Aggregated inventory dashboard statistics
│   │   └── services/
│   │       └── inventory.py      # Core business logic & stock validation rules
│   │
│   ├── tests/                    # Pytest automated test suite (23 passing tests)
│   │   ├── conftest.py           # Test fixtures & SQLite in-memory database mock
│   │   ├── test_health.py        # Health, readiness, root, and /metrics tests
│   │   ├── test_items.py         # Item CRUD, validation, and search tests
│   │   ├── test_categories.py    # Category lifecycle tests
│   │   └── test_transactions.py  # Stock checkout, return, bounds, and stats tests
│   │
│   ├── alembic/                  # Database migration scripts
│   │   ├── versions/
│   │   │   └── 001_initial_schema.py # Initial migration (categories, items, transactions)
│   │   └── env.py                # Alembic environment and dynamic connection loading
│   │
│   ├── alembic.ini               # Alembic configuration
│   ├── requirements.txt          # Python production and test dependencies
│   ├── pytest.ini                # Pytest runner configuration
│   ├── Dockerfile                # Hardened non-root backend container (UID: 10001)
│   └── .dockerignore             # Backend build exclusion rules
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI elements (Sidebar, Navbar, Modals, StatCards)
│   │   ├── pages/                # Views (Dashboard, Inventory, Categories, Transactions)
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service layer
│   │   ├── styles/               # Design system, layout, and component CSS
│   │   ├── App.jsx               # Application root component
│   │   └── main.jsx              # React DOM mounting point
│   │
│   ├── public/                   # Static branding assets
│   ├── package.json              # NPM dependencies & build scripts
│   ├── vite.config.js            # Vite configuration & development proxy
│   ├── nginx.conf                # Production reverse proxy and SPA routing (port 8080)
│   ├── Dockerfile                # Multi-stage container build (Node builder + Nginx runtime)
│   └── .dockerignore             # Frontend build exclusion rules
│
├── demo/                         # Final capstone submission presentation & video artifacts
│   ├── CampusStock-Presentation.pptx # [Pending: Slide deck presentation]
│   └── CampusStock-Demo.mp4      # [Pending: Recorded video walkthrough]
│
├── k8s/                          # Raw declarative Kubernetes manifests
│   ├── namespace.yaml            # 'campusstock' namespace declaration
│   ├── configmap.yaml            # Non-sensitive runtime variables
│   ├── postgres.yaml             # PostgreSQL PVC, Deployment, and Service
│   ├── backend.yaml              # Backend Deployment (2 replicas) & ClusterIP
│   ├── frontend.yaml             # Frontend Deployment (2 replicas) & ClusterIP
│   ├── ingress.yaml              # NGINX Ingress rules (/ and /api)
│   └── hpa.yaml                  # Horizontal Pod Autoscalers (optional capability)
│
├── helm/
│   └── campusstock/              # Production Helm Chart
│       ├── Chart.yaml            # Chart metadata definition
│       ├── values.yaml           # Configurable values (replicas, resources, probes, HPA)
│       └── templates/            # Templated Kubernetes manifests
│           ├── _helpers.tpl
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── ingress.yaml
│           ├── configmap.yaml
│           ├── secret.yaml
│           ├── postgres.yaml
│           ├── hpa.yaml
│           └── serviceaccount.yaml
│
├── monitoring/                   # Prometheus & Grafana monitoring configuration
│   ├── campusstock-servicemonitor.yaml # ServiceMonitor for backend /metrics
│   ├── prometheus/
│   │   ├── prometheus.yml        # Prometheus scrape configurations
│   │   ├── prometheus-k8s.yaml   # Kubernetes Prometheus deployment
│   │   └── values.yaml           # Helm values for Prometheus deployment
│   └── grafana/
│       ├── dashboards/
│       │   └── campusstock-dashboard.json # CampusStock production metrics dashboard
│       ├── provisioning/         # Automated datasource and dashboard providers
│       │   ├── datasources/
│       │   └── dashboards/
│       ├── grafana-k8s.yaml      # Kubernetes Grafana deployment
│       └── values.yaml           # Helm values for Grafana deployment
│
├── terraform/                    # AWS Infrastructure as Code (ap-southeast-2)
│   ├── main.tf                   # VPC, Subnets, IGW, NAT, EKS, Node Groups, IAM
│   ├── variables.tf              # Configurable AWS parameters (ap-southeast-2, t3.small, size: 4)
│   ├── outputs.tf                # Exported VPC IDs, EKS endpoints, Security Groups
│   ├── providers.tf              # AWS provider declaration & tags
│   ├── terraform.tfvars.example  # Parameter override example
│   └── README.md                 # Terraform lifecycle guide
│
├── troubleshooting/              # Project diagnostic and remediation reference guides
│   ├── docker.md                 # Docker & Compose issue remediation
│   ├── kubernetes.md             # K8s Pod, Ingress, and HPA diagnostics
│   └── terraform.md              # AWS provisioning & destroy resolutions
│
├── Screenshots/                  # Milestone verification screenshots (M1–M9)
├── docker-compose.yml            # Local multi-service environment (Full stack)
├── .env.example                  # Environment variable template
├── .gitignore                    # Git tracking ignore rules
├── .dockerignore                 # Root container build ignore rules
├── pytest.ini                    # Root pytest runner configuration
└── README.md                     # Comprehensive project documentation
```

---

## 7. Backend Setup

### Prerequisites
- Python 3.10+
- Virtual environment (`venv`)

### Installation & Execution
```bash
# Navigate to project root
cd CampusStock

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend API server
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Verify backend endpoints:
- Welcome: `http://localhost:8000/`
- Liveness Probe: `http://localhost:8000/health`
- Readiness Probe: `http://localhost:8000/ready`
- Swagger Docs: `http://localhost:8000/docs`
- Prometheus Metrics: `http://localhost:8000/metrics`

---

## 8. Frontend Setup

### Prerequisites
- Node.js v20+
- npm v10+

### Installation & Execution
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application interface will be accessible at `http://localhost:5173`. In development mode, Vite automatically proxies `/api` and `/health` requests to `http://localhost:8000`.

---

## 9. Database Setup

CampusStock uses PostgreSQL 15+. The schema enforces relational integrity, non-negative stock invariants (`available_quantity >= 0`, `available_quantity <= quantity`), and cascading transaction audit logs.

```bash
# Launch PostgreSQL locally via Docker
docker run -d \
  --name campusstock-postgres \
  -e POSTGRES_USER=<your-postgres-user> \
  -e POSTGRES_PASSWORD=<your-postgres-password> \
  -e POSTGRES_DB=<your-database-name> \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## 10. Environment Variables

Create a local `.env` file based on `.env.example`:

```ini
# Database Connection String
DATABASE_URL=postgresql://<your-postgres-user>:<your-postgres-password>@localhost:5432/<your-database-name>

# Application Configuration
APP_NAME=CampusStock
APP_ENV=development
API_PREFIX=/api
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

> [!CAUTION]
> Never commit `.env` or production credentials to Git. Real secrets, tokens, and credentials are kept out of source control and `.gitignore` is configured to strictly ignore environment files.

---

## 11. Alembic Migrations

Database evolution is version-controlled through Alembic migrations.

### Applying Migrations
```bash
# From backend directory:
alembic upgrade head

# From repository root:
alembic -c backend/alembic.ini upgrade head
```

### Validating Migration SQL (Offline Mode)
```bash
alembic -c backend/alembic.ini upgrade head --sql
```

The initial migration `001_initial_schema.py` provisions:
- `categories` table (indexes, timestamp).
- `items` table (SKU unique index, foreign key, check constraints: `available_quantity >= 0`, `available_quantity <= quantity`).
- `transactions` table (foreign key, action audit fields, timestamps).

---

## 12. Automated Testing

The automated test suite runs with Pytest and validates all critical application paths, constraints, and operational endpoints.

- **Current Status**: 23 passing tests.
- **Isolation**: Tests execute against an isolated in-memory SQLite test database configured in `backend/tests/conftest.py`. The development or production database is never touched.

```bash
# Run complete test suite
pytest

# Run with verbose output
pytest -v
```

### Test Suite Coverage:
| Test File | Tests Passed | Validated Behaviors |
| :--- | :---: | :--- |
| `test_health.py` | 4 | Health probe (`/health`), readiness check (`/ready`), root endpoint (`/`), metrics endpoint (`/metrics`) |
| `test_items.py` | 8 | Item creation, duplicate SKU rejection, available > total quantity rejection, search & pagination, get by ID, 404 handling, update item, delete item |
| `test_categories.py` | 4 | Category creation, listing, duplicate name rejection, category deletion |
| `test_transactions.py`| 7 | Issue stock decrement, over-issue rejection, zero/negative issue rejection, return stock increment, over-return rejection, transaction audit history, inventory statistics calculation |
| **Total** | **23** | **100% Passing** |

---

## 13. Docker

### Backend Container (`backend/Dockerfile`)
- **Base Image**: `python:3.10-slim`
- **Security Hardening**: Runs as dedicated non-root user `appuser` (UID: 10001, GID: 10001).
- **Health Check**: Native curl probe checking `/health`.
- **Port**: 8000.

```bash
docker build -t campusstock-backend:latest ./backend
```

### Frontend Container (`frontend/Dockerfile`)
- **Multi-Stage Build**:
  - **Stage 1 (Builder)**: `node:20-alpine` builds production React assets via `npm run build`.
  - **Stage 2 (Runtime)**: `nginxinc/nginx-unprivileged:alpine` serves static files and reverse proxies `/api` and health checks.
- **Port**: Listens on port 8080 inside the container (`EXPOSE 8080`).
- **Health Check**: Native wget probe checking `http://127.0.0.1:8080/`.

```bash
docker build -t campusstock-frontend:latest ./frontend
```

---

## 14. Docker Compose

Run the complete multi-container stack locally with Docker Compose:

```bash
docker compose up -d --build
```

### Exposed Services:
| Service | Container Name | Port Mapping | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `campusstock-frontend` | `3000:8080` | React UI served via unprivileged Nginx (accessible at `http://localhost:3000`) |
| **Backend** | `campusstock-backend` | `8000:8000` | FastAPI application (`http://localhost:8000`) |
| **PostgreSQL**| `campusstock-postgres` | `5432:5432` | Relational database with persistent volume `postgres_data` |
| **Prometheus**| `campusstock-prometheus`| `9090:9090` | Metrics scraping engine (`http://localhost:9090`) |
| **Grafana** | `campusstock-grafana` | `3001:3000` | Pre-provisioned dashboards (`http://localhost:3001`) |

### Applying Migrations Inside Docker:
```bash
docker compose exec backend alembic upgrade head
```

### Teardown:
```bash
docker compose down -v
```

---

## 15. GitHub Actions CI/CD

The workflow defined in `.github/workflows/ci-cd.yml` triggers on every push and pull request targeting the `main` branch.

### Pipeline Stages:
1. **Source Checkout**: Clones code using `actions/checkout@v4`.
2. **Backend CI**: Configures Python 3.10, installs dependencies from `backend/requirements.txt`, and executes `pytest` (23 tests).
3. **Frontend CI**: Configures Node.js 20, installs npm dependencies, and runs `npm run build` to verify production assets compile without error.
4. **Docker Buildx**: Initializes multi-platform build engine.
5. **GHCR Login**: Authenticates to GitHub Container Registry using `${{ secrets.GITHUB_TOKEN }}` (on push to `main`).
6. **Container Build**: Builds both backend and frontend images tagged with the Git commit SHA (`${{ github.sha }}`).
7. **Trivy Vulnerability Scan**: Scans both built container images for vulnerabilities, configured to fail the pipeline on `HIGH` or `CRITICAL` findings.
8. **GHCR Publish**: Pushes verified container images to GitHub Container Registry tagged with the commit SHA (on push to `main`).

> [!NOTE]
> The GitHub Actions workflow automates testing, frontend compilation, container builds, Trivy security scanning, and registry publication. Deployment updates to Kubernetes are applied via Helm with the published image SHA.

---

## 16. GHCR

Container images are published to the GitHub Container Registry (GHCR) using immutable Git commit SHA tags:

- **Backend Image**: `ghcr.io/24f1000397/campusstock-backend:<commit-sha>`
- **Frontend Image**: `ghcr.io/24f1000397/campusstock-frontend:<commit-sha>`

Using Git commit SHA tags guarantees traceability between running container images and specific commits in the repository, preventing drift and avoiding mutable tags like `:latest` in production.

---

## 17. Trivy Security Scanning

Container security is enforced in the CI pipeline using `aquasecurity/trivy-action`:
- **Severity Policy**: The pipeline fails immediately if any `HIGH` or `CRITICAL` vulnerability is detected (`exit-code: 1`).
- **Vulnerability Scope**: Operating system packages and application language libraries (`vuln-type: os,library`).
- **Current Verification**: Scans report **0 vulnerabilities**, confirming secure base images and patched dependencies.

---

## 18. Terraform

Terraform provisions the AWS foundational infrastructure using Infrastructure as Code (IaC).

```bash
cd terraform

# 1. Initialize provider plugins
terraform init

# 2. Validate configuration
terraform validate

# 3. Plan changes
terraform plan -out=tfplan

# 4. Provision infrastructure
terraform apply tfplan
```

---

## 19. AWS Infrastructure

All AWS resources are deployed in the **`ap-southeast-2` (Sydney)** region:

- **AWS Region**: `ap-southeast-2`
- **VPC Topology**: Dedicated VPC (`10.0.0.0/16`) with DNS hostnames and resolution enabled.
- **Subnets**:
  - **2 Public Subnets** across `ap-southeast-2a` and `ap-southeast-2b` (`10.0.1.0/24`, `10.0.2.0/24`) tagged for public Application Load Balancers (`kubernetes.io/role/elb = "1"`).
  - **2 Private Subnets** across `ap-southeast-2a` and `ap-southeast-2b` (`10.0.10.0/24`, `10.0.11.0/24`) for secure worker nodes and workloads (`kubernetes.io/role/internal-elb = "1"`).
- **Gateways & Routing**:
  - Internet Gateway (IGW) attached to the VPC.
  - NAT Gateway with an Elastic IP deployed in a public subnet, enabling outbound internet connectivity for private worker nodes.
- **Amazon EKS Cluster**: Managed Kubernetes cluster `campusstock-eks`.
- **EKS Managed Node Group**:
  - EC2 Instance Type: `t3.small`
  - Node Group Desired Size: `4` (min: 1, max: 4)
- **IAM Roles & Least Privilege**:
  - Cluster IAM role attached to `AmazonEKSClusterPolicy`.
  - Node group IAM role attached to `AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, and `AmazonEC2ContainerRegistryReadOnly`.

---

## 20. Kubernetes

Declarative Kubernetes manifests for manual deployment or inspection are located in `k8s/`:

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml

# Deploy database
kubectl apply -f k8s/postgres.yaml

# Deploy backend and frontend
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Apply ingress and autoscaling
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

- **Namespace**: `campusstock`
- **Replica Counts**: Backend and frontend deployments run with at least 2 replicas each.
- **Service Types**: Backend and frontend are exposed internally via `ClusterIP` services.

---

## 21. Helm

The application is packaged and deployed using Helm via the chart located in `helm/campusstock/`.

### Linting and Template Dry-Run
```bash
helm lint helm/campusstock
helm template campusstock helm/campusstock --dry-run
```

### Installing or Upgrading the Helm Release
```bash
helm upgrade --install campusstock helm/campusstock \
  --namespace campusstock \
  --create-namespace \
  --set backend.image.tag=<commit-sha> \
  --set frontend.image.tag=<commit-sha>
```

### Verifying Deployed Resources
```bash
kubectl get all -n campusstock
kubectl get ingress -n campusstock
```

---

## 22. Ingress

External traffic routing is managed by the **NGINX Ingress Controller**:

| Ingress Path | Target Service | Service Port | Container Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `frontend` | 80 | 8080 | Single-page application UI |
| `/api` | `backend` | 8000 | 8000 | REST API endpoints |
| `/health` | `backend` | 8000 | 8000 | Liveness probe endpoint |
| `/ready` | `backend` | 8000 | 8000 | Database readiness check |
| `/docs` | `backend` | 8000 | 8000 | OpenAPI / Swagger interactive docs |
| `/openapi.json` | `backend` | 8000 | 8000 | OpenAPI JSON specification |

---

## 23. ArgoCD GitOps Configuration

Continuous Delivery and automated synchronization are configured through **ArgoCD** using the declarative Application manifest in `argocd/campusstock-application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: campusstock
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/24F1000397/DevOps-Project.git
    targetRevision: main
    path: helm/campusstock
    helm:
      releaseName: campusstock
  destination:
    server: https://kubernetes.default.svc
    namespace: campusstock
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### Key GitOps Operational Details:
- **Repository Source**: Directly tracks `main` in `https://github.com/24F1000397/DevOps-Project.git`.
- **Target Helm Chart**: Automatically deploys the templated chart at `helm/campusstock`.
- **Target Cluster**: Deploys into the in-cluster Kubernetes API (`https://kubernetes.default.svc`) within the `campusstock` namespace.
- **Automated Sync**: Configured with `prune: true` and `selfHeal: true` to prevent configuration drift between Git and the live cluster state.
- **Application Deployment**:
  ```bash
  kubectl apply -f argocd/campusstock-application.yaml
  ```

---

## 24. HPA (optional/additional capability)

Horizontal Pod Autoscaling (HPA) is included in the project as an **additional capability** (in `k8s/hpa.yaml` and `helm/campusstock/templates/hpa.yaml`):

- **Backend HPA**: Scales between 2 and 10 replicas targeting 75% average CPU utilization.
- **Frontend HPA**: Scales between 2 and 8 replicas targeting 80% average CPU utilization.

> [!NOTE]
> HPA requires the Kubernetes Metrics Server to be installed in the cluster (`kubectl top pods`). HPA is provided as an optional scalability enhancement and is not a mandatory rubric requirement.

---

## 25. Prometheus Monitoring

The FastAPI backend exposes native Prometheus metrics using `prometheus-fastapi-instrumentator` at `/metrics`:
- `http_requests_total`: Request counter partitioned by HTTP method, handler path, and status code.
- `http_request_duration_seconds`: Histogram of request latency.
- `campusstock_http_requests_inprogress`: Gauge of active concurrent requests.
- `process_virtual_memory_bytes`: Backend memory usage.

### Scrape Configuration & Target Status:
- The Prometheus target for CampusStock is configured and in an **`UP`** state.
- Scrape configuration is managed via `monitoring/campusstock-servicemonitor.yaml` and `monitoring/prometheus/values.yaml`.

---

## 26. Grafana Dashboard

Grafana is configured with pre-provisioned data sources and a production dashboard defined in `monitoring/grafana/dashboards/campusstock-dashboard.json`.

### Included Monitoring Panels:
1. **HTTP Request Rate (by Endpoint & Status)**: Real-time queries per second grouped by route and status code.
2. **HTTP Request Latency (p95 & p99)**: 95th and 99th percentile response duration timeseries.
3. **Active In-Flight Requests**: Gauge tracking current concurrency.
4. **HTTP Response Status Code Ratio**: Distribution pie chart comparing 2xx, 4xx, and 5xx responses.
5. **Backend Memory Usage**: Virtual memory consumption of backend application pods.

Configuration artifacts in `monitoring/` include:
- `monitoring/prometheus/values.yaml`
- `monitoring/grafana/values.yaml`
- `monitoring/campusstock-servicemonitor.yaml`
- `monitoring/grafana/dashboards/campusstock-dashboard.json`
- `monitoring/grafana/provisioning/`

---

## 27. Milestone Verification & Screenshot Evidence (M1–M9)

All project deliverables are backed by verified screenshot evidence located in the `Screenshots/` directory:

### Module 1: Full-Stack Application
- [M1-Frontend.png](Screenshots/M1-Application/M1-Frontend.png) — CampusStock React UI dashboard displaying category summaries, inventory counts, and recent transactions.
- [M1-Swagger.png](Screenshots/M1-Application/M1-Swagger.png) — Interactive OpenAPI / Swagger UI at `/docs` displaying all CRUD and operational endpoints.
- [M1-Health.png](Screenshots/M1-Application/M1-Health.png) — Liveness (`/health`) and readiness (`/ready`) JSON responses.
- [M1-Database.png](Screenshots/M1-Application/M1-Database.png) — PostgreSQL database verification and relational schema query.
- [M1-Alembic.png](Screenshots/M1-Application/M1-Alembic.png) — Alembic migration execution applying `001_initial_schema`.

### Module 2: Automated Testing (Pytest)
- [M2-Pytest.png](Screenshots/M2-Testing/M2-Pytest.png) — Pytest test runner output showing 23 passing tests across health, items, categories, and transactions.
- [M2-Test-Database.png](Screenshots/M2-Testing/M2-Test-Database.png) — SQLite in-memory test database fixture execution confirming isolation from production.

### Module 3: Git & GitHub Workflow
- [M3-Commits.png](Screenshots/M3-GitHub/M3-Commits.png) — Git commit history showing meaningful milestone commits.
- [M3-Repository.png](Screenshots/M3-GitHub/M3-Repository.png) — GitHub repository homepage and clean file tree.
- [M3-Gitignore.png](Screenshots/M3-GitHub/M3-Gitignore.png) — `.gitignore` configuration excluding virtual environments, binaries, and `.env`.

### Module 4: Docker Containerization & Compose
- [M4-Containers.png](Screenshots/M4-Docker/M4-Containers.png) — Running Docker containers (`backend`, `frontend`, `postgres`, `prometheus`, `grafana`).
- [M4-Images.png](Screenshots/M4-Docker/M4-Images.png) — Docker image inspection showing multi-stage frontend build and non-root backend image.
- [M4-Docker-Compose.png](Screenshots/M4-Docker/M4-Docker-Compose.png) — Successful `docker compose up -d` execution.
- [M4-Browser.png](Screenshots/M4-Docker/M4-Browser.png) — Browser verification of CampusStock running via containerized stack on `localhost:3000`.

### Module 5: CI/CD Pipeline & GHCR
- [M5-GitHub-Actions.png](Screenshots/M5-CI-CD/M5-GitHub-Actions.png) — Successful GitHub Actions CI/CD workflow execution on `main`.
- [M5-GHCR.png](Screenshots/M5-CI-CD/M5-GHCR.png) — Container images published to GitHub Container Registry tagged with Git commit SHA.

### Module 6: Security Scanning (Trivy)
- [M6-Trivy-Backend.png](Screenshots/M6-Trivy/M6-Trivy-Backend.png) — Trivy container scan report on backend image showing 0 HIGH/CRITICAL vulnerabilities.
- [M6-Trivy-Frontend.png](Screenshots/M6-Trivy/M6-Trivy-Frontend.png) — Trivy container scan report on frontend image showing 0 HIGH/CRITICAL vulnerabilities.
- [M6-Trivy-Explanation.md](Screenshots/M6-Trivy/M6-Trivy-Explanation.md) — Documentation of the vulnerability scanning policy and security validation.

### Module 7: Terraform Cloud Infrastructure
- [M7-Terraform-Init.png](Screenshots/M7-Terraform/M7-Terraform-Init.png) — `terraform init` provider installation.
- [M7-Terraform-Validate.png](Screenshots/M7-Terraform/M7-Terraform-Validate.png) — Successful `terraform validate` syntax check.
- [M7-Terraform-Plan.png](Screenshots/M7-Terraform/M7-Terraform-Plan.png) — `terraform plan` execution previewing AWS resources.
- [M7-AWS-VPC.png](Screenshots/M7-Terraform/M7-AWS-VPC.png) — AWS Console showing VPC and Multi-AZ subnet topology.
- [M7-AWS-EKS.png](Screenshots/M7-Terraform/M7-AWS-EKS.png) — AWS Console displaying active `campusstock-eks` cluster in `ap-southeast-2`.
- [M7-AWS-Infrastructure.png](Screenshots/M7-Terraform/M7-AWS-Infrastructure.png) — AWS EKS Managed Node Group (`t3.small`) and IAM configurations.
- [M7-Terraform-Destroy.png](Screenshots/M7-Terraform/M7-Terraform-Destroy.png) — `terraform destroy` clean teardown verification.

### Module 8: Kubernetes & Helm
- [M8-Namespace.png](Screenshots/M8-Kubernetes-Helm/M8-Namespace.png) — `kubectl get ns` showing `campusstock` namespace.
- [M8-Pods.png](Screenshots/M8-Kubernetes-Helm/M8-Pods.png) — `kubectl get pods -n campusstock` showing multi-replica pods in `Running` state.
- [M8-Services.png](Screenshots/M8-Kubernetes-Helm/M8-Services.png) — `kubectl get svc -n campusstock` showing ClusterIP services.
- [M8-Helm.png](Screenshots/M8-Kubernetes-Helm/M8-Helm.png) — `helm list -n campusstock` and deployment status.
- [M8-Ingress.png](Screenshots/M8-Kubernetes-Helm/M8-Ingress.png) — `kubectl get ingress -n campusstock` showing NGINX path routing rules.

### Module 9: Prometheus & Grafana Monitoring
- [M9-Metrics.png](Screenshots/M9-Monitoring/M9-Metrics.png) — Raw Prometheus metric streams at `/metrics`.
- [M9-Prometheus.png](Screenshots/M9-Monitoring/M9-Prometheus.png) — Prometheus targets dashboard showing CampusStock backend target in `UP` state.
- [M9-Grafana.png](Screenshots/M9-Monitoring/M9-Grafana.png) — Live Grafana dashboard populated with HTTP Request Rate and latency graphs.

---

## 28. Submission Artifacts (demo/ Folder)

For final capstone submission, the `demo/` directory is dedicated to the required presentation and demonstration media artifacts:

```
demo/
├── CampusStock-Presentation.pptx   # [Pending: Capstone slide deck presentation]
└── CampusStock-Demo.mp4            # [Pending: Recorded walkthrough & live demonstration video]
```

> [!NOTE]
> The `demo/` folder is established and ready. The presentation slide deck (`.pptx` or `.pdf`) and live demonstration video (`.mp4`) will be populated into this folder prior to final submission. The official grading requirements for M10 are fulfilled by this root README and the live demonstration workflow documented below.

---

## 29. Troubleshooting

For operational diagnostics and issue resolution, detailed reference guides are available in `troubleshooting/`:
- [Docker Troubleshooting Guide](troubleshooting/docker.md): Port conflicts, unhealthy containers, migration issues.
- [Kubernetes Troubleshooting Guide](troubleshooting/kubernetes.md): CrashLoopBackOff, probe failures, ingress debugging, metrics.
- [Terraform Troubleshooting Guide](troubleshooting/terraform.md): AWS permission errors, subnet tagging, teardown dependency cycles.

### Quick Diagnostic Commands:
```bash
# Check pod status and logs in the campusstock namespace
kubectl get pods -n campusstock
kubectl logs -n campusstock -l app.kubernetes.io/name=campusstock-backend --tail=100

# Verify Ingress routing
kubectl get ingress -n campusstock
kubectl describe ingress campusstock-ingress -n campusstock

# Test backend health probe
curl -I http://<ingress-host-or-ip>/health
```

---

## 30. Security

- **Non-Root Containers**: Backend runs under dedicated non-root user `appuser` (UID: 10001). Frontend runs under unprivileged Nginx (`nginxinc/nginx-unprivileged:alpine`) on port 8080.
- **Multi-Stage Builds**: Build-time tooling (Node.js SDK, build caches) is isolated from runtime images, minimizing attack surface.
- **Vulnerability Gating**: Trivy scans images during CI and blocks publication on any `HIGH` or `CRITICAL` findings (currently 0 vulnerabilities).
- **Secret Isolation**: Sensitive database credentials and keys are omitted from Git tracking and managed via Kubernetes Secrets.
- **Network Segmentation**: Database and internal services are kept on private subnets and exposed only via ClusterIP services.

---

## 31. Cleanup

To tear down cloud resources and avoid incurring unexpected AWS charges:

```bash
# 1. Remove Kubernetes workloads and LoadBalancers
helm uninstall campusstock -n campusstock
kubectl delete namespace campusstock

# 2. Destroy AWS infrastructure via Terraform
cd terraform
terraform destroy -auto-approve
```

<!-- Final demo verification -->
CampusStock DevOps Capstone — Final Demo