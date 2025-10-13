# My API key as displayed in my profile page on Mockaroo
api_key = "MY_API_KEY"

# This is the name of my schema
schema = "schema_test"

# Number of records I want
num_records = 10

# Construct the API endpoint URL
url = f"https://api.mockaroo.com/api/generate?key={api_key}&count={num_records}&schema={schema}"

# Make the API request
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the JSON response
    data = response.json()

    # Display the result on the console
    print(data)
else:
    print(f"Error fetching data: {response.text}")
