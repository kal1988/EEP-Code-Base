# Comprehensive Employee Data Management System (CEDMS)

![EEP Logo](https://img.shields.io/badge/EEP-Internal-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

A professional, full-stack internal enterprise application designed for Ethiopia Electric Power (EEP) to manage employee data, organizational structures, and business units efficiently.

## 🚀 Key Features

- **Administrative Dashboard**: Real-time overview of key metrics and recent activities.
- **Hierarchical Org Management**: Manage Business Units, Sub-Business Units, Departments, and Positions.
- **Employee Lifecycle**: Comprehensive employee profiles, position history, and data management.
- **Secure Authentication**: Robust JWT-based authentication for both backend and frontend.
- **Modern UI**: A sleek, responsive interface built with Next.js and Tailwind CSS.
- **Dockerized Architecture**: Seamless deployment using Docker and Docker Compose.

## 🛠 Technology Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Database**: PostgreSQL
- **Auth**: JWT-based secure authentication

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📂 Project Structure

```text
EEP-Code-Base/
└── Comprehensive Employee's Data Management System/
    ├── backend/           # FastAPI application & database logic
    ├── frontend/          # Next.js web application
    └── docker-compose.yml # Container orchestration
```

## 🚥 Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.10+ (for local development)
- Node.js 18+ (for local development)

### One-Step Setup
The quickest way to get the system running is using Docker Compose:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive API Docs**: `http://localhost:8000/docs`

## 👨‍💻 Development

For detailed setup instructions of individual components, please refer to their respective directories:
- [Backend Development Guide](./Comprehensive%20Employee's%20Data%20Management%20System/backend/)
- [Frontend Development Guide](./Comprehensive%20Employee's%20Data%20Management%20System/frontend/)

---
*Created by the EEP DevOps team to ensure a robust and neat codebase for our enterprise needs.*
