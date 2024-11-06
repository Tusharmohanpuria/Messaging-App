# Messaging App

Welcome to the **Messaging App** repository, a cutting-edge web-based platform designed to revolutionize real-time communication. Leveraging the powerful combination of React.js frontend and Node.js backend, our system introduces innovative features to streamline messaging processes efficiently.

## Key Features:

1. **User Registration and Authentication:**
   - Secure user registration and login using email and password.

2. **Real-Time Messaging:**
   - Experience instant communication with real-time message delivery powered by Socket.IO.

3. **Message History:**
   - Access and review past conversations with a comprehensive message history feature.

4. **Online Status Tracking:**
   - Stay informed with real-time online status updates for all contacts.

5. **User Management for Administrators:**
   - Empower administrators with tools to view, update, and manage user information.

## Technology Stack:

- **Frontend:** React.js, React Bootstrap, Socket.IO-client
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MySQL

# Project Setup

This project contains instructions for setting up a development environment with Node.js, MySQL, and necessary dependencies for Frontend and Backend.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MySQL](https://dev.mysql.com/downloads/mysql/) installed

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/username/messaging-app.git
   cd messaging-app
   ```

2. Install Backend Dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install Frontend Dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Set up Environment Variables:

   Create a `.env` file in the `backend` directory and add the following:

   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=messaging_app
   JWT_SECRET=your_jwt_secret
   ```

5. Start the Backend Server:

   ```bash
   cd ../backend
   npm start
   ```

6. Start the Frontend Development Server:

   ```bash
   cd ../frontend
   npm start
   ```

   The application will be accessible at `http://localhost:3000`.

## Project Demo

Explore the Messaging App through this informative video hosted on YouTube:

[![Messaging App Demo](https://img.youtube.com/vi/2Z3UclYw8zQ/0.jpg)](https://www.youtube.com/watch?v=2Z3UclYw8zQ)

## Note

- Ensure all prerequisites are installed before running the application.
- If issues arise, check error messages and verify that all dependencies are correctly installed.
- To stop the servers, use Ctrl+C in the respective terminal windows.
- To restart the servers, rerun the npm start commands in the backend and frontend directories.

## Contributions

We welcome contributions to enhance the Messaging App. If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.
