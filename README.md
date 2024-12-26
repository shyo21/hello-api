# Introduction
Reconnect onboarding project using Prisma and Next.js  

This project demonstrates how to build a web application using:
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Next.js](https://nextjs.org/) - React framework for production

<br/>

# Table of Contents

- [Prisma Tutorial](#prisma-tutorial)
- [Next.js Tutorial](#nextjs-tutorial)

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

<br/>

## 2. Connect to the Database
modify the `.env` file to include your database connection string:  
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database_name"
```

<br/>

## 3. Define the Data Model
In the `schema.prisma` file, define the data model for your application.

<br/>

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

<br/>

## 5. Check the Database
To check the status of the database:  
```bash
npx prisma studio
```

<br/>

## 6. DB query
Generate `index.ts` file to query the database and run it:  
```bash
npx tsx index.ts
```

- [CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Filtering&Sorting](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#filter-conditions-and-operators)

<br/>

# Next.js Tutorial

## 1. Setup

### 1.1. Create a new project from scratch
To create a new Next.js project:  
```bash
npx create-next-app@14.2.3 --typescript your_project_name
```

Move to the project directory and install Prisma:  
```bash
npm install prisma --save-dev
```

Initialize Prisma:  
```bash
npx prisma init
```


### 1.2. Create a new project from existing prisma project

Install Next.js and React:  
```bash
npm install next@14.2.3 react@18.3.1 react-dom@18.3.1
```

Install required dependencies:  
```bash
npm install @types/react@18 @types/react-dom@18 --save-dev
```

<br/>

## 2. Install Prisma Client
```bash
npm install @prisma/client
```
To generate Prisma Client:  
```bash
npx prisma generate
```

<br/>

## 3. Implement API routes
Under the `/app` directory, create a new `/api` directory and implement the API routes in the `route.ts` file.  

<br/>

## 4. Implement Client Components
Under the `/app` directory, create `layout.tsx`, `page.tsx`, `globals.css` files.  

Create a new `/components` directory and implement the client components in the `your-component-name.tsx` file.  

To implement new page, create a new `/your-page-name` directory and implement the page in the `page.tsx` file.  

<br/>

## 5. Project Structure
```
app/
|--api/
|   |--route.ts
|
|--components/
|   |--component1.tsx
|   |--component2.tsx
|
|--logs/
|   |--page.tsx
|
|--page.tsx
|--layout.tsx
|--globals.css

prisma/
|--migration/
|   |--migration-name.ts
|
|--schema.prisma
``` 

## 6. Run the app
To run the app:  
```bash
npm run dev
```
