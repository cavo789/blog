# A form, exactly like an OAuth2 client_credentials call
POST https://httpbin.org/post
[Form]
grant_type: client_credentials
client_id: my-app
HTTP 200
[Asserts]
jsonpath "$.form.grant_type" == "client_credentials"
jsonpath "$.headers['Content-Type']" == "application/x-www-form-urlencoded"

# Basic authentication
GET https://httpbin.org/basic-auth/bob/s3cr3t
[BasicAuth]
bob: s3cr3t
HTTP 200
[Asserts]
jsonpath "$.authenticated" == true

# A trace id, generated at every run
GET https://httpbin.org/headers
X-Trace-Id: blog-{{newUuid}}
HTTP 200
[Asserts]
jsonpath "$.headers['X-Trace-Id']" matches /^blog-[0-9a-f-]{36}$/

# Expect an error on purpose
GET https://httpbin.org/status/404
HTTP 404

# HTML, checked with XPath
GET https://httpbin.org/html
HTTP 200
[Asserts]
header "Content-Type" contains "text/html"
xpath "string(//h1)" == "Herman Melville - Moby-Dick"
body contains "Moby-Dick"

# Redirects: follow them, and check where we landed
GET https://httpbin.org/redirect/2
[Options]
location: true
HTTP 200
[Asserts]
url == "https://httpbin.org/get"
redirects count == 2
