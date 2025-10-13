-- Create a new database
CREATE DATABASE SampleDB;
GO

-- Switch to the new database
USE SampleDB;
GO

-- Create a sample table
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100),
    City VARCHAR(50)
);
GO

-- Insert sample data
INSERT INTO Customers (FirstName, LastName, Email, City) VALUES
('John', 'Doe', 'john.doe@example.com', 'New York'),
('Jane', 'Smith', 'jane.smith@example.com', 'London'),
('David', 'Lee', 'david.lee@example.com', 'Paris'),
('Emily', 'Brown', 'emily.brown@example.com', 'Tokyo'),
('Michael', 'Davis', 'michael.davis@example.com', 'Sydney'),
('Sarah', 'Wilson', 'sarah.wilson@example.com', 'Berlin'),
('Robert', 'Garcia', 'robert.garcia@example.com', 'Madrid'),
('Jennifer', 'Rodriguez', 'jennifer.rodriguez@example.com', 'Rome'),
('William', 'Martinez', 'william.martinez@example.com', 'Toronto'),
('Linda', 'Anderson', 'linda.anderson@example.com', 'Chicago');
GO

-- Verify the data
SELECT * FROM Customers;
GO
