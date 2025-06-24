# /infra/outputs.tf

output "vpc_id" {
    description = "The ID of the VPC"
    value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
    description = "The IDs of the public subnets"
    value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
    description = "The IDs of the private subnets"
    value       = module.vpc.private_subnet_ids
}

output "internet_gateway_id" {
    description = "The ID of the Internet Gateway"
    value       = module.vpc.internet_gateway_id
}

output "nat_gateway_ids" {
    description = "The ID of the NAT Gateway"
    value       = module.vpc.nat_gateway_ids
}

output "ecr_repository_url" {
    description = "URLs of the created ECR repositories"
    value       = { for key, repo in module.ecr.repository_urls : key => repo }
}

# output "domain_identity_arn" {
#   description = "The ARN of the SES domain identity."
#   value       = module.ses.domain_identity_arn
# }

# output "dkim_tokens" {
#   description = "DKIM tokens for SES."
#   value       = module.ses.dkim_tokens
# }

# output "email_identity_arn" {
#   description = "The ARN of the SES email identity."
#   value       = module.ses.email_identity_arn
# }