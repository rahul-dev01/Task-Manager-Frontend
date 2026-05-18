
# TaskManager - Frontend

TaskManager is a modern web application for managing projects and tasks, built with React + TypeScript + Vite.

## Features

- User Authentication (Signup/Login)
- Project Management (Create projects, add/remove members)
- Task Management (Create, edit, delete, update status)
- Dashboard with statistics
- Role-based access control (Admin/Member)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB running locally or MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone &lt;repository-url&gt;
cd TaskManager/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the frontend directory with:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.node.json
```

## Usage

1. **Sign Up**: Create an account as either Admin or Member
2. **Login**: Access your account with your credentials
3. **Create Projects**: (Admins only) Create new projects and add members
4. **Manage Tasks**: Create tasks, assign them, update status, set priorities
5. **View Dashboard**: See statistics about your tasks and projects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

