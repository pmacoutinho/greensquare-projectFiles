output "ssm_rds_endpoint" {
    description = "The RDS endpoint stored in SSM Parameter Store"
    value       = aws_ssm_parameter.rds_endpoint.arn
}

output "ssm_db_name" {
    description = "The DB name stored in SSM Parameter Store"
    value       = aws_ssm_parameter.db_name.arn
}

output "instance_id" {
    description = "ID of the EC2 instance"
    value       = aws_instance.ssm_instance.id
}

output "instance_private_ip" {
    description = "Private IP of the EC2 instance"
    value       = aws_instance.ssm_instance.private_ip
}