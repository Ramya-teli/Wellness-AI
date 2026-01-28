# 🧘 Wellness AI - AI-Powered Health & Wellness Platform

<div align="center">

![Wellness AI](https://images.unsplash.com/photo-1594561177665-052b6b4b781a?w=800&h=400&fit=crop)

**An intelligent wellness companion that helps you build sustainable fitness routines, manage stress effectively, and prioritize your overall wellbeing.**

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Opik](https://img.shields.io/badge/Opik-LLM%20Observability-purple)](https://www.comet.com/opik)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-orange?logo=google)](https://ai.google.dev/)

</div>

---

## 🎯 What Problem Does This Solve?

In today's fast-paced world, people struggle to:
- **Maintain consistent fitness routines** due to varying energy levels
- **Manage stress effectively** without personalized guidance
- **Track sleep quality** and understand what affects it
- **Stay motivated** on their wellness journey

**Wellness AI** solves these problems by providing:
- 🤖 **AI-powered personalized recommendations** that adapt to your current state
- 📊 **Comprehensive tracking** across fitness, sleep, and mental wellness
- 🎯 **Goal-aligned guidance** that promotes healthy behaviors responsibly
- 🔍 **Transparent AI evaluation** using Opik for quality and safety monitoring

---

## ✨ Key Features

### 1. 📊 Wellness Dashboard
- **Composite Wellness Score** calculated from workout, meditation, and sleep data
- **Streak tracking** for workouts and meditation sessions
- **Weekly progress visualization** with targets
- **Quick action cards** for logging activities

### 2. 💪 AI Workout Planner
- **Energy-based recommendations**: Tell the AI your energy level (1-10), get personalized workout suggestions
- **Smart calorie estimation** based on workout type, duration, and intensity
- **Workout logging** with type, duration, intensity, and notes
- **Progress history** with visual tracking

### 3. 😴 Sleep Coach
- **Sleep logging** with bedtime, wake time, quality rating, and interruptions
- **AI-powered sleep analysis** that identifies patterns and provides recommendations
- **Duration calculation** with deep sleep and REM estimates
- **Trend visualization** over time

### 4. 🧘 Meditation Center
- **AI-generated guided meditations** customized to your current mood
- **Multiple session types**: Guided, Breathing, Mindfulness, Body Scan
- **Mood tracking** (before/after) to measure effectiveness
- **Stress and focus quality monitoring**

### 5. 💬 AI Wellness Coach Chat
- **Context-aware conversations** - select Fitness, Sleep, Mindfulness, or General
- **Real-time response evaluation** using Opik LLM-as-Judge
- **Safety guardrails** to avoid medical overreach
- **Thumbs up/down feedback** for continuous improvement

### 6. 📈 Opik Observability Dashboard
- **LLM-as-Judge evaluations** for every AI response
- **Quality metrics**: Helpfulness, Relevance, Actionability, Empathy, Safety
- **Experiment tracking** by context type
- **Trend visualization** of AI performance over time

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│        React 19 + TailwindCSS + Framer Motion + Recharts        │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │ Workout  │ │  Sleep   │ │Meditation│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐                                      │
│  │AI Coach  │ │  Opik    │                                      │
│  │  Chat    │ │ Metrics  │                                      │
│  └──────────┘ └──────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                FastAPI + Motor (Async MongoDB)                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API ROUTES (/api)                     │    │
│  │  /dashboard  /workout/*  /sleep/*  /meditation/*        │    │
│  │  /chat       /opik/metrics  /opik/feedback              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │              AI SERVICE LAYER                          │      │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐ │      │
│  │  │ Google Gemini   │  │   Opik LLM-as-Judge         │ │      │
│  │  │   1.5 Flash     │  │   Evaluator                 │ │      │
│  │  └─────────────────┘  └─────────────────────────────┘ │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      MongoDB                              │   │
│  │  Collections: workout_logs, sleep_logs, meditation_logs, │   │
│  │               chat_history, opik_evaluations, feedback    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Opik Cloud                             │   │
│  │  Traces, Experiments, Evaluations, Metrics Dashboard      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI/LLM Implementation Details

### LLM Integration (Google Gemini 1.5 Flash)

The app uses **Google's Gemini 1.5 Flash** model for all AI features:

```python
import google.generativeai as genai

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

async def generate_gemini_response(prompt: str, system_instruction: str = None) -> str:
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=system_instruction
    )
    response = model.generate_content(prompt)
    return response.text
```

### Context-Aware System Prompts

Each wellness domain has specialized system prompts:

| Context | System Prompt Focus |
|---------|-------------------|
| **Workout** | Exercise recommendations, form tips, recovery advice |
| **Sleep** | Sleep hygiene, pattern analysis, relaxation techniques |
| **Meditation** | Guided sessions, breathing techniques, mindfulness |
| **General** | Holistic wellness, goal setting, lifestyle balance |

### Safety Guardrails

Every AI response is checked for:
- ❌ Medical diagnosis/prescription language
- ❌ Dangerous activity recommendations
- ❌ Extreme dieting suggestions
- ✅ Appropriate healthcare disclaimers

---

## 🔍 Opik Integration Deep Dive

### Why Opik?

Opik provides **LLM observability and evaluation** to ensure AI responses are:
- High quality and helpful
- Safe and responsible
- Relevant to user queries
- Continuously improving

### LLM-as-Judge Implementation

```python
class WellnessEvaluator:
    @track(name="evaluate_response_quality")
    async def evaluate_response_quality(self, query: str, response: str):
        eval_prompt = f"""Evaluate this wellness AI interaction:
        
        User Query: {query}
        AI Response: {response}
        
        Score (1-10) for: helpfulness, safety, relevance, 
        actionability, empathy"""
        
        # Returns structured evaluation scores
        return {
            "helpfulness": 8,
            "safety": 9,
            "relevance": 8,
            "actionability": 7,
            "empathy": 8,
            "overall": 8.0
        }
```

### Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **Helpfulness** | How useful is the advice for the user's goal? |
| **Safety** | Does it avoid medical overreach? Include disclaimers? |
| **Relevance** | How well does it address the specific query? |
| **Actionability** | Are the suggestions practical and achievable? |
| **Empathy** | Is the tone supportive and understanding? |

---

## 📁 Project Structure

```
wellness-ai/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # App-specific styles
│   │   ├── index.css          # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Navigation + layout wrapper
│   │   │   └── ui/            # Shadcn UI components
│   │   └── pages/
│   │       ├── Dashboard.jsx  # Main wellness dashboard
│   │       ├── Workout.jsx    # Workout planner + logging
│   │       ├── Sleep.jsx      # Sleep coach + analysis
│   │       ├── Meditation.jsx # Meditation center
│   │       ├── Chat.jsx       # AI coach chat interface
│   │       └── OpikMetrics.jsx# Opik observability dashboard
│   ├── package.json           # Node dependencies
│   └── .env                   # Frontend environment variables
│
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB 7.0+
- Google Gemini API Key (from [aistudio.google.com](https://aistudio.google.com/app/apikey))
- Opik API Key (from [comet.com/opik](https://www.comet.com/opik))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wellness-ai.git
cd wellness-ai
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure Environment Variables**
```bash
# backend/.env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="wellness_ai"
GEMINI_API_KEY="your-gemini-api-key"
OPIK_API_KEY="your-opik-api-key"
OPIK_WORKSPACE="your-workspace-name"
```

4. **Frontend Setup**
```bash
cd frontend
yarn install
```

5. **Run the Application**
```bash
# Terminal 1: Backend
cd backend
uvicorn server:app --reload --port 8001

# Terminal 2: Frontend
cd frontend
yarn start
```

6. **Access the App**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api

---

## 📊 API Reference

### Dashboard
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Get wellness score, streaks, recent activities |

### Workout
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workout/log` | POST | Log a workout session |
| `/api/workout/logs` | GET | Get workout history |
| `/api/workout/recommendations` | GET | Get AI recommendations based on energy level |

### Sleep
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sleep/log` | POST | Log sleep data |
| `/api/sleep/logs` | GET | Get sleep history |
| `/api/sleep/analysis` | GET | Get AI sleep analysis |

### Meditation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meditation/log` | POST | Log meditation session |
| `/api/meditation/logs` | GET | Get meditation history |
| `/api/meditation/guided` | GET | Generate AI guided meditation |

### AI Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to AI coach |
| `/api/chat/history` | GET | Get chat history |

### Opik Observability
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/opik/metrics` | GET | Get evaluation metrics |
| `/api/opik/feedback` | POST | Submit user feedback |
| `/api/opik/experiments` | GET | Get experiment tracking data |

---

## 🎨 Design Philosophy

- **Dark Calming Theme**: Organic earthy colors (#050a08 background, sage green accents)
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Micro-interactions**: Smooth animations on every interaction
- **Accessibility**: WCAG AA compliant contrast ratios
- **Mobile-first**: Responsive design with bottom navigation on mobile

---

## 🔒 Safety & Responsibility

This app is designed with wellness in mind:

- ⚠️ **Not Medical Advice**: All AI responses include appropriate disclaimers
- 🛡️ **Safety Guardrails**: Automatic detection of potentially harmful content
- 👨‍⚕️ **Professional Referrals**: Recommends consulting healthcare providers for medical concerns
- 📊 **Transparent AI**: Opik evaluation scores visible to users

---

## 🏆 Hackathon Criteria Alignment

| Criteria | Implementation |
|----------|---------------|
| **Functionality** | All features work end-to-end: logging, AI recommendations, chat |
| **Real-world Relevance** | Solves actual wellness tracking and motivation challenges |
| **LLM/Agent Usage** | Gemini 1.5 Flash for personalized, context-aware responses |
| **Opik Integration** | LLM-as-Judge, experiment tracking, safety monitoring |
| **Goal Alignment** | Supports physical fitness, mental wellness, and sleep goals |
| **Safety** | Guardrails, disclaimers, responsible health guidance |

---

## 📈 Future Roadmap

- [ ] User authentication and personalized profiles
- [ ] Integration with wearable devices (Fitbit, Apple Health)
- [ ] Push notifications for reminders
- [ ] Social features (challenges, community)
- [ ] Advanced analytics with ML predictions
- [ ] Voice-based AI coaching

---

## 📄 License

MIT License - feel free to use this project for your own wellness journey!

---

<div align="center">

**Built with ❤️ for a healthier world**

</div>
