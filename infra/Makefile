.PHONY: destroy locals

destroy:
	aws ecr delete-repository --repository-name authorizer-repo --force
	aws ecr delete-repository --repository-name frontend-repo --force
	aws ecr delete-repository --repository-name users-repo --force
	aws ecr delete-repository --repository-name migrations-repo --force
	aws ecr delete-repository --repository-name market-repo --force
	aws ecr delete-repository --repository-name lands-repo --force
	aws secretsmanager delete-secret --secret-id cognitoSecret --force-delete-without-recovery
	aws secretsmanager delete-secret --secret-id token_secret --force-delete-without-recovery
	terraform destroy -auto-approve

locals:
	docker build -t frontend-repo ../webapp
	docker tag frontend-repo:latest 908776941646.dkr.ecr.us-east-1.amazonaws.com/frontend-repo:latest
	docker push 908776941646.dkr.ecr.us-east-1.amazonaws.com/frontend-repo:latest
	docker build -t users-repo ../users-service
	docker tag users-repo:latest 908776941646.dkr.ecr.us-east-1.amazonaws.com/users-repo:latest
	docker push 908776941646.dkr.ecr.us-east-1.amazonaws.com/users-repo:latest
	docker build -t market-repo ../market-service
	docker tag market-repo:latest 908776941646.dkr.ecr.us-east-1.amazonaws.com/market-repo:latest
	docker push 908776941646.dkr.ecr.us-east-1.amazonaws.com/market-repo:latest
	docker build -t lands-repo ../lands-service
	docker tag lands-repo:latest 908776941646.dkr.ecr.us-east-1.amazonaws.com/lands-repo:latest
	docker push 908776941646.dkr.ecr.us-east-1.amazonaws.com/lands-repo:latest