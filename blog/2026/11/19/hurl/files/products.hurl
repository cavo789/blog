# Daily export of the product catalog, for the reporting database

# Step 1. Log in
POST https://dummyjson.com/auth/login
Content-Type: application/json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.accessToken"

# Step 2. Download the catalog, check it, then save it
GET https://dummyjson.com/auth/products
Authorization: Bearer {{token}}
[Query]
limit: 0
select: title,category,price,stock
[Options]
output: products.json
HTTP 200
[Asserts]
jsonpath "$.products" count > 100
jsonpath "$.products[?!@.title]" not exists
jsonpath "$.products[?@.price <= 0]" not exists
