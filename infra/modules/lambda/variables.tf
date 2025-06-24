variable "private_subnet_ids" {
    description = "List of subnet IDs"
    type        = list(string)
}

variable "vpc_id" {
    description = "ID of the VPC"
    type        = string
}

variable "aws_region" {
    type = string
}

variable "db_name_arn" {
    type = string
}

variable "rds_endpoint_arn"{
    type = string
}

variable "cognito_user_pool_id"{
    type = string
}

variable "cognito_app_client_id" {
    type = string
}

variable "api_gw_execution_arn" {
    type = string
}

variable "authorizer_id" {
    type = string
}

variable "aws_cognito_user_pool_arn" {
    type = string
}

variable "lambda_execution_role_name" {
  type        = string
  description = "Name of the IAM role for the Lambda function"
}

variable "lambda_execution_role_arn" {
  type        = string
  description = "ARN of the IAM role for the Lambda function"
}

variable "ses_lambda_execution_role_name" {
  type        = string
  description = "Name of the IAM role for the SES Lambda function"
}

variable "ses_lambda_execution_role_arn" {
  type        = string
  description = "ARN of the IAM role for the SES Lambda function"
}