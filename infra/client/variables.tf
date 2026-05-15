variable "api_key" {
  description = "API key injected server-side by CloudFront Function — never reaches the browser"
  type        = string
  sensitive   = true
}

variable "api_gateway_endpoint" {
  description = "API Gateway HTTP API invoke URL (output from infra/backend). E.g. https://abc123.execute-api.eu-west-1.amazonaws.com"
  type        = string
}
