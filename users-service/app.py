# app.py

from flask import Flask
from flasgger import Swagger
import boto3
from aws_getters import *
import json
import sys
from models import db
import os
from botocore.client import Config
from auth.routes import auth


app = Flask(__name__)

def initialize_aws_clients():
    config = Config(region_name=os.environ.get('AWS_REGION', 'us-east-1'))
    
    ssm_client = boto3.client('ssm', config=config)
    cognito_client = boto3.client('cognito-idp', config=config)
    secrets_manager_client = boto3.client('secretsmanager', config=config)
    
    return ssm_client, cognito_client, secrets_manager_client

def configure_app():
    # Initialize Swagger for API documentation
    Swagger(app)

    app.register_blueprint(auth, url_prefix='/api/users')

    app.secret_key = os.urandom(24)

    try:
        ssm_client, cognito_client, secrets_manager_client = initialize_aws_clients()

        # Retrieve all necessary parameters
        client_id = get_parameter(ssm_client, "cognito_client_id")
        cognito_domain = get_parameter(ssm_client, "cognito_domain")
        frontend_url = get_parameter(ssm_client, "frontend_url")
        redirect_url = get_parameter(ssm_client, "redirect_uri")
        user_pool_id = get_parameter(ssm_client, "userpool_id")
        rds_endpoint = get_parameter(ssm_client, "rds_endpoint")
        cognito_url = get_parameter(ssm_client, "cognito_ui")
        logout_url = get_parameter(ssm_client, "cognito_logout")
        db_name = get_parameter(ssm_client, "db_name")

        # Retrieve secrets
        val = get_secret_value(secrets_manager_client, "postgres")
        if not val:
            print("Can't get credentials from Secrets Manager")
            return False
        
        token_secret = get_secret_value(secrets_manager_client, "token_secret")
        
        client_secret = get_secret_value(secrets_manager_client, "cognitoSecret")

        try:
            creds = json.loads(val)
        except json.JSONDecodeError as e:
            print(f"Unable to parse secret: {e}")
            return False

        host = rds_endpoint.split(":")[0]  
        db_user = creds.get('username')   
        db_password = creds.get('password')  

        database_uri = f"postgresql+psycopg2://{db_user}:{db_password}@{host}:5432/{db_name}"

        # Configure app
        app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  

        app.config['COGNITO_CLIENT_ID'] = client_id
        app.config['COGNITO_CLIENT_SECRET'] = client_secret.strip()
        app.config['COGNITO_DOMAIN'] = cognito_domain
        app.config['FRONTEND_URL'] = frontend_url
        app.config['REDIRECT_URL'] = redirect_url
        app.config['USER_POOL_ID'] = user_pool_id
        app.config['COGNITO_CLIENT'] = cognito_client
        app.config['COGNITO_URL'] = cognito_url
        app.config['COGNITO_LOGOUT'] = logout_url
        app.config['TOKEN_SECRET'] = token_secret
        db.init_app(app)

        return True

    except Exception as e:
        print(f"Error configuring app: {e}")
        return False

if not configure_app():
    print("Failed to configure the application")
    sys.exit(1)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')