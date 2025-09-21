variable "mongodb_connection_string" {
  description = "MongoDB connection string"
  type        = string
  sensitive = true
}

variable "mongodb_db_name" {
  description = "MongoDB database name"
  type        = string
  sensitive = true
}

variable "api_key" {
  description = "API key for external service"
  type        = string
  sensitive = true
}