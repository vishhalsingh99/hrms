# 🏢 VivaHRM - Enterprise HR Management System

**VivaHRM** is a robust, full-stack Human Resource Management System designed to streamline organizational workflows, manage employee lifecycles, and automate HR processes. Built with a focus on **security, scalability, and clean architecture**.

---

## 🚀 Features

### 🔐 Security & Authentication
- **Hybrid JWT Auth:** Dual token system (Access & Refresh Tokens) for maximum security.
- **Secure Storage:** Tokens stored in `httpOnly` cookies to prevent XSS attacks.
- **Password Hashing:** Industry-standard encryption using `bcryptjs`.

### 👥 Employee Management
- **RBAC (Role-Based Access Control):** Granular permissions for **Admin**, **Manager**, and **Employee**.
- **Profile Management:** Centralized user data including roles, contact info, and department details.
- **User Lifecycle:** Full CRUD operations for managing employees.

### ⚡ Technical Highlights
- **Global State Management:** Managed via React **Context API** and `useReducer` for predictable data flow.
- **Database Excellence:** MySQL with **Sequelize ORM**, featuring complex associations and hooks.
- **Axios Interceptors:** Automatic token refreshing in the background for a seamless UI experience.
- **Responsive UI:** Modern, clean dashboard built with **Tailwind CSS**.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL, Sequelize ORM |
| **State Management** | Context API (useReducer) |
| **Auth** | JSON Web Tokens (JWT), Bcrypt.js |

---

## 📁 Project Structure
```text
├── backend/
│   ├── config/         # Database & Env configurations
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Auth & Error middlewares
│   ├── models/         # Sequelize schemas
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios instance & interceptors
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # AuthContext & State
│   │   ├── pages/      # Login, Dashboard, etc.
│   │   └── App.jsx     # Routing & Layout


## ⚙️ Getting Started

