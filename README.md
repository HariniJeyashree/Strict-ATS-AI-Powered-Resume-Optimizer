# Strict-ATS: AI-Powered Resume Optimizer 🚀

Strict-ATS is a sophisticated Full-Stack application designed to help job seekers bypass automated filters. It uses Large Language Models (LLMs) to provide an "ATS-eye view" of a resume, offering real-time scoring, critical feedback, and an optimized version of the resume tailored to a specific Job Description.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Groq](https://img.shields.io/badge/Llama_3.3-Groq-orange)

## ✨ Core Features

- **Semantic ATS Scoring:** Uses Llama 3.3 (via Groq) to calculate a 0-100% match rating based on context, not just keyword counting.
- **Deep Feedback Analysis:** Identifies missing skills, formatting issues, and structural gaps.
- **AI Resume Restructuring:** Generates a fully optimized version of your resume content ready for copy-pasting.
- **History Management:** Automatically saves every scan to a PostgreSQL database, allowing users to track their progress over time.
- **PDF Generation:** Integrated functionality to export the AI-optimized results.

## 🛠️ Tech Stack

### Frontend
- **React.js** with **TypeScript**
- **Tailwind CSS** for a modern, responsive UI
- **TanStack Query** for efficient server-state management
- **Lucide React** for iconography

### Backend
- **Node.js** & **Express**
- **Groq Cloud SDK** (Utilizing the Llama-3.3-70b-versatile model)
- **Drizzle ORM** for type-safe database interactions
- **PostgreSQL** for persistent data storage

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/HariniJeyashree/Strict-ATS-AI-Powered-Resume-Optimizer.git](https://github.com/HariniJeyashree/Strict-ATS-AI-Powered-Resume-Optimizer.git)
   cd Strict-ATS-AI-Powered-Resume-Optimizer

```

2. **Install Dependencies**
```bash
npm install

```


3. **Configure Environment Variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key

```


4. **Prepare the Database**
```bash
npx drizzle-kit push

```


5. **Run the Application**
* **Start Backend:** `npx tsx server/index.ts`
* **Start Frontend:** `npm run dev`



## 📊 Database Schema

The application uses a relational schema managed via Drizzle ORM:

* `id`: Serial primary key
* `filename`: Name of the uploaded scan
* `content`: Original resume text
* `analysis`: Full AI-generated report (Score + Feedback + Optimized Text)
* `createdAt`: Automatic timestamping

## 👤 Author

**Harini Jeyashree**

* GitHub: [@HariniJeyashree](https://www.google.com/search?q=https://github.com/HariniJeyashree)
* LinkedIn: [Your Profile Link Here]

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

```
