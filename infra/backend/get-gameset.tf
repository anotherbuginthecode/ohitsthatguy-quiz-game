data "aws_ecr_repository" "get_gameset" {
  name = "ohitsthatguy-lambda-get-gameset"
}

# Carica l'immagine Docker su ECR (build e push manuale o tramite CI/CD)

# Lambda in container
resource "aws_lambda_function" "get_gameset" {
  function_name                  = "ohitsthatguy-api-get-gameset"
  package_type                   = "Image"
  image_uri                      = "${data.aws_ecr_repository.get_gameset.repository_url}:latest"
  role                           = aws_iam_role.lambda_exec.arn
  timeout                        = 30
  memory_size                    = 512


    environment {
    variables = {
      NODE_ENV = "production"
      API_KEY  = var.api_key
      MONGODB_URI = var.mongodb_connection_string
      MONGODB_DB = var.mongodb_db_name
    }
  }
}

resource "aws_apigatewayv2_integration" "get_gameset_integration" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_gameset.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_gameset_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /api/gameset"
  target    = "integrations/${aws_apigatewayv2_integration.get_gameset_integration.id}"
}

resource "aws_lambda_permission" "apigw_get_gameset" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_gameset.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}