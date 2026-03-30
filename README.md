<div align="center">
  <img src="public/logo.png" alt="StudyPoint Logo" width="150" />
  <h1>StudyPoint Educator Platform</h1>
  <p><strong>A Premium Learning Management System & EdTech Architecture Built on Next.js 16</strong></p>
</div>

---

## 📖 Overview

**StudyPoint** is a robust, dynamic educational platform engineered to provide students with high-quality academic resources, including JEE/NEET notes, Board Exam PDFs, structured video lectures, and premium guidance. Designed efficiently for maximum speed and SEO optimization, its architecture bridges the gap between scalable content management and an elite, distraction-free student experience.

## ✨ Core Features

* **⚡ Blazing Fast Architecture**: Built strictly on **Next.js 16** (App Router) combined with **React 19** for unparalleled edge-rendering.
* **🛡️ Secure Authentication**: Fortified using **NextAuth.js**, **Bcryptjs**, and **JWT** session handling protecting administrative dashboards.
* **🚀 Elite Technical SEO**: Granular dynamic Meta parameter injection, OpenGraph integration, and automated XML Sitemaps.
* **🗄️ Scalable Content Infrastructure**: Driven by a seamless **Mongoose/MongoDB** backend integration and **ImageKit** for asset delivery.

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Vanilla CSS (Blue & White Custom Design System) |
| **Database** | MongoDB (via Mongoose ODM) |
| **Authentication** | NextAuth.js, JWT, Bcrypt |
| **Media & Assets** | ImageKit (CDN) |
| **Email Services** | Nodemailer |

---

## 🚀 Deployment Guide (Vercel)

This application is built symmetrically for deployment on **Vercel**. 

### 1. Environment Variables Configuration
Before deploying, you must configure the following Environment Variables in your Vercel Project Settings:

```env
# MongoDB Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/studypoint"

# NextAuth Security
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="<generate-a-strong-random-secret>"

# Default Admin Credentials
ADMIN_EMAIL="admin@studypoint.com"
ADMIN_PASSWORD="<secure-initial-password>"

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="<your-public-key>"
IMAGEKIT_PRIVATE_KEY="<your-private-key>"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/<your-endpoint>"

# Nodemailer Settings (SMTP)
EMAIL_USER="no-reply@studypoint.com"
EMAIL_PASS="<app-password>"
```

---
<div align="center">
  <p>&copy; StudyPoint Edutech. Designed for Excellence.</p>
</div>
