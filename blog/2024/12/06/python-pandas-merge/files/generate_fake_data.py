# cspell:disable

def generate_fake_data(filename: str = "employees") -> None:
    fake = Faker()

    max: int = 10

    employees: dict = []

    for id in range(max):
        employee = {
            "id" : id,
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
        }

        employees.append(employee)

    extra_employees: dict = {
        2020: ("François", "Damiens"),
        2021: ("Albert", "Théo"),
        2022: ("Marthe", "Louisa"),
        2023: ("John", "John"),
        2024: ("Matthias", "Gemini")
    }

    for year in { 2020, 2021, 2022, 2023, 2024 }:
        salaries: dict = []

        for id in range(max+1):

            if id == max:
                id = year
                firstname, lastname = extra_employees[id]
            else:
                firstname = employees[id]["first_name"]
                lastname = employees[id]["last_name"]

            salary = {
                "id": id,
                "first_name": firstname,
                "last_name": lastname,
                "salary": int(fake.random.randint(2500, 8000))
            }

            salaries.append(salary)

        df = pd.DataFrame(salaries)

        df.to_csv(f"{filename}_{year}.csv", index=False, encoding="utf-8", sep=";")

generate_fake_data("employees")
