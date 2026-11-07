#!/usr/bin/env python3
"""
Unit tests for grades.py
"""

import subprocess
import sys
import os

def test_class_average():
    """Test that the class average is calculated correctly"""
    # Run the grades.py script and capture output
    result = subprocess.run([sys.executable, 'grades.py'],
                          capture_output=True, text=True, cwd='/projects/school')

    # Check that the command was successful
    assert result.returncode == 0, f"Script failed with return code {result.returncode}"

    # Parse the output to extract the average
    output = result.stdout.strip()
    assert output.startswith("Class average:"), f"Unexpected output format: {output}"

    # Extract the numerical value after "Class average:"
    average_str = output.split(":")[1].strip()
    average = float(average_str)

    # Verify the correct calculation
    # Grades are [12, 15, 9, 18, 14]
    # Total = 68, Count = 5, Average = 13.6
    expected_average = 13.6

    assert average == expected_average, f"Expected average {expected_average}, but got {average}"

    print("✓ Class average test passed")

def test_with_different_grades():
    """Test with a different set of grades to ensure robustness"""
    # Create a temporary grades file with different values
    test_grades = [10, 20, 30]
    test_content = f'''# Class report: the average of the students' grades
grades = {test_grades}

total = 0
for grade in grades:
    total = total + grade

average = total / len(grades)
print("Class average:", average)
'''

    # Write the test content to a temporary file
    with open('/projects/school/test_grades_temp.py', 'w') as f:
        f.write(test_content)

    # Run the test script
    result = subprocess.run([sys.executable, 'test_grades_temp.py'],
                          capture_output=True, text=True, cwd='/projects/school')

    assert result.returncode == 0, f"Test script failed with return code {result.returncode}"

    output = result.stdout.strip()
    assert output.startswith("Class average:"), f"Unexpected output format: {output}"

    average_str = output.split(":")[1].strip()
    average = float(average_str)

    # Verify the correct calculation for [10, 20, 30]
    # Total = 60, Count = 3, Average = 20.0
    expected_average = 20.0

    assert average == expected_average, f"Expected average {expected_average}, but got {average}"

    # Clean up the temporary file
    os.remove('/projects/school/test_grades_temp.py')

    print("✓ Different grades test passed")

if __name__ == "__main__":
    try:
        test_class_average()
        test_with_different_grades()
        print("\n✓ All tests passed!")
    except AssertionError as e:
        print(f"✗ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)
