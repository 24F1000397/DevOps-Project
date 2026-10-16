# CampusStock — AWS Infrastructure with Terraform

This directory provides the Infrastructure as Code (IaC) configuration for deploying the **CampusStock** production-grade cloud environment on Amazon Web Services (AWS) in region `ap-south-1` (Asia Pacific - Mumbai).

---

## Architecture Overview

The Terraform deployment provisions:

1. **Virtual Private Cloud (VPC)**:
   - Dedicated CIDR block (`10.0.0.0/16`)
   - DNS hostnames and resolution enabled
2. **Subnet Topology**:
   - **2 Public Subnets** (Multi-AZ: `ap-south-1a`, `ap-south-1b`) mapped for public IP allocation, tagged for Application Load Balancers (`kubernetes.io/role/elb = "1"`).
   - **2 Private Subnets** (Multi-AZ: `ap-south-1a`, `ap-south-1b`) for secure Kubernetes worker nodes and workloads, tagged for internal load balancers (`kubernetes.io/role/internal-elb = "1"`).
3. **Internet & NAT Gateways**:
   - Internet Gateway attached to the VPC.
   - Elastic IP and NAT Gateway placed in public subnet for outbound internet access from private nodes.
   - Dedicated public and private route tables with associations.
4. **IAM Roles & Policies**:
   - EKS Cluster Role with `AmazonEKSClusterPolicy`.
   - EKS Managed Node Group Role with `AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, and `AmazonEC2ContainerRegistryReadOnly`.
5. **Security Groups**:
   - Dedicated control plane cluster security group.
   - Worker node security group allowing intra-node communication and control-plane traffic.
6. **Amazon EKS Cluster & Worker Node Group**:
   - Managed Kubernetes cluster (`campusstock-eks`).
   - Managed EC2 worker node group (`t3.medium`) with auto-scaling (min: 1, desired: 2, max: 4).

---

## File Structure

```
terraform/
├── main.tf                  # Primary infrastructure definitions (VPC, EKS, IAM, Security Groups)
├── variables.tf             # Input variables with production defaults
├── outputs.tf               # Exported resource IDs, endpoints, and attributes
├── providers.tf             # AWS provider declaration with default tags
├── terraform.tfvars.example # Sample variable overrides template
└── README.md                # Infrastructure documentation and lifecycle guide
```

---

## Prerequisites

Before executing Terraform:

1. **Terraform**: Install Terraform version `>= 1.5.0`.
2. **AWS CLI**: Install and configure AWS CLI with valid deployment credentials:
   ```bash
   aws configure
   ```
   *Note: Ensure your IAM identity possesses permissions for VPC, EC2, EKS, and IAM management.*
3. **Kubectl**: Installed for connecting to the cluster post-provisioning.

---

## Deployment Lifecycle

### 1. Initialize Working Directory

Download AWS provider plugins and initialize local state:

```bash
cd terraform
terraform init
```

### 2. Format & Validate Configuration

Ensure HCL files are formatted and syntactically correct:

```bash
terraform fmt -check
terraform validate
```

### 3. Review Execution Plan

Create a local `terraform.tfvars` from the provided example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Generate and inspect the proposed infrastructure plan:

```bash
terraform plan -out=tfplan
```

### 4. Apply Infrastructure

Provision all cloud resources on AWS:

```bash
terraform apply tfplan
```

*Note: Provisioning an EKS cluster and managed node group typically takes 10–15 minutes.*

### 5. Configure Local Kubectl Access

Once provisioning completes, update your local `kubeconfig`:

```bash
aws eks --region ap-south-1 update-kubeconfig --name campusstock-eks
kubectl get nodes
```

---

## Clean-up & Teardown

To avoid incurring ongoing cloud infrastructure charges after evaluation or testing, destroy all provisioned AWS resources:

```bash
terraform destroy -auto-approve
```

Verify that all EC2 instances, NAT Gateways, EKS clusters, and VPC components are fully terminated in the AWS console.
