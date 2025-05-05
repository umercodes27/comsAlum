# Social Media MERN Project

This is a full-stack social media web application built with the MERN stack (MongoDB, Express, React, Node.js). The project consists of a React frontend and an Express backend API server.

## Technologies Used

- **Frontend:** React, Vite, Material UI, Redux Toolkit, React Router, Formik, Yup
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, GridFS, Helmet, CORS, Morgan
- **Others:** dotenv for environment variables, ESLint for linting

## Project Structure

```
/client       # React frontend application
/server       # Express backend API server
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB instance (local or cloud)
- npm or yarn package manager

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd social-media-mern
```

2. Install dependencies for both client and server:

```bash
cd client
npm install

cd ../server
npm install
```

3. Configure environment variables:

Create a `.env` file in the `server` directory with the following variables (example):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Adjust values as needed.

### Running the Application

#### Start the backend server

```bash
cd server
node index.js
```

Or use nodemon if installed for auto-restart on changes:

```bash
nodemon index.js
```

#### Start the frontend development server

```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000` (default Vite port).

### Building for Production

To build the frontend for production:

```bash
cd client
npm run build
```

The build output will be in the `client/dist` folder.

## Features

- User authentication with JWT
- User profiles
- Posting and viewing posts
- File uploads with GridFS
- Responsive UI with Material UI
- State management with Redux Toolkit

## License

This project is licensed under the MIT License.
