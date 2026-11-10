# Download a CSV file, check it, keep it
GET https://raw.githubusercontent.com/datasets/country-list/main/data.csv
[Options]
output: countries.csv
HTTP 200
[Asserts]
header "Content-Type" contains "text/plain"
bytes count > 1000
body startsWith "Name,Code"
body contains "Belgium,BE"
body split "\n" count > 200
