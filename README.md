🌾 IndraAI (इंद्र AI)
The Voice-First Agri-Intelligence Platform for Maharashtra

IndraAI is a comprehensive, dual-sided platform designed to solve two massive problems in the Indian agricultural sector:

For Farmers: A zero-typing, 100% voice-based Marathi AI farm manager that logs expenses, tracks crop cycles, provides weather advisories, and calculates ROI.

For Agri-Input Enterprises: A real-time analytics dashboard powered by anonymized, geo-tagged data from farmers, providing unprecedented last-mile visibility into agricultural demand.

📖 Table of Contents
The Idea & Business Model

Key Features

Technical Architecture

Database Schema (Firebase)

Setup & Installation Guide

Roadmap

Contributing

💡 The Idea & Business Model
The Problem: Farmers rarely track their seasonal expenses leading to unknown ROI, and typing in regional languages is a major friction point. On the other side, Agri-input companies (seeds, fertilizers, pesticides) have zero real-time visibility into local field-level demand, resulting in inefficient supply chains.

The Solution: The "Credit-for-Data" Flywheel

Farmer Logs Data: The farmer simply presses a microphone and speaks in natural Marathi (e.g., "I bought 3 bags of Urea for ₹1500"). IndraAI automatically categorizes the expense.

Anonymized Pool: Personal Identifiable Information (PII) is stripped. The data is aggregated by district, crop, and input category.

Enterprise Insights: Agri-companies pay to access the Enterprise Dashboard to query real-time demand (e.g., "How many farmers in Nashik bought DAP this week?").

Smart Credits: Farmers are rewarded with "Smart Credits" for logging data, which they can redeem for discounts at local agri-retailers.

✨ Key Features
👨‍🌾 Farmer Application (Mobile-First PWA)
The "Walkie-Talkie" Interface: A massive, central microphone button. No typing required.

100% Native Marathi Voice AI: Uses Sarvam AI to understand local dialects, extract mathematical intents, and speak back to the farmer.

Automated Ledger & ROI: Automatically links spoken expenses/income to the correct active crop cycle and calculates profitability.

Community Notice Board (Market Prices): Real-time, crowdsourced APMC market prices pulled directly from what nearby farmers are selling their crops for.

Setup Wizard (Practice Mode): Allows users without API keys to test the UI using pre-programmed mock responses.

🏢 Enterprise Dashboard (Desktop-Optimized)
Real-Time Demand Heatmaps: Visualizes which districts are purchasing specific fertilizers or reporting specific pest issues.

Natural Language Query Builder: Instead of SQL, marketing teams can ask questions in plain English (e.g., "What is the most common pest issue in Vidarbha right now?"), and the AI parses the real Firebase database to answer.

Price Gap Analysis: Compares the actual selling price recorded by farmers against the government MSP.

⚙️ Technical Architecture
IndraAI is decoupled into a React frontend and a Node.js/Express backend to ensure mobile performance and secure API key management.

1. Frontend (Client)
Framework: React 18 (Vite)

Styling: Tailwind CSS (Custom earthy palette: wheat, leaf, soil, mud)

Animations: Framer Motion (Smooth page transitions, sliding bottom-nav, pulsing mic)

Data Visualization: Recharts (Pie charts for expenses, Area charts for activity, Bar charts for market comparisons)

Icons: Lucide React

Routing: React Router DOM

2. Backend (Headquarters)
Environment: Node.js + Express

Database: Firebase Admin SDK (Firestore)

Audio Handling: Multer (Memory Storage) + Form-Data for API transit.

AI Engine (Sarvam AI Pipeline):

Ears (STT): saaras:v2 model converts spoken Marathi audio .webm to text.

Context Assembly: Backend retrieves recent farm activities and local market prices from Firebase to build a prompt context.

Brain (LLM): sarvam-105b extracts intent, categorizes expenses, outputs JSON, and generates a Marathi response.

Mouth (TTS): bulbul:v1 converts the Marathi response back to a base64 audio stream.

🗄️ Database Schema (Firebase)
The Firestore NoSQL database is structured into four main collections:

users: Farmer profiles (Name, Phone, District, Total Smart Credits).

cycles: Active crop lifecycles (Crop name, Land area, Sowing Date, Current Phase).

ledger: Financial transactions (Income/Expense, Amount, Category, Market/District, Date).

activities: Farm diary entries (Pest spotting, plowing, spraying, weather notes).

🚀 Setup & Installation Guide
Prerequisites
Node.js (v18+)

A Firebase Project (with Firestore enabled)

A Sarvam AI API Key (Get it from Sarvam AI Dashboard)

1. Backend Setup (Node.js)
Navigate to the backend directory:

Bash
cd indra-ai-backend
npm install
Download your Firebase Admin serviceAccountKey.json from the Firebase Console and place it in the backend root.

Create a .env file in the backend root:

Code snippet
PORT=5000
SARVAM_API_KEY=your_sarvam_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
Start the server:

Bash
npm start
2. Frontend Setup (React/Vite)
Navigate to the frontend directory:

Bash
cd indra-ai-frontend
npm install
Create a .env file in the frontend root with your Firebase Client config:

Code snippet
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Start the development server:

Bash
npm run dev
Open the app in your browser. Go through the Setup Wizard to configure your connection. Note: If you don't have a Sarvam Key yet, select "Use Practice Mode" in the wizard to test the UI.

🗺️ Roadmap
Phase 1 — Core MVP (✅ COMPLETED)

Marathi Voice AI Integration (Sarvam STT/TTS/LLM)

Multi-Crop Cycle Management

Geo-tagged Ledger System

Crowdsourced APMC Market Price Intelligence

Enterprise Analytics Dashboard & Natural Language Querying

Phase 2 — Growth (🔄 Q1 2025)

Retailer Module (QR code redemption for Smart Credits)

Purchase receipt verification (OCR)

GPS-based farmland boundary mapping

Push notifications (price spikes, rain alerts)

Phase 3 — Intelligence (📅 Q2 2025)

Predictive price forecasting (Custom ML model)

Pest/disease photo detection (Computer Vision AI)

Maharashtra 7/12 land record integration

PM-KISAN + crop insurance linkage

Phase 4 — Platform (🚀 Future Vision)

B2B Agri-Input Marketplace inside the app

Micro-credit scoring derived from ledger data

Satellite imagery + NDVI crop health monitoring

Expansion to other states (Hindi support)

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

Built with ❤️ for the farmers of Maharashtra.