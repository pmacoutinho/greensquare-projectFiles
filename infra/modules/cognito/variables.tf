# /modules/cognito/sellers/variables.tf

variable "aws_region" {
    description = "The AWS region to deploy resources in"
    type = string
}

variable "project_name" {
    description = "The name of the project for tagging resources"
    type        = string
}

variable "callback_url"{
    type = string
}

variable "logout_url" {
    type = string
}
