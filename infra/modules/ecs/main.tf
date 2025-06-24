resource "aws_ecs_cluster" "cluster" {
    name = "${var.project}-ecs-cluster"

    tags = {
        Name = "${var.project}-ecs-cluster"
    }
}

# Task definition for microservices
resource "aws_ecs_task_definition" "users_task" {
    family                   = "${var.project}-users-task"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = var.cpu   
    memory                   = var.memory  
    execution_role_arn       =  var.execution_role_arn
    task_role_arn            = var.task_role_arn
    container_definitions    = jsonencode([var.container_definitions[0]])
}

# Service for userss in the first private subnet
resource "aws_ecs_service" "users_service" {
    name            = "${var.project}-users-service"
    cluster         = aws_ecs_cluster.cluster.id
    task_definition = aws_ecs_task_definition.users_task.arn
    desired_count   = var.desired_count
    launch_type     = "FARGATE"
    
    network_configuration {
        subnets         = [var.private_subnet_ids[1], var.private_subnet_ids[2]]  # Private subnet for userss
        security_groups = [var.security_group_id]
        assign_public_ip = false  # Fargate does not require a public IP in private subnets
    }

    load_balancer {
        target_group_arn = var.users_target_group_arn
        container_name   = "users"  # Name of the container in the task definition
        container_port   = 8080
    }

    tags = {
        Name = "${var.project}-users-service"
    }
}

# Task definition for frontend
resource "aws_ecs_task_definition" "frontend_task" {
    family                   = "${var.project}-frontend-task"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = var.cpu      
    memory                   = var.memory      
    execution_role_arn       = var.execution_role_arn
    task_role_arn            = var.task_role_arn
    container_definitions    = jsonencode([var.container_definitions[3]])
}

# Service for frontend in the second private subnet
resource "aws_ecs_service" "frontend_service" {
    name            = "${var.project}-frontend-service"
    cluster         = aws_ecs_cluster.cluster.id
    task_definition = aws_ecs_task_definition.frontend_task.arn
    desired_count   = var.desired_count
    launch_type     = "FARGATE"
    
    network_configuration {
        subnets         = [var.private_subnet_ids[0], var.private_subnet_ids[3]]  # Private subnet for frontend
        security_groups = [var.security_group_id]
        assign_public_ip = false  # Fargate does not require a public IP in private subnets
    }

    load_balancer {
        target_group_arn = var.frontend_target_group_arn
        container_name   = "frontend"  # Name of the container in the task definition
        container_port   = 80
    }

    tags = {
        Name = "${var.project}-frontend-service"
    }
}

resource "aws_ecs_task_definition" "market_task" {
    family                   = "${var.project}-market-task"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = var.cpu   
    memory                   = var.memory  
    execution_role_arn       =  var.execution_role_arn
    task_role_arn            = var.task_role_arn
    container_definitions    = jsonencode([var.container_definitions[1]])
}

# Service for userss in the first private subnet
resource "aws_ecs_service" "market_service" {
    name            = "${var.project}-market-service"
    cluster         = aws_ecs_cluster.cluster.id
    task_definition = aws_ecs_task_definition.market_task.arn
    desired_count   = var.desired_count
    launch_type     = "FARGATE"
    
    network_configuration {
        subnets         = [var.private_subnet_ids[1], var.private_subnet_ids[2]]  # Private subnet for markets
        security_groups = [var.security_group_id]
        assign_public_ip = false  # Fargate does not require a public IP in private subnets
    }

    load_balancer {
        target_group_arn = var.market_target_group_arn
        container_name   = "market"  # Name of the container in the task definition
        container_port   = 8080
    }

    tags = {
        Name = "${var.project}-market-service"
    }
}

resource "aws_ecs_task_definition" "lands_task" {
    family                   = "${var.project}-lands-task"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = var.cpu   
    memory                   = var.memory  
    execution_role_arn       =  var.execution_role_arn
    task_role_arn            = var.task_role_arn
    container_definitions    = jsonencode([var.container_definitions[2]])
}

# Service for userss in the first private subnet
resource "aws_ecs_service" "lands_service" {
    name            = "${var.project}-lands-service"
    cluster         = aws_ecs_cluster.cluster.id
    task_definition = aws_ecs_task_definition.lands_task.arn
    desired_count   = var.desired_count
    launch_type     = "FARGATE"
    
    network_configuration {
        subnets         = [var.private_subnet_ids[1], var.private_subnet_ids[2]]  # Private subnet for landss
        security_groups = [var.security_group_id]
        assign_public_ip = false  # Fargate does not require a public IP in private subnets
    }

    load_balancer {
        target_group_arn = var.lands_target_group_arn
        container_name   = "lands"  # Name of the container in the task definition
        container_port   = 8080
    }

    tags = {
        Name = "${var.project}-market-service"
    }
}