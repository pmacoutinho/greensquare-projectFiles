# routes.py

from flask import Blueprint, request, jsonify, redirect, current_app, make_response
from flasgger import swag_from
from models import db, Buyers, Sellers, Users
import jwt
import requests

# Create a Blueprint for authentication routes
auth = Blueprint('auth', __name__)

#TODO IF HAVE TIME USE A CACHE INSTEAD OF STATE (GROUPS COULD BE KEPT IN REDIS AS WELL INSTEAD OF CHECKING ON AUTHORIZER EVERY SINGLE TIME!!)

@auth.route("/", methods=["GET"])
def healthcheck():
    return jsonify({"status": "healthy"}), 200

@auth.route('/signup', methods=['GET'])
def signup():
    role = request.args.get('role')
    if role not in ['buyer', 'seller']:
        return "Invalid role", 400

    state = jwt.encode({"role": role, "flow": "signup"}, current_app.config.get("TOKEN_SECRET"), algorithm="HS256")
    return redirect(f"{current_app.config.get('COGNITO_URL')}&state={state}")

@auth.route('/signin', methods=['GET'])
def signin():
    state = jwt.encode({"flow": 'signin'}, current_app.config.get("TOKEN_SECRET"), algorithm="HS256")
    return redirect(f"{current_app.config.get('COGNITO_URL')}&state={state}")

@auth.route('/signout', methods=['GET'])
def signout():
    return redirect(f"{current_app.config.get('COGNITO_LOGOUT')}")

@auth.route("/callback")
def callback():
    code = request.args.get('code')
    if not code:
        return jsonify({"Error": "No code in request"}), 400
    
    state = request.args.get('state')
    if not state:
        return jsonify({"Error": "Missing state in request"}), 400
    
    state_data = jwt.decode(state, current_app.config.get("TOKEN_SECRET"), algorithms=["HS256"])

    cognito_client = current_app.config.get("COGNITO_CLIENT")
    cognito_domain = current_app.config.get("COGNITO_DOMAIN")
    client_id = current_app.config.get("COGNITO_CLIENT_ID")
    client_secret = current_app.config.get("COGNITO_CLIENT_SECRET")
    redirect_url = current_app.config.get("REDIRECT_URL")

    try:
        token_url = f"{cognito_domain}/oauth2/token"

        data = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_url,
            "code": code  
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        response = requests.post(token_url, data=data, headers=headers)

        if response.status_code != 200:
            raise Exception(f"Error fetching token: {response.text}")
        
        token_response = response.json()
        
        access_token = token_response.get("access_token")
        id_token = token_response.get("id_token")
        refresh_token = token_response.get("refresh_token")
    except Exception as e:
        print(f"ERROR::{e}")
        return "Error fetching token", 500

    if state_data.get("flow") == "signup":
        try:
            info_res = jwt.decode(id_token, options={"verify_signature": False})
            user_id = info_res.get("sub")
            
            if not user_id:
                return jsonify({"Error": "No user ID in response (IDP Insertion Might've Failed)"}), 500
            
            user = create(db.session, Users, id=user_id)
            role = state_data.get("role")
            
            cognito_client.admin_add_user_to_group(
                UserPoolId=current_app.config.get("USER_POOL_ID"),
                Username=user_id,
                GroupName=role.capitalize()
            )
            
            if role not in ['buyer', 'seller']:
                return jsonify({"Error": "Invalid role in state data"}), 400

            is_buyer = role == 'buyer'
            is_seller = role == 'seller'

            if is_buyer:
                new_buyer = Buyers(user_id = user.id)
                db.session.add(new_buyer)
                db.session.commit()
                print("User is a Buyer and has been added to the Buyer table")
            
            if is_seller:
                new_seller = Sellers(user_id = user.id)
                db.session.add(new_seller)
                db.session.commit()
                print("User is a Seller and has been added to the Seller table")

        except cognito_client.exceptions.NotAuthorizedException: 
            return jsonify({"Error": "Not Authorized"}), 401
        except cognito_client.exceptions.ResourceNotFoundException:
            return jsonify({"Error": "Resource Not Found"}), 404
        except Exception as e:
            print(f"Error retrieving user: {e}")
            return jsonify({"Error": "Error Retrieving User"}), 500
    
    print("Success!")
    frontend_url = current_app.config.get("FRONTEND_URL")

    resp = make_response(redirect(f'{frontend_url}')) 
    
    set_cookie(resp, 'access_token', access_token, 3600)
    set_cookie(resp, 'id_token', id_token, 3600)
    set_cookie(resp, 'refresh_token', refresh_token, 3600 * 24 * 30)

    return resp

@auth.route("/logout")
def logout_callback():
    frontend_url = current_app.config.get("FRONTEND_URL")

    resp = make_response(redirect(f'{frontend_url}')) 
    
    resp.set_cookie(
        'access_token',  
        "",    
        max_age=0,    
        secure=True,   
        expires=0,  
        httponly=True,   
        samesite='Strict' 
    )

    resp.set_cookie(
        'id_token',  
        "",    
        max_age=0, 
        expires=0,   
        secure=True,     
        httponly=True,   
        samesite='Strict' 
    )

    resp.set_cookie(
        'refresh_token',  
        "",    
        max_age=0,    
        expires=0,
        secure=True,     
        httponly=True,   
        samesite='Strict' 
    )

    return resp

@auth.route("/auth", methods=["GET"])
def check_auth():
    access_token = request.cookies.get("access_token")
    if access_token is None:
        return jsonify({"Error": "Not Authorized"}), 401
    
    cognito_client = current_app.config.get("COGNITO_CLIENT")

    try:
        response = cognito_client.get_user(
            AccessToken=access_token
        )

        user_attributes = response.get('UserAttributes', [])
        
        user_info = {}
        for attribute in user_attributes:
            user_info[attribute['Name']] = attribute['Value']
        
        groups = response.get('Groups', [])
        user_info['groups'] = groups

        return jsonify({"status": "Authorized", "user_info": user_info.get("email")}), 200

    except cognito_client.exceptions.NotAuthorizedException:
        return jsonify({"Error": "Not Authorized"}), 401
    except cognito_client.exceptions.ResourceNotFoundException:
        return jsonify({"Error": "Resource Not Found"}), 404
    except Exception as e:
        print(f"Error retrieving user: {e}")
        return jsonify({"Error": "Error Retrieving User"}), 500
    
def create(session, model, **kwargs):
    instance = model(**kwargs)
    session.add(instance)
    session.commit()
    return instance

def set_cookie(resp, key, value, max_age):
    resp.set_cookie(
        key,
        value,
        max_age=max_age,
        secure=True,
        httponly=True,
        samesite='Strict'
    )