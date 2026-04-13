<img width="1919" height="962" alt="image" src="https://github.com/user-attachments/assets/2add7c89-624e-449c-b98e-b0102b24d33d" />

Zentrox App 🚀

Zentrox is a full-stack web application designed with a focus on high-security backend architecture and seamless data flow. This project demonstrates a complete MVC implementation using Node.js, Express, and MongoDB.

🛠 Tech Stack
Backend:Node.js, Express.js
Database: MongoDB with Mongoose ODM
Security:JWT (JSON Web Tokens), Bcrypt, Helmet, Express-Rate-Limit
File Handling: Multer, File-type
Logging: Morgan, Rotating-File-Stream
Frontend:Vanilla JavaScript, Axios, CSS3, HTML5

🔒 Key Backend Features

Robust Authentication:Secure login/register flow with JWT stored in HTTP-only cookies.
Password Management: Two-step password verification and reset functionality using Nodemailer.
Input Sanitization: XSS protection using DOMPurify and JSDom.
Security Middleware: Protection against brute-force attacks and common web vulnerabilities.
Advanced Logging: Automated log rotation for access, errors, and combined activity.



🚀 Getting Started

 1. Prerequisites
 Node.js (v18+)
 MongoDB (Local or Atlas)

### 2. Installation
bash
# Clone the repository
git clone https://github.com/yourusername/zentrox-app.git

# Navigate to the server folder and install dependencies
cd zentrox-app/server
npm install


3. Environment Setup
Create a .env file in the server directory based on the .env.example provided:
env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
 ... other variables


 4. Running the App
Start backend in development mode
npm run dev

 Open the frontend
Simply serve the /client folder using Live Server or a similar tool.

API Endpoints (Brief)

| Method | Endpoint              | Description                   |
|        |                       |                               |
| POST   | /api/v1/user/register | Create a new account          |
| POST   | /api/v1/user/login    | Authenticate user             |
| PUT    | /api/v1/user/password | Verify & Update password      |
| GET    | /api/v1/post          | Fetch all posts (Paginated)   |
| POST   | /api/v1/post          | Create post (Supports images) |


