output "authorizer_function_arn" {
    value = aws_lambda_function.api_authorizer.arn
}

output "send_email_lambda_arn" {
  value = aws_lambda_function.send_email_lambda.arn
}