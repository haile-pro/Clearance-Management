# Clearance Management System

A modern web application for managing clearance requests and approvals efficiently. Built with React.js for the frontend and Node.js/Express.js for the backend.

## Features

- User Authentication and Authorization
- Dashboard for Request Management
- Real-time Updates using Socket.io
- File Upload Capabilities
- Dark/Light Theme Support
- Responsive Design

## Tech Stack

### Frontend
- React.js with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI components
- Framer Motion for animations
- React Query for data fetching
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time features
- Multer for file uploads
- Joi for validation
- CORS for cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clearance-management-system
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd ../backend
npm install
```

4. Set up Environment Variables:

Create `.env` files in both frontend and backend directories:

Backend `.env`:
```plaintext
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

Frontend `.env`:
```plaintext
VITE_APP_API_URL=http://localhost:5000
```

### Running the Application

1. Start the Backend Server:
```bash
cd backend
npm start
```

2. Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── config/         # Database and other configurations
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── uploads/        # Uploaded files storage
│
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── assets/     # Static assets
│   └── public/         # Public assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.