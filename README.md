# ⚡ JudgeLite – Modern Online Judge & Coding Arena

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-VS_Code_Engine-007acc?style=flat&logo=visual-studio-code)](https://microsoft.github.io/monaco-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **JudgeLite** is a fast, responsive, and modern online coding judge and practice arena built with **Next.js 13 (App Router)**, **TypeScript**, **Tailwind CSS**, **Monaco Editor**, and **Supabase**. It grades algorithm solutions in real time across C++, Java, and Python with a batched, fail-fast test execution engine.

---

## 🌟 Key Features

* **📚 35 Curated Algorithmic Problems:**
  - Spans **Easy**, **Medium**, and **Hard** across Arrays, Strings, Two Pointers, Dynamic Programming, Binary Search, and Stack.
  - Complete with rich Markdown statements, clear input/output formats, examples, explanations, and constraints.
* **🧪 20 Test Cases per Problem (700 Total):**
  - **2 Sample Test Cases** with copy-to-clipboard functionality for local verification.
  - **18 Hidden Edge Cases** testing boundary conditions, negative integers, duplicates, single elements, and stress inputs.
* **⚡ Batched Fail-Fast Judging:**
  - Evaluates submissions in parallel batches of 5.
  - Halts immediately on the first failure (`WA`, `TLE`, `CE`, `RE`) for sub-second user feedback and optimal API efficiency.
* **🏆 Contests & Timed Challenges:**
  - Dedicated `/contests` arena showcasing active and upcoming coding competitions with countdown timers and difficulty tiers.
* **🎲 Quick Practice ("Pick Random"):**
  - Instant one-click random problem picker to jump straight into algorithmic problem solving without decision fatigue.
* **👤 Coder Profile & Analytics Dashboard:**
  - Dynamic rank badges (`Grandmaster`, `Master`, `Specialist`, `Knight`, `Coder`) and daily streak tracking.
  - Interactive SVG Solved Ring Chart with difficulty breakdown (Easy, Medium, Hard).
  - 365-day submission activity heatmap with date tooltips and DSA topic mastery progress.
* **💡 3-Tab Problem Workspace (Description, Hints & Editorial):**
  - Progressive collapsible hints (Intuition, Data Structure, Target Complexity).
  - Locked editorial system unlocking upon Accepted (`AC`) submission with step-by-step walkthroughs and multi-language optimal solutions.
* **💻 VS Code Monaco Editor with Custom Testcase & Diff Viewer:**
  - Tabbed bottom drawer (`Custom Testcase` with live `stdin` execution vs `Test Result`).
  - Side-by-side 3-column diff viewer on Wrong Answer (`WA`) comparing Input, Expected Output, and Your Output.
  - "Beats X% of Users" runtime percentile banner and estimated algorithmic complexity badge on `AC`.
  - Celebratory confetti particle explosion and keyboard shortcuts (`Ctrl+Enter`, `Ctrl+Shift+Enter`).
* **📊 Submission Tracking & Code Inspection Modal:**
  - Strictly private LeetCode-style personal submission history with execution metrics and full code viewer.
* **🔐 Authentication & Database:**
  - Supabase Auth (Email/Password) with PostgreSQL and Row-Level Security (RLS).
  - Resilient hybrid sync between Supabase and local storage.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 13](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism Theme |
| **Code Editor** | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| **Judge Sandbox** | [Judge0 CE API](https://ce.judge0.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL with RLS) |
| **Markdown Parser**| [marked](https://marked.js.org/) |

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/JudgeLite.git
cd JudgeLite
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup
1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to the **SQL Editor**.
2. Run the SQL script located in [`001_init_judgelite.sql`](./001_init_judgelite.sql).
3. Seed all 35 problems and 700 test cases:
```bash
node generate-20-testcases.js
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📂 Project Structure

```text
JudgeLite/
├── app/                        # Next.js 13 App Router Pages
│   ├── page.tsx                # Hero Landing Page
│   ├── problems/               # Problems List & Problem Workspace
│   │   ├── page.tsx            # Problem listing with difficulty filters
│   │   └── [slug]/page.tsx     # Dynamic Problem Workspace
│   ├── submissions/page.tsx    # Submissions Table & History
│   ├── login/page.tsx          # Authentication (Sign In / Register)
│   ├── globals.css             # Design tokens & Markdown typography
│   └── layout.tsx              # Root Layout & Navigation Bar
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── Navbar.tsx          # Top navigation with active tab indicators
│   │   ├── ProblemEditor.tsx   # Monaco workspace & judge runner
│   │   └── CopyButton.tsx      # One-click copy for test cases
│   └── lib/supabase/           # Supabase Client & Admin singletons
├── 001_init_judgelite.sql      # Database schema (tables, views, RLS policies)
├── generate-20-testcases.js    # Automated seeder for 35 problems & 700 test cases
└── .env.example                # Environment variables template
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
