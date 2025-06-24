variable "domain_name" {
  description = "The domain to be verified with SES."
  type        = string
}

variable "email_identity" {
  description = "The email address to be verified with SES."
  type        = string
  default     = null
}
