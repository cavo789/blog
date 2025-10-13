USE [master]
GO

CREATE DATABASE [MyDB]
 CONTAINMENT = NONE
 ON  PRIMARY
( NAME = N'MyDB', FILENAME = N'/var/opt/mssql/data/MyDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON
( NAME = N'MyDB_log', FILENAME = N'/var/opt/mssql/data/MyDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO

USE [MyDB]
GO

CREATE TABLE [dbo].[Person](
 [FirstName] [varchar](50) NULL,
 [LastName] [varchar](50) NULL
) ON [PRIMARY]
GO

INSERT INTO dbo.Person (LastName, FirstName) VALUES
 ('Avonture', 'Christophe'),
 ('Doe', 'John');
GO
