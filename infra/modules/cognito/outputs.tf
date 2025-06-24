# /modules/cognito/sellers/outputs.tf
output "user_pool_id" {
    value = aws_cognito_user_pool.user_pool.id
}

output "user_pool_name" {
    value = aws_cognito_user_pool.user_pool.name
}

output "user_pool_arn" {
    value = aws_cognito_user_pool.user_pool.arn
}

output "user_pool_client_id" {
    value = aws_cognito_user_pool_client.user_pool_client.id
}

output "user_pool_domain" {
    value = aws_cognito_user_pool_domain.user_pool_domain.domain
}

output "user_pool_client_secret" {
    value     = aws_cognito_user_pool_client.user_pool_client.client_secret
    sensitive = true
}

output "cognito_domain" {
    value = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${var.aws_region}.amazoncognito.com"
}