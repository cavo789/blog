# Every user must have a first name, a last name and an email
GET https://dummyjson.com/users
[Query]
limit: 0
select: firstName,lastName,email
HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.users" isCollection
jsonpath "$.users" count == 208
jsonpath "$.total" == 208
jsonpath "$.users[?!@.firstName]" not exists
jsonpath "$.users[?!@.lastName]" not exists
jsonpath "$.users[?!@.email]" not exists
jsonpath "$.users[0].email" matches /^[a-z.]+@x\.dummyjson\.com$/
duration < 5000
