#!/usr/bin/env python3
"""
Unit tests for grades.py using unittest framework
"""

import unittest
import sys
import os

# Add the current directory to Python path to import grades
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from grades import calculate_average

class TestGrades(unittest.TestCase):

    def test_calculate_average(self):
        """Test that calculate_average returns correct average"""
        grades = [12, 15, 9, 18, 14]
        expected = 13.6
        result = calculate_average(grades)
        self.assertEqual(result, expected)

    def test_calculate_average_empty_list(self):
        """Test that calculate_average handles empty list correctly"""
        grades = []
        expected = 0
        result = calculate_average(grades)
        self.assertEqual(result, expected)

    def test_calculate_average_single_grade(self):
        """Test that calculate_average works with single grade"""
        grades = [10]
        expected = 10.0
        result = calculate_average(grades)
        self.assertEqual(result, expected)

    def test_calculate_average_different_grades(self):
        """Test that calculate_average works with different set of grades"""
        grades = [10, 20, 30]
        expected = 20.0
        result = calculate_average(grades)
        self.assertEqual(result, expected)

    def test_calculate_average_with_decimals(self):
        """Test that calculate_average works with decimal grades"""
        grades = [15.5, 16.5, 14.0]
        expected = 15.333333333333334  # This is what 46/3 equals
        result = calculate_average(grades)
        self.assertAlmostEqual(result, expected, places=10)

if __name__ == '__main__':
    unittest.main()
