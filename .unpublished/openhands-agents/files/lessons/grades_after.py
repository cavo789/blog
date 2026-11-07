# Class report: the average of the students' grades
def calculate_average(grades):
    """Calculate the average of a list of grades."""
    if not grades:
        return 0
    total = 0
    for grade in grades:
        total = total + grade
    return total / len(grades)

grades = [12, 15, 9, 18, 14]
average = calculate_average(grades)
print("Class average:", average)
