#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <lambda-folder-name>"
    exit 1
fi

cd "$1" || { echo "Folder '$1' not found."; exit 1; }
ECR_REPO_NAME="$1"

# Variables
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="eu-west-1"
ECR_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ohitsthatguy-lambda-$ECR_REPO_NAME"

# Create ECR repository if it does not exist
aws ecr describe-repositories --repository-names "ohitsthatguy-lambda-$ECR_REPO_NAME" --region $AWS_REGION >/dev/null 2>&1 || \
aws ecr create-repository --repository-name "ohitsthatguy-lambda-$ECR_REPO_NAME" --region $AWS_REGION >/dev/null 2>&1
IMAGE_TAG="latest"

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

# Build Docker image
docker build --platform linux/amd64 -t $ECR_REPO:$IMAGE_TAG .

# Push Docker image to ECR
docker push $ECR_REPO:$IMAGE_TAG

echo "Docker image deployed to ECR: $ECR_REPO:$IMAGE_TAG"