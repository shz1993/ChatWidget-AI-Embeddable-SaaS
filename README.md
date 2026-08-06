# 🤖 ChatWidget AI — Embeddable Customer Support SaaS

**ChatWidget AI** is an *AI Customer Support Floating Widget* SaaS platform that can be embedded into any online store website, landing page, Shopify, WordPress, or custom app with just **1 line of script code**.

Powered by a **RAG (Retrieval-Augmented Generation)** engine, **384D Vector Search**, and **Groq Llama 3.3 70B**, this chatbot answers visitor queries accurately based on your store's SOPs and FAQs with real-time streaming responses.

---

## ✨ Key Features

- 🎨 **Multi-Bot Management & Customization**: Create multiple chatbots for different stores, customize theme primary colors, welcome messages, and lead capture forms.
- 🧠 **RAG & Vector Knowledge Base**: Upload store SOP/FAQ documents. The system automatically chunks text and generates 384-dimensional vector embeddings directly inside PostgreSQL.
- ⚡ **Real-time AI Streaming Response**: Ultra-fast responses with a typewriter streaming effect using the `llama-3.3-70b-versatile` model via Groq.
- 🔌 **1-Line Embed Script (Iframe Isolation)**: The widget runs inside an isolated Iframe (`public/widget.js`), ensuring the widget CSS **never conflicts with or breaks** the target website design.
- 📊 **Lead Capture & Prospect Dashboard**: Built-in Name & Email registration form before chatting, complete with live preview and a dedicated prospect management page (`/leads`).
- 🧪 **Instant Live Preview**: Test widgets directly from the Admin Dashboard without manually editing HTML files.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Lucide React Icons |
| **Database** | Neon Serverless PostgreSQL + `pgvector` Extension |
| **ORM** | Drizzle ORM & Drizzle Kit |
| **LLM Engine** | Groq SDK (`llama-3.3-70b-versatile`) |
| **Vector Embedding** | `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`) |
| **Text Chunking** | `@langchain/textsplitters` |

---

## 📁 Project Structure

chatwidget-ai/
├── public/
│   ├── widget.js              # Lightweight loader script to inject widget Iframe
│   └── test.html              # Test page simulating target website
├── src/
│   ├── actions/
│   │   ├── bots.ts            # Server Actions for Bot CRUD management
│   │   └── knowledge.ts       # Server Actions for RAG & Vector processing
│   ├── app/
│   │   ├── api/widget/
│   │   │   ├── chat/route.ts  # API for Vector Cosine Search & Groq Stream Engine
│   │   │   └── lead/route.ts  # API for capturing visitor lead data
│   │   ├── bots/[id]/page.tsx # Bot Configuration & SOP Upload Dashboard
│   │   ├── leads/page.tsx     # Captured Leads / Prospects Dashboard
│   │   ├── widget/[botId]/    # Chatbot UI View inside Iframe
│   │   └── page.tsx           # Main Dashboard (Bot List)
│   ├── db/
│   │   ├── index.ts           # Neon DB Connection
│   │   └── schema.ts          # Drizzle Schema (Bots, BotKnowledge, Leads, ChatLogs)
│   └── lib/ai/
│       └── embedding.ts       # MiniLM Transformer Embeddings Utility
├── .env.local
├── drizzle.config.ts
└── package.json

---

## 🚀 Local Installation Guide

### 1. System Prerequisites
Ensure you have installed:
- Node.js (v18.x or higher)
- Neon PostgreSQL Database (Free at neon.tech)
- Groq API Key (Free at console.groq.com)

### 2. Clone Repository & Install Dependencies
git clone https://github.com/shz1993/ChatWidget-AI-Embeddable-SaaS.git
cd ChatWidget-AI-Embeddable-SaaS
npm install

### 3. Configure Environment Variables
Create a .env.local file in the root folder of the project:

DATABASE_URL="postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
GROQ_API_KEY="gsk_your_groq_api_key_here"

### 4. Enable pgvector Extension & Sync Database
Enable the pgvector extension in Neon DB, then push the Drizzle schema:

npx drizzle-kit push

(If a vector type does not exist error appears, run CREATE EXTENSION IF NOT EXISTS vector; in the Neon Console SQL Editor).

### 5. Run Development Server
npm run dev

Open http://localhost:3000 in your browser.

---

## 📌 How to Embed Widget on Any Website

Once a bot is created in the admin dashboard and SOP/FAQ data is uploaded:

1. Copy the Embed Script Tag from your bot's configuration page:
   <script src="https://your-saas-domain.vercel.app/widget.js" data-bot-id="YOUR-BOT-ID"></script>

2. Paste this 1 line of code right before the closing </body> tag of your HTML file or website template.
3. The floating blue chat button will automatically appear and assist visitors 24/7!

---


## 📜 License

This project was built for educational and self-hosted SaaS development purposes under the MIT License. Free to modify and scale!