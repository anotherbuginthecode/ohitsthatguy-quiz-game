# Crea l'immagine ECR per la Lambda
terraform {
	backend "s3" {
		bucket         = "ohitsthatguy-tfstate"
		key            = "infra/backend/terraform.tfstate"
		region         = "eu-west-1"
		encrypt        = true
	}
}

provider "aws" {
	region = "eu-west-1"
  profile = "anotherbuginthecode"
}




resource "aws_iam_role" "lambda_exec" {
  name = "ohitsthatguy-lambda-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "api" {
  name          = "ohitsthatguy-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = [
      "authorization",
      "content-type",
    ]
    allow_methods     = [
      "GET",
      "OPTIONS",
      "POST",
    ]
    allow_origins     = [
      "https://ohitsthatguy.xyz",
      "http://localhost:5173",
    ]
    expose_headers    = []
    max_age           = 0
  }
}



resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}


output "apigateway_endpoint" {
  value = aws_apigatewayv2_stage.default.invoke_url
  description = "The endpoint URL of the API Gateway"
}