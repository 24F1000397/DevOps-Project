# Kubernetes & Helm Troubleshooting Guide

This guide covers common Kubernetes operational issues with **CampusStock** across Pod lifecycles, Ingress routing, HPA autoscaling, and Helm releases.

---

## 1. Pods in `CrashLoopBackOff` or `Error` State

### Diagnostic Command
```bash
kubectl get pods -n campusstock
kubectl describe pod <pod-name> -n campusstock
kubectl logs <pod-name> -n campusstock --previous
```

### Common Scenarios & Solutions
- **Database Connection Failure**: The backend container crashes because it cannot resolve `postgres` or credentials in `campusstock-secrets` are mismatched.
  - Verify Secret keys:
    ```bash
    kubectl get secret campusstock-secrets -n campusstock -o yaml
    ```
  - Test internal DNS resolution:
    ```bash
    kubectl run test-dns --rm -i --tty --image=busybox:1.28 --restart=Never -n campusstock -- nslookup postgres
    ```
- **Permission Denied**: The backend container runs as non-root UID 10001 and attempts to write to a root-owned directory.
  - Solution: Use emptyDir or adjust file ownership in the container image.

---

## 2. Readiness Probe Failures (`0/1 Running` or `Unhealthy`)

### Symptom
```
Readiness probe failed: HTTP probe failed with statuscode: 503
```

### Root Cause
The backend `/ready` endpoint checks the database connection (`SELECT 1`). If the database is still initializing or Alembic migrations have not completed, the readiness probe marks the pod unready, preventing ingress traffic from being forwarded to it.

### Solution
1. Ensure the PostgreSQL pod is `1/1 Running`:
   ```bash
   kubectl get pods -l app=postgres -n campusstock
   ```
2. Manually run migrations using a Kubernetes Job or pod exec:
   ```bash
   kubectl exec -it deployment/backend -n campusstock -- alembic upgrade head
   ```

---

## 3. Ingress Routing Issues (`404 Not Found` or `503 Service Unavailable`)

### Symptom
Browsing to the ingress IP or domain returns Nginx `404 Not Found` or `503 Service Temporarily Unavailable`.

### Root Cause
1. **Ingress Controller Missing**: The Kubernetes cluster does not have an active Ingress Controller (e.g. `ingress-nginx`).
   - Check controller status:
     ```bash
     kubectl get pods -n ingress-nginx
     ```
   - Install the NGINX Ingress Controller:
     ```bash
     kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
     ```
2. **Path Matching Precedence**: `/api` must have prefix match precedence over `/`. Ensure `pathType: Prefix` is explicitly configured.

---

## 4. Horizontal Pod Autoscaler (HPA) Shows `<unknown>/75%`

### Symptom
```bash
kubectl get hpa -n campusstock
NAME            REFERENCE                  TARGETS         MINPODS   MAXPODS   REPLICAS
backend-hpa     Deployment/backend         <unknown>/75%   2         10        2
```

### Root Cause
The Kubernetes **Metrics Server** is not installed in the cluster. HPA requires `metrics-server` to query container CPU utilization from the kubelet.

### Solution
1. Install Metrics Server:
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   ```
   *(For Minikube, execute: `minikube addons enable metrics-server`)*
2. Verify CPU metrics are available:
   ```bash
   kubectl top pods -n campusstock
   kubectl top nodes
   ```
3. Ensure pod spec defines `resources.requests.cpu`. HPA cannot calculate percentage utilization without a defined baseline request.

---

## 5. Helm Release Upgrades (`Release exists` or `pending-upgrade`)

### Symptom
```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

### Solution
Roll back or reset the secret holding the release state:
```bash
helm rollback campusstock -n campusstock
# Or purge stuck release:
helm uninstall campusstock -n campusstock
helm upgrade --install campusstock helm/campusstock -n campusstock --create-namespace
```
