# Otovize App - 2025 YTU Meta Llama Hackathon

## 🧭 1. Project Description and Purpose

**Oto Vize** is an AI-powered automation platform that modernizes the visa application process.
It simplifies traditional, complex, and stressful visa procedures, allowing users to complete the entire process **in a single digital environment**, error-free and quickly.

**Purpose:**
- Automate form filling, document verification, and social media review steps
- Accelerate personalized document checklist creation, error-free form filling, and letter of intent generation processes
- Increase users' application acceptance rate and save time  

---

## ⚙️ 2. Installation Instructions  

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn
- Firebase account
- Google Cloud account (for AI model deployment)

### Steps  

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Metafor-Visa-Automation/llama-hackathon.git
   cd llama-hackathon
   ```

2. **Backend setup:**
   ```bash
   cd backend
   python -m venv env
   source env/bin/activate  # (For Windows: env\Scripts\activate)
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Add environment variables (.env):**
   ```env
   FIREBASE_API_KEY=...
   GCP_API_KEY=...
   OLLAMA_MODEL=llama3
   ```

5. **Open the application in browser:**
   ```
   http://localhost:5173
   ```

---

## 💻 3. Usage Guide

### 🔹 Form Automation
Basic information collected from the user is automatically processed into official forms such as DS-160 or Schengen.

### 🔹 Document Checklist
A personalized document list is created according to the user's profile (student, employee, family member, etc.).

### 🔹 Document OCR & Verification
Date, signature, or inconsistent data errors in uploaded documents are automatically detected.

### 🔹 Letter of Intent Generation
A professional letter of intent draft is created based on the user's profile and travel plan.

### 🔹 Social Media Analysis
AI detects risky or contradictory social media content that may conflict with the application and provides solution suggestions.

---
## 💻 Demo Photos
![WhatsApp Görsel 2025-10-26 saat 11 57 27_0950d49b](https://github.com/user-attachments/assets/282633e9-acdc-4526-9ff5-853d5fcf41ae)
![WhatsApp Görsel 2025-10-26 saat 11 57 27_6de32355](https://github.com/user-attachments/assets/421c8565-dc70-4f28-88f9-1d2c2a2690f5)
![WhatsApp Görsel 2025-10-26 saat 11 57 27_078b2f49](https://github.com/user-attachments/assets/aabfd2e9-ba00-4de2-bb4f-9e6ab9d1ce15)
![WhatsApp Görsel 2025-10-26 saat 11 57 28_365ed608](https://github.com/user-attachments/assets/4c297643-fa11-4f3d-ad57-ec4f98a3a24a)
![WhatsApp Görsel 2025-10-26 saat 11 57 28_6d0cf6b8](https://github.com/user-attachments/assets/890dfe85-1720-43ad-9baa-8fc72d58441b)


---
## 🧠 4. Technologies Used

| Layer | Technology |
|--------|------------|
| **Frontend** | React, Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **Database** | Firebase (Firestore / Realtime Database) |
| **AI Platform** | Google Cloud (VM / GKE) |
| **AI Model** | Ollama (Llama 3) |

---

## 👥 5. Team Members  

- Seçkin Alp Kargı  
- Mert Çetin  
- Toprak Necat Gök  
- Ali Furkan Kaya  

# App Diagram
![WhatsApp Görsel 2025-10-26 saat 11 31 31_b3b71f04](https://github.com/user-attachments/assets/906467a0-4d8d-4dcd-a6fb-5ba9375f32b8)

# For technical readme files, please refer to frontend/readme, AI/readme, and backend/readme files.
