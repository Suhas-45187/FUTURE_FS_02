# NovaCRM — Client Lead Management System

NovaCRM is a web-based Customer Relationship Management (CRM) application designed to help manage client leads, track their progress, and organize follow-up activities.

Developed as part of the Future Interns Full Stack Web Development Internship.

## Features

- Admin authentication using JSON Web Tokens (JWT)
- Protected lead management API
- Create, view, edit, and delete leads
- Track lead statuses: New, Contacted, and Converted
- Add notes to individual leads
- Schedule follow-up dates
- View upcoming follow-up activities
- Dashboard statistics for lead tracking
- MongoDB database integration
- Responsive React user interface

## Technology Stack

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

## Project Structure

```text
FUTURE_FS_02/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

**Note:** The `backend/.env` file is required for local configuration but must never be committed to Git.

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Suhas-45187/FUTURE_FS_02.git
cd FUTURE_FS_02
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_private_random_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
```

Replace the example values with your own configuration. Do not publish your database credentials, JWT secret, or administrator password.

Start the backend:

```bash
npm run dev
```

The backend should run on port `5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd FUTURE_FS_02/frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173/

### 4. Log in

Use the administrator credentials configured for your local environment.

## Security

- Protected API routes require authentication.
- Password verification uses bcryptjs.
- JWTs are used to authenticate API requests.
- Environment variables are excluded from version control.

## Future Improvements

- Role-based access for multiple users
- Search, filtering, and sorting for leads
- Email reminders for scheduled follow-ups
- Exportable lead reports
- Deployment for public access

## Author

Developed by the Future Interns Full Stack Web Development Internship participant.

## License

This project was developed for educational and internship purposes.
