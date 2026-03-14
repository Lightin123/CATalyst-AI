# CATalyst AI 🎓

CATalyst AI is an intelligent, Agentic RAG-powered tutor designed specifically to help university students prepare for exams (CAT/FAT). It dynamically generates step-by-step mathematical solutions, predicts realistic mock exams, and creates interactive rapid-fire quizzes—all strictly bound to the academic syllabus.

## 🌟 Features

*   **Adaptive Study Modes:**
    *   **📝 CAT / FAT Prep:** High-fidelity, factual explanations based strictly on historical vector-embedded past papers.
    *   **🧩 Concept Builder:** Gradual, step-by-step conceptual teaching (easy to hard) powered by a high-temperature creative LLM setup.
    *   **🔮 Predict Exam:** Generates fully structured 5-question (CAT) or 10-question (FAT) simulated test papers from the database.
    *   **⚡ Interactive Quizzes:** Detects quiz intent and instantly renders a rich React GUI inside the chat to test knowledge dynamically.
*   **Advanced AI Architecture:** Agentic RAG utilizing **LangGraph**, **pgvector** for cosine-similarity semantic search, and the lightning-fast **Groq Llama-3** model.
*   **Dynamic Temperature Control:** LLM parameters shift automatically based on the user's intent to prevent math hallucinations during strict solving, while allowing creativity during conceptual brainstorming.
*   **Secure Authentication:** Built-in JWT and `bcryptjs` secured login/registration system with route protection.
*   **Premium UI/UX:** Fast, glassmorphic, and highly responsive frontend built with React, Tailwind CSS, and Framer Motion.

---

## 🏗️ Tech Stack

### Frontend
*   **Framework:** React 18 + Vite + TypeScript (ESM)
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React
*   **Markdown & Math:** `react-markdown`, `remark-math`, `rehype-katex` (Robust double-escaped LaTeX parsing)

### Backend (Node.js - Authentication & Auth)
*   **Framework:** Express + TypeScript
*   **Database ORM:** Prisma
*   **Security:** JSON Web Tokens (JWT), bcryptjs

### Backend (Python - AI & Agentic RAG)
*   **Framework:** FastAPI
*   **Orchestration:** LangGraph & LangChain ecosystem
*   **LLM Provider:** Groq (Llama-3.1-8b-instant for routing, Llama-3.3-70b-versatile for tutoring)
*   **Vector Database:** PostgreSQL with `pgvector` extension (hosted on Neon Database)

---

## 🚀 Quick Start & Installation

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL database (Neon DB recommended) with `pgvector` enabled
*   Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/catalyst-ai.git
cd catalyst-ai
```

### 2. Node Backend Setup (Auth Server)
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
JWT_SECRET="your_secure_random_string"
```
Run database migrations and start the server:
```bash
npx prisma db push
npm run dev
```

### 3. Python Backend Setup (AI Agent Server)
Open a new terminal and navigate to the Python backend:
```bash
cd backend-py
python -m venv venv
# Activate the virtual environment:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend-py` directory:
```env
DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
GROQ_API_KEY="your_groq_api_key"
LLM_TEMPERATURE="0.7"
LLM_MAX_TOKENS="2048"
```
Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
Open a third terminal and navigate to the frontend:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application!

---

## 🧠 Database Architecture

The PostgreSQL database houses two primary data domains:
1.  **Users System (Managed by Prisma):** Tracks unique `User` accounts, encrypted passwords, `ChatSession` threads, and historical `Message` records.
2.  **Vector Store (Managed by Python/pgvector):** A highly optimized `past_questions` table holding dense arrays of mathematical past-paper questions and metadata (Exam Type, Module, Topic, Difficulty) allowing cosine similarity sorting via `$1::vector`.

---

## 🛡️ License

MIT License - feel free to build upon this project!
