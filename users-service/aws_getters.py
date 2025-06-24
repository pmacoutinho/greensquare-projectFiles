from botocore.exceptions import ClientError

def get_parameter(ssm_client, parameter_name):
    try:
        response = ssm_client.get_parameter(
            Name=parameter_name,
            WithDecryption=True
        )
        return response['Parameter']['Value']
    except ClientError as e:
        print(f"Error retrieving parameter {parameter_name}: {e}")
        return None

def get_secret_value(secrets_manager_client, secret_id):
    try:
        response = secrets_manager_client.get_secret_value(
            SecretId=secret_id
        )
        if 'SecretString' in response:
            return response['SecretString']
        else:
            return response['SecretBinary']
    except ClientError as e:
        print(f"Error retrieving secret {secret_id}: {e}")
        return None