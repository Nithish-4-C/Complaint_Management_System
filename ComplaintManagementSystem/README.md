# Complaint Management System

A full-stack web application built with Node.js, Express, MongoDB, and Vanilla HTML/CSS/JS. It allows regular users to submit complaints regarding various categories (Hostel, Lab, Classroom) and enables administrators to monitor, update, and resolve the submitted issues.

## Project Structure

- `backend/` - Contains Node.js/Express server code, Mongoose schemas, and endpoints.
- `frontend/` - Contains vanilla HTML/CSS and plain JS for DOM management and API consumption.

## Requirements

- Node.js (v14 or newer)
- MongoDB instance (locally or MongoDB Atlas)

## Setup Instructions

### 1. Database Configuration
1. Ensure MongoDB is running locally on port 27017.
2. If using a remote URI or different port, navigate to `backend/.env` and update `MONGO_URI`.

### 2. Backend Initialization
Open a terminal in the `backend/` directory and run:

```bash
cd backend
npm install
npm start
```
The server will boot up and connect to MongoDB on `http://localhost:5000`.

### 3. Frontend Execution
The frontend contains plain HTML files. You can just open `frontend/index.html` in your web browser. 
Alternatively, for the best experience (avoiding CORS/file schema issues), use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code or run simple HTTP server:

```bash
cd frontend
npx serve .
```
or 
```bash
npx -y http-server -p 3000 -c-1 .
```
Open browser and paste: http://127.0.0.1:3000/home.html


## App Usage

1. Create a **User** account. (Login => submit complaints).
2. Create an **Admin** account by choosing "Administrator" during the registration form. (Login => change statuses, delete complaints).
