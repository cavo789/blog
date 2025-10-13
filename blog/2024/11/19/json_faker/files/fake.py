fake = Faker()

fake = Faker('fr_FR')

data = []

for _ in range(1):
    user = {
        'firstname': fake.first_name(),
        'lastname': fake.last_name(),
        'address': fake.street_address(),
        'city': fake.city(),
        'country': fake.country(),
        'gender': fake.random_element(elements=('Homme', 'Femme', 'Non binaire'))
    }

    data.append(user)

# Pretty print the JSON data
print(json.dumps(data, indent=4, ensure_ascii=False))
