def validate_json(data_file, schema_file):
  with open(schema_file) as f:
    schema = json.load(f)

  with open(data_file) as f:
    data = json.load(f)

  jsonschema.validate(instance=data, schema=schema)

data_file = "data.json"
schema_file = "schema.json"

try:
    validate_json(data_file, schema_file)
    print("Data is valid!")
except jsonschema.exceptions.ValidationError as exception:
    print(f{"Data is invalid: {exception}")
