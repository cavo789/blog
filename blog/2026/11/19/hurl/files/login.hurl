# Step 1. Log in and get an access token
POST https://dummyjson.com/auth/login
Content-Type: application/json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.accessToken"

# Step 2. Use the token to ask "who am I?"
GET https://dummyjson.com/auth/me
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.username" == "{{username}}"
jsonpath "$.email" endsWith "@x.dummyjson.com"
