................. HOW TO START DOCKER .................

sudo docker build -t my-flask-app .

sudo docker run -p 5000:5000 my-flask-app

................. HOW TO TEST USING POSTMAN .................

--------------- SIGN UP ---------------
Endpoint:
POST /auth/signup

Method: POST
URL: http://127.0.0.1:5000/auth/signup
Body: (Select raw and set the content type to JSON)
{
  "username": "your_email@example.com",
  "password": "YourPassword123!",
  "email": "your_email@example.com",
  "address": "123 Main St",
  "birthdate": "1990-01-01",
  "phone_number": "+1234567890",
  "given_name": "John",
  "family_name": "Doe"
}

Expected Response:
{
  "UserConfirmed": false,
  "CodeDeliveryDetails": {
    "Destination": "email@example.com",
    "DeliveryMedium": "EMAIL"
  },
  "UserSub": "some-user-id"
}

--------------- CONFIRM SIGN-UP ---------------
Endpoint:
POST /auth/confirm-signup

Method: POST
URL: http://127.0.0.1:5000/auth/confirm-signup
Body: (Select raw and set the content type to JSON)
{
    "username": "your_username",
    "confirmationCode": "123456"  // Replace with the actual code you received
}

Expected Response:
{
    "message": "User confirmed successfully"
}

--------------- FORGOT PASSWORD ---------------
  Endpoint:
POST /auth/forgot-password

Method: POST
URL: http://127.0.0.1:5000/auth/forgot-password
Body: (Select raw and set the content type to JSON)
{
  "username": "your_username"
}

Expected Response:
{
    "message": "Password reset code sent"
}

--------------- RESET PASSWORD ---------------
Endpoint:
POST /auth/reset-password

Method: POST
URL: http://127.0.0.1:5000/auth/reset-password
Body: (Select raw and set the content type to JSON)
{
  "username": "your_username",
  "confirmationCode": "123456",  // Replace with the actual code you received
  "newPassword": "YourNewPassword123!"
}

Expected Response:
{
    "message": "Password reset successfully"
}

................. HOW TO TEST USING CURL .................

curl -X POST http://localhost:5000/auth/signup \
-H "Content-Type: application/json" \
-d '{
    "username": "john.doe@example.com",
    "password": "StrongPassword123!",
    "address": "123 Main St",
    "birthdate": "1990-01-01",
    "phone_number": "+15555555555",
    "email": "john.doe@example.com",
    "given_name": "John",
    "family_name": "Doe"
}'


TO TEST OTHER FEATURES SIMPLY SWITCH THE URL AND THE INPUT PARAMETERS, 
FOLLOW THE POSTMAN INSTRUCTIONS FOR THE TEMPLATES


................. CHECK DOCUMENTATION .................
You can access the interactive API documentation at:
http://localhost:5000/apidocs/

(or wherever the app is hosted)
