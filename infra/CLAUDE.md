# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

```
infra/
  backend/    # Lambda functions, API Gateway HTTP API, IAM roles
  client/     # S3 bucket, CloudFront distribution, Route53, ACM certificate
```

Each directory is an independent Terraform root module with its own state.

## Commands

```bash
cd infra/backend   # or infra/client

terraform init
terraform plan -var-file=vars.tfvars
terraform apply -var-file=vars.tfvars
```

State is stored in S3 backend: bucket `ohitsthatguy-tfstate`, region `eu-west-1`.

## Backend Infrastructure (`infra/backend/`)

**Resources per Lambda function** (pattern repeated in `get-actors.tf`, `get-rounds.tf`, `get-gameset.tf`, `store-events.tf`):
- `aws_lambda_function` — pulls image from ECR
- `aws_apigatewayv2_integration` — links Lambda to API Gateway
- `aws_apigatewayv2_route` — defines the HTTP method + path

**Shared resources** (`main.tf`):
- `aws_apigatewayv2_api` — HTTP API Gateway
- IAM execution role for Lambda
- CloudWatch log groups

**Region**: `eu-west-1` (Ireland)

### Variables (`variables.tf` / `vars.tfvars`)

Sensitive — do not commit `vars.tfvars`:
```
mongodb_connection_string
mongodb_db_name
api_key
```

These are injected as Lambda environment variables at apply time.

## Client Infrastructure (`infra/client/`)

- **S3 bucket** — hosts the built SPA static assets (`build/client/`)
- **CloudFront distribution** — CDN with HTTPS, origin pointing to S3
- **ACM certificate** — must be provisioned in `us-east-1` (CloudFront requirement), even though other resources are in `eu-west-1`
- **Route53** — DNS records for `ohitsthatguy.xyz`

## Adding a New Lambda

1. Create `infra/backend/<function-name>.tf` using an existing `.tf` file as a template
2. Define: `aws_lambda_function`, `aws_apigatewayv2_integration`, `aws_apigatewayv2_route`
3. Reference the shared IAM role and API Gateway from `main.tf`
4. Add the new ECR repository if needed
5. Run `terraform plan` to verify before applying
