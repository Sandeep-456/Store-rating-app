# ⭐ Store Rating App

A full-stack web application where users can rate stores, view store details, and manage their profiles. It also includes dashboards for admins and store owners to manage users, stores, and ratings.

---

Live link: https://store-rating-app-xi.vercel.app/

---

Login credientials:

user: chakri@example.com/ Chakri@123
store_owner: store@system.com/ Store@12345678
addmin: Sandy@system.com/ Sandy@123

---

## 🚀 Features

- ✅ User authentication (Login, Register)
- ⭐ Rate stores and view average ratings
- 🛍 Store owners can manage their own store ratings
- 🛡 Admin dashboard to manage users, stores, and ratings
- 🧠 Role-based access with protected routing
- 💬 Confirmation and success modals
- 🎨 Beautiful UI with responsive design

---

## 🛠 Technologies Used

### Frontend:
- React.js
- React Router
- CSS3
- React Icons
- `react-modal` for modals
- `react-confirm-alert` for confirmation popups
- Cookies (via `js-cookie`)

### Backend:
- Node.js
- Express.js
- MySQL
- JWT for authentication
- bcrypt for password hashing
- `cors`, `dotenv`, `cookie-parser`

### Testing:
- Jest
- Supertest

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js and npm
- MySQL installed and running

---

### 📁 Folder Structure

```plaintext
store-rating-app/
├── backend/
├── frontend/
└── README.md


🔙 Backend Setup

cd backend
npm install

1.Create a .env file and add:

PORT=5000
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating

2.Create database and tables using MySQL:

CREATE DATABASE store_rating;
USE store_rating;
-- Run your schema scripts here

3.Start backend:

npm start

------/---------/-----------
💻 Frontend Setup

cd frontend
npm install
npm start
--->Runs at: http://localhost:3000



🔒 Authentication & Roles
| Role        | Access                                |
| ----------- | ------------------------------------- |
| User        | Rate/view stores, profile page        |
| Store Owner | Dashboard to view own store ratings   |
| Admin       | Full access to users, stores, ratings |

---

📊 API Endpoints

Auth:
POST /api/auth/login → Login user

POST /api/auth/signup → Register user

GET /api/auth/me → Get user details (token required)

---

Admin:
GET /api/admin/dashboard → Total counts

POST /api/admin/users → Add new user

GET /api/admin/users → View users

PUT /api/admin/users/:id → Update user

DELETE /api/admin/users/:id → Delete user

GET /api/admin/stores → View stores

POST /api/admin/stores → Add store

PUT /api/admin/stores/:id → Update store

DELETE /api/admin/stores/:id → Delete store

GET /api/admin/ratings → View all ratings

PUT /api/admin/ratings/:id → Update rating

DELETE /api/admin/ratings/:id → Delete rating

---

🧪 Testing
✅ Unit & Integration Tests (Backend)

cd backend
npm test
Test files are located in backend/test/ using Jest and Supertest.

Example:

// backend/test/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  it('should fail login with missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

----

🚀 Deployment Instructions
Frontend (e.g. Vercel or Netlify)
1.Build app:

npm run build


2.Upload /build directory or connect repo to Vercel/Netlify.

Backend (e.g. Render, Railway)
--Upload the code and environment variables

--Configure MySQL (or use hosted db like PlanetScale)

--Ensure CORS and API endpoints are publicly accessible

📌 Screenshots
Add screenshots of dashboard, rating cards, admin panel etc.

🤝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

📄 License
This project is open-source under the MIT License.

🙌 Acknowledgements
Built with ❤️ using React and Node.js

Inspired by modern admin panels and rating systems

---

### ✅ To Use:

1. Save this content in your root directory as `README.md`.
2. If you're using Git:
```bash
git add README.md
git commit -m "Add complete project documentation"
git push
Let me know if you'd like me to generate a downloadable .md file too!
