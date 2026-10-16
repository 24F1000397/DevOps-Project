# Terraform AWS Infrastructure Troubleshooting Guide

This guide covers common issues encountered when provisioning or destroying AWS infrastructure for **CampusStock** using Terraform in region `ap-south-1`.

---

## 1. Missing AWS Credentials or Expired Session

### Symptom
```
Error: No valid credential sources found
Error: error configuring Terraform AWS Provider: failed to get shared config profile
```

### Root Cause
The AWS CLI has not been configured or the STS temporary session token has expired.

### Solution
1. Verify credential presence:
   ```bash
   aws sts get-caller-identity
   ```
2. Re-authenticate:
   ```bash
   aws configure
   ```
   Provide your AWS Access Key ID, Secret Access Key, and default region `ap-south-1`.

---

## 2. Subnet Tagging for Kubernetes ELB Controllers

### Symptom
```
Failed to create LoadBalancer: could not find any suitable subnets for creating an ELB
```

### Root Cause
AWS Application Load Balancer (ALB) and Classic Load Balancer controllers require specific tags on VPC subnets to automatically discover where to deploy internet-facing or internal load balancers.

### Solution
Ensure `terraform/main.tf` has the following tags:
- **Public Subnets**:
  ```hcl
  "kubernetes.io/role/elb"                    = "1"
  "kubernetes.io/cluster/campusstock-eks"     = "shared"
  ```
- **Private Subnets**:
  ```hcl
  "kubernetes.io/role/internal-elb"           = "1"
  "kubernetes.io/cluster/campusstock-eks"     = "shared"
  ```

---

## 3. EKS Node Group Creation Failure (`AccessDenied` or `EC2 Timeout`)

### Symptom
```
Error: waiting for EKS Node Group (campusstock-eks-node-group) create: unexpected state 'CREATE_FAILED'
NodeCreationFailure: Instances failed to join the kubernetes cluster
```

### Root Cause
1. The worker node IAM role is missing one of the three required managed policies:
   - `AmazonEKSWorkerNodePolicy`
   - `AmazonEKS_CNI_Policy`
   - `AmazonEC2ContainerRegistryReadOnly`
2. Private subnets do not have outbound internet access via a NAT Gateway to reach the EKS public/private control plane endpoint.

### Solution
1. Ensure the NAT Gateway and route table associations in `terraform/main.tf` are applied successfully.
2. Confirm the IAM policy attachments exist and are explicitly referenced in `depends_on` inside `aws_eks_node_group.main`.

---

## 4. `terraform destroy` Dependency Cycles or Stuck Resources

### Symptom
```
Error: error deleting VPC: DependencyViolation: The vpc 'vpc-xxxxxx' has dependencies and cannot be deleted.
```

### Root Cause
Kubernetes services of type `LoadBalancer` or PV EBS volumes created dynamically by Kubernetes outside of Terraform placed ENIs/volumes inside the VPC. AWS will not delete the VPC while external resources exist.

### Solution
1. Before running `terraform destroy`, delete all Kubernetes LoadBalancers and PVCs:
   ```bash
   kubectl delete ingress --all -n campusstock
   kubectl delete service -l type=LoadBalancer -n campusstock
   helm uninstall campusstock -n campusstock
   ```
2. Once external AWS resources are cleaned, execute:
   ```bash
   terraform destroy -auto-approve
   ```
