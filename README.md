# NovaCRM - Client Lead Management System

NovaCRM is a web-based Customer Relationship Management (CRM) application designed to help manage client leads, track their progress, and organize follow-up activities.

## Features

- Admin authentication with JWT
- Secure, token-protected lead management API
- Create, view, edit, and delete leads
- Track lead statuses: New, Contacted, and Converted
- Add notes to leads
- Schedule follow-up dates
- View upcoming follow-ups
- Dashboard statistics
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
│   ├── package.json
│   └── .env  # Local only; never commit
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