# ChatApp

ChatApp is a real-time messaging application that allows users to send text messages and share files with friends and colleagues. The application is built using modern web technologies, including React, Vite, Node.js, Express, and MongoDB.

## Features

- **Real-time Messaging**: Send and receive text messages instantly.
- **File Sharing**: Share files securely with your contacts.
- **User-Friendly Interface**: A clean and intuitive design built with React and Vite.
- **Secure Backend**: A Node.js and Express-based backend ensures secure data transmission.
- **Database Support**: MongoDB for robust and scalable data storage.

## Installation

Follow these steps to set up the project locally:

### Prerequisites

- Node.js and npm installed on your system.
- MongoDB installed and running locally or accessible via a cloud service.

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to the frontend development server (usually `http://localhost:5173`).
2. Create an account or log in to start chatting.
3. Add friends or colleagues to your contact list.
4. Send text messages or share files directly with them.

## Project Structure

```
ChatApp/
├── backend/
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── controllers/    # Request handlers
│   ├── server.js       # Express server setup
│   └── package.json    # Backend dependencies
├── frontend/
│   ├── src/            # React components and pages
│   ├── public/         # Static files
│   └── package.json    # Frontend dependencies
└── README.md           # Project documentation
```

## Technologies Used

### Frontend
- React
- Vite

### Backend
- Node.js
- Express

### Database
- MongoDB

## Scripts

### Install Dependencies
Install all required packages for both backend and frontend:
```bash
npm install
```

### Run Development Servers
Start both backend and frontend servers:
```bash
npm run dev
```

## Contributing

Contributions are welcome! If you have any suggestions or encounter issues, please feel free to open an issue or create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or support, please contact the development team at support@chatapp.com.

