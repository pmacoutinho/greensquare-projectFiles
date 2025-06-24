resource "aws_vpc_endpoint" "ssm" {
    vpc_id            = var.vpc_id
    service_name      = "com.amazonaws.${var.aws_region}.ssm"
    vpc_endpoint_type = "Interface"
    subnet_ids        = [var.private_subnet_ids[0], var.private_subnet_ids[1]]

    security_group_ids = [aws_security_group.ssm_endpoint_sg.id]
}

resource "aws_vpc_endpoint" "ssm_messages" {
    vpc_id            = var.vpc_id
    service_name      = "com.amazonaws.${var.aws_region}.ssmmessages"
    vpc_endpoint_type = "Interface"
    subnet_ids        = [var.private_subnet_ids[0], var.private_subnet_ids[1]]

    security_group_ids = [aws_security_group.ssm_endpoint_sg.id]
}

resource "aws_security_group" "ssm_endpoint_sg" {
    name   = "ssm-endpoint-sg"
    vpc_id = var.vpc_id

    ingress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_ssm_parameter" "rds_endpoint" {
    name        = "rds_endpoint"
    type        = "String"
    value       = var.rds_endpoint
    description = "The endpoint of the RDS instance"
}

resource "aws_ssm_parameter" "db_name" {
    name        = "db_name"
    type        = "String"
    value       = var.db_name
    description = "The name of the database"
}

resource "aws_ssm_parameter" "cognito_ui" {
    name        = "cognito_ui"
    type        = "String"
    value       = var.cognito_ui
    description = "The endpoint of the cognito UI"
}

resource "aws_ssm_parameter" "cognito_logout" {
    name        = "cognito_logout"
    type        = "String"
    value       = var.cognito_logout
    description = "The endpoint of the cognito logout"
}

resource "aws_vpc_endpoint" "ec2_messages" {
    service_name = "com.amazonaws.us-east-1.ec2messages"
    vpc_id       = var.vpc_id
    vpc_endpoint_type = "Interface"
    subnet_ids   = [var.private_subnet_ids[0], var.private_subnet_ids[1]]
    security_group_ids = [aws_security_group.ssm_endpoint_sg.id]

    tags = {
        Name = "EC2 Messages VPC Endpoint"
    }
}

resource "aws_ssm_parameter" "cognito_domain" {
    name        = "cognito_domain"
    type        = "String"
    value       = var.cognito_domain
    description = "Domain for Cognito"
}

resource "aws_ssm_parameter" "frontend_url" {
    name        = "frontend_url"
    type        = "String"
    value       = var.frontend_url
    description = "URL for Frontend on CF"
}

resource "aws_ssm_parameter" "redirect_uri" {
    name        = "redirect_uri"
    type        = "String"
    value       = var.redirect_uri
    description = "URL for Redirect on CF"
}

resource "aws_ssm_parameter" "userpool_id" {
    name        = "userpool_id"
    type        = "String"
    value       = var.userpool_id
    description = "URL for Redirect on CF"
}

resource "aws_ssm_parameter" "cognito_client_id" {
    name        = "cognito_client_id"
    type        = "String"
    value       = var.cognito_client_id
    description = "Client ID"
}

## RDS ACCESS ##

resource "aws_iam_role" "ssm_role" {
    name = "ssm-role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
        {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principal = {
            Service = "ec2.amazonaws.com"
            }
        }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
    role       = aws_iam_role.ssm_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "s3_readonly_policy" {
    role       = aws_iam_role.ssm_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_instance_profile" "ssm_profile" {
    name = "ssm-profile"
    role = aws_iam_role.ssm_role.name
}

# Security group for EC2
resource "aws_security_group" "ec2_sg" {
    name        = "ec2-ssm-sg"
    description = "Security group for EC2 instance with SSM access"
    vpc_id      = var.vpc_id

    egress {
        from_port   = 5432
        to_port     = 5432
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "ec2-ssm-sg"
    }
}

# EC2 Instance
resource "aws_instance" "ssm_instance" {
    ami                    = data.aws_ami.amazon_linux_2023.id
    instance_type          = var.instance_type
    subnet_id              = var.subnet_id
    iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name
    vpc_security_group_ids = [aws_security_group.ec2_sg.id]

    user_data = <<-EOF
        #!/bin/bash
        # Update system
        sudo dnf update -y

        # Install PostgreSQL 16 client
        sudo dnf install -y postgresql16
        EOF

    tags = {
        Name = "ssm-instance"
    }
}

data "aws_ami" "amazon_linux_2023" {
    most_recent = true
    owners      = ["amazon"]

    filter {
        name   = "name"
        values = ["al2023*"]
    }

    filter {
        name   = "architecture"
        values = ["x86_64"]
    }
}

