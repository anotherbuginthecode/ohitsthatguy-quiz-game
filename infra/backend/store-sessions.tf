data "aws_ecr_repository" "store_sessions" {
  name = "ohitsthatguy-lambda-store-sessions"
}

# Carica l'immagine Docker su ECR (build e push manuale o tramite CI/CD)

# Lambda in container
resource "aws_lambda_function" "store_sessions" {
  function_name = "ohitsthatguy-api-store-sessions"
  package_type  = "Image"
  image_uri     = "${data.aws_ecr_repository.store_sessions.repository_url}:latest"
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

resource "aws_apigatewayv2_integration" "store_sessions_integration" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.store_sessions.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "store_sessions_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/sessions"
  target    = "integrations/${aws_apigatewayv2_integration.store_sessions_integration.id}"
}

resource "aws_lambda_permission" "store_sessions_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.store_sessions.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}