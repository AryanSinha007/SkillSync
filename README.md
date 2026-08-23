# SkillSync 🚀

**SkillSync** is a student collaboration and team-building platform designed to help students find suitable teammates based on their **skills, interests, course, and availability**.

The platform makes project collaboration easier by allowing students to create profiles, showcase their skills, discover other students, and build teams with people who complement their abilities.

## 📌 Problem Statement

Students often face difficulties finding the right teammates for academic projects and hackathons. They may know people from their class but may not know their skills, interests, or availability.

SkillSync solves this problem by providing a centralized platform where students can discover potential teammates based on their profiles and skills.

## 🎯 Objectives

* Help students find suitable project teammates.
* Allow students to showcase their technical and non-technical skills.
* Match students with teammates having complementary skills.
* Make team formation faster and easier.
* Provide a centralized platform for student collaboration.
* Improve project teamwork by connecting students with relevant skills.

## ✨ Features

### 👤 Student Profiles

Students can create and manage their profiles with information such as:

* Name
* College
* Course
* Academic year
* Bio
* Skills
* Skill proficiency
* Availability

### 🔎 Student Discovery

Students can browse and discover other users based on their skills and profile information.

### 🧠 Skill-Based Matching

SkillSync helps students identify potential teammates based on their skills and requirements.

### 👥 Team Management

Users can create and manage teams and view their team members.

### 📩 Invitations

Students can invite other users to join their team.

### 🔐 Authentication

The application provides user authentication and protected access to user-specific features.

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* React Router
* CSS

### Backend / Database

* Supabase
* PostgreSQL
* Supabase Authentication

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

## 🏗️ Project Structure

```text
SkillSync/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/SkillSync.git
```

### 2. Navigate into the project

```bash
cd SkillSync
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your own Supabase project credentials.

### 5. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 🔒 Environment Variables

Do **not** upload your `.env` file to GitHub.

The repository should contain a `.env.example` file instead:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 🗄️ Database

SkillSync uses Supabase for authentication and database management.

The database stores information related to:

* Students
* Skills
* Student skills
* Teams
* Team members
* Invitations
* User profiles

Row Level Security (RLS) policies can be used to ensure users can only access data they are authorized to access.

## 🔄 Application Flow

```text
User Registration
       ↓
Create Student Profile
       ↓
Add Skills & Availability
       ↓
Discover Students
       ↓
Find Suitable Teammates
       ↓
Send Team Invitation
       ↓
Accept Invitation
       ↓
Create / Join Team
       ↓
Collaborate on Project
```

## 📸 Screenshots

Add screenshots of the application here as the project UI is completed.

Example:

```text
Home Page
Dashboard
Student Discovery
Student Profile
Team Page
```

## 🚀 Future Enhancements

* Advanced skill-based recommendation algorithm
* AI-powered teammate matching
* Project-based team recommendations
* Real-time chat between team members
* Team project management
* Notifications
* GitHub profile integration
* LinkedIn profile integration
* Skill assessment and verification
* Hackathon team matching
* Resume/profile generation

## 👨‍💻 Development

This project is being developed as a student software project to demonstrate concepts including:

* React development
* TypeScript
* Authentication
* Database management
* CRUD operations
* User profile management
* Team management
* API/database integration
* Responsive UI design

## 📄 License

This project is intended for educational and academic purposes.

## ⭐ Contributing

Contributions and suggestions are welcome.

If you find an issue or have an idea for improving SkillSync, feel free to create an issue or submit a pull request.

---

**SkillSync – Find the right skills. Build the right team. 🚀**
