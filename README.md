# ShowUp2Move

### Just show up and move 🏃

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## The Problem

Organizing a spontaneous sports session is harder than it should be. Group chats go silent, people bail last minute, and finding enough players for a game feels like a full-time job. By the time everyone agrees on a time and place, the motivation is gone.

## The Solution

**ShowUp2Move** removes all the friction. Mark yourself available with one tap, get automatically matched with nearby players who share your sport and skill level, confirm with a single button, and let the captain create the event. You just show up and play.

---

## ✨ Core Features

- **Smart player matching** — Groups players by sport, skill level, and city for relevant, local matches
- **ShowUpToday system** — One-tap availability toggle that puts you in the matchmaking pool instantly
- **Automatic group formation** — Deterministic daily groups with auto-assigned captain; same group all day, reshuffled at midnight
- **Match confirmation workflow** — Players confirm with "I'm In!", captain unlocks "Create Event" once enough players are ready
- **Real-time group chat** — Powered by Supabase Realtime; messages appear instantly for all event members
- **Interactive event map** — Leaflet + OpenStreetMap with dark theme; event pins on the feed, location picker on event creation
- **AI sport detection** — Paste a bio description and Google Gemini 2.0 Flash suggests matching sports automatically
- **Venue suggestions** — Sport-specific venue recommendations for Timișoara shown on each event
- **Manual event creation** — Full form with sport selector, datetime picker, player limit, and map-click location picker
- **Profile system** — Avatar upload, sports preferences, skill level (Beginner / Intermediate / Advanced), city, and bio

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 3, Framer Motion, Leaflet, Supabase JS, shadcn/ui |
| **Backend** | Spring Boot 4, Java, JPA / Hibernate, Spring Security, JWT |
| **Database** | Supabase (PostgreSQL + Realtime subscriptions) |
| **Storage** | Supabase Storage (profile pictures, media) |
| **AI** | Google Gemini 2.0 Flash (sport detection from text) |
| **Auth** | Supabase Auth — Google OAuth + email/password |
| **Maps** | Leaflet + OpenStreetMap + Nominatim reverse geocoding |

---

## ⚙️ How It Works

1. **Create your profile** — Set your sports preferences, skill level, and city
2. **Tap ShowUpToday** — One toggle marks you as available and puts you in the matching pool
3. **Get matched** — The algorithm groups you with players in your city who play the same sports, forming stable groups that last all day
4. **Confirm attendance** — Hit "I'm In!" to confirm; the captain sees a live count and unlocks "Create Event" once the minimum is met
5. **Meet your team** — Real-time group chat, venue suggestions, and an interactive map help everyone coordinate
6. **Show up and play** — That's it

---

## 📁 Project Structure

```
summer-practice-hackathon-2026/
├── frontend/                        # React 19 + TypeScript client app
│   └── client/
│       ├── src/
│       │   ├── pages/               # Feed, Matching, EventDetail, Profile, Messages, ...
│       │   ├── components/          # Navbar, UI primitives (Button, Badge, Input)
│       │   └── lib/                 # API config, auth helpers, Supabase client
│       └── ...
└── backend/                         # Spring Boot 4 Java REST API
    └── src/main/java/com/andrei/springboot/
        ├── controller/              # REST endpoints
        ├── service/                 # Business logic
        ├── repository/              # JPA repositories
        ├── model/                   # JPA entities
        ├── dto/                     # Data transfer objects
        └── security/                # JWT filter, CustomUserDetails
```

---

## 👤 Team

| Name | Role | GitHub |
|---|---|---|
| Andrei Miroiu | Full Stack Developer | [github.com/andrew-miroiu](https://github.com/andrew-miroiu) |

---

*Built for the Haufe Summer Practice Hackathon 2026*
