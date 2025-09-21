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


resource "aws_ecr_repository" "lambda_repo" {
  name = "ohitsthatguy-lambda-get-actors"
}

# Carica l'immagine Docker su ECR (build e push manuale o tramite CI/CD)

# Lambda in container
resource "aws_lambda_function" "get_actors" {
  function_name = "ohitsthatguy-api-get-actors"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda_repo.repository_url}:latest"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 30
  memory_size   = 512

    environment {
    variables = {
      NODE_ENV = "production"
      API_KEY  = var.api_key
      MONGODB_URI = var.mongodb_connection_string
      MONGODB_DB = var.mongodb_db_name
    }
  }
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
}

resource "aws_apigatewayv2_integration" "get_actors_integration" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_actors.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_actors_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/actors"
  target    = "integrations/${aws_apigatewayv2_integration.get_actors_integration.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_actors.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}
