# 🍱 Last Bite

> **Connecting surplus food to people who need it — reducing waste, building communities.**

Last Bite is a web application that fights food waste by linking hotels and restaurants' leftovers to students and workers who need affordable meals. Users browse listings, reserve online, and pick up food themselves — building community support and sustainability in cities.

---

## 🎯 Background & Problem

| | |
|---|---|
| **Problem** | Hotels and restaurants discard good leftover food daily, while low-income students and workers lack access to nutritious, affordable meals. |
| **Why it matters** | Reduces food waste, feeds communities, and saves costs for both businesses and consumers. |

---

## 🏆 Objectives

- Connect surplus food from businesses to users via a real-time platform
- Minimize food waste at the source
- Provide cheap, healthy meals to those who need them

---

## ⚙️ System Workflow

```
1. Business posts meal details and expiry time
         │
         ▼
2. User browses, reserves, pays, and uploads payment slip
         │
         ▼
3. Business confirms payment and prepares food
         │
         ▼
4. User picks up food and clicks "Confirm Received"
         │
         ▼
5. Business clicks "Finish" — booking complete
```

### Booking Status Flow

```
[PENDING] ──► [CONFIRMED] ──► [READY FOR PICKUP] ──► [COMPLETED]
    │               │                                      ▲
    └───────────────┴──────────── [CANCELLED] ─────────────┘
```

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React.js *(in development)*             |
| Backend   | Django 4.2 + Django REST Framework 3.15 |
| Auth      | JWT via `djangorestframework-simplejwt` |
| Database  | PostgreSQL                              |
| CORS      | `django-cors-headers`                   |
| Images    | Pillow                                  |
| Config    | `python-decouple`                       |

---

## 📁 Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
├── lastbite/                  # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── users/                 # Custom user model, 3 roles, JWT auth
    ├── meals/                 # Meal listings, allergy tags, nutrition info
    ├── bookings/              # Booking lifecycle (5 status steps)
    └── payments/              # Payment slip upload + verify / reject
```

---

## 🚀 Backend Setup

### 1. Create & activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Open .env and fill in your PostgreSQL credentials and SECRET_KEY
```

### 4. Start PostgreSQL and create the database
```bash
# macOS (Homebrew)
brew services start postgresql@14

# Create DB
psql postgres -c "CREATE DATABASE lastbite_db;"
```

### 5. Run migrations
```bash
python manage.py makemigrations users meals bookings payments
python manage.py migrate
```

### 6. Create a superuser (Admin)
```bash
python manage.py createsuperuser
```

### 7. Start the development server
```bash
python manage.py runserver
```

Server runs at: **http://127.0.0.1:8000**

---

## 🗒️ Notes

- All image uploads (meal photos, payment slips, profile pictures) are stored under `media/`
- JWT access token expires in **2 hours**, refresh token in **7 days**
