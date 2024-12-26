# Introduction
Reconnect onboarding project using Prisma and Next.js

<br/>

# Getting Started

This project demonstrates how to build a web application using:
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Next.js](https://nextjs.org/) - React framework for production

<br/>

# Prisma Tutorial

## 1. Setup

First, create a new project directory and initialize it:
```bash
npm init -y
```

Install required dependencies:
```bash
npm install prisma typescript tsx @types/node@19 --save-dev
```

Initialize TypeScript configuration:
```bash
npx tsc --init
```

Initialize Prisma:
```bash
npx prisma init
```

## 2. Connect to the Database
modify the `.env` file to include your database connection string:  
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database_name"
```

## 3. Define the Data Model
In the `schema.prisma` file, define the data model for your application.

## 4. Map the Data Model to the Database
To generate and apply migrations while keeping change history:  
```bash
npx prisma migrate dev
```
- Use case - For production environments needing version-controlled schema changes
- Benefits - Keeps track of schema changes, allows for easy rollback, and provides a history of changes

<br/>

To directly apply the migration to the database:  
```bash
npx prisma db push
```
- Use case - For quick schema changes without version control
- Benefits - Best for prototyping as it may overwrite existing data

## 5. 

