# Kenya-CiviTrack

Kenya-CiviTrack is a public accountability platform for infrastructure projects. It lets citizens explore project timelines, budgets, and progress, then submit comments or issue reports.

## What’s New
- Glass dashboard UI with responsive navigation, cards, and tabs
- Interactive map with clustered markers and filter panel
- Comments + reports MVP (public read, authenticated write)
- Explore Pulse page with 7‑day trends and lightweight charts
- Auth flow with `next` redirect support

## Local Setup

### Backend (Django + DRF)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```

## Notes
- API base URL is controlled in `frontend/.env` (`VITE_API_BASE`).
- Supabase is used only as the Postgres database (not as an API).
- Reports are publicly visible, but only authenticated users can submit.
