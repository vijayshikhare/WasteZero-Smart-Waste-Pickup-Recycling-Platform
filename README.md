
# WasteZero ♻️

**Cleaner India • Smarter Tomorrow**

WasteZero is a **community-driven waste management platform** that connects **NGOs**, **volunteers**, and **citizens** in Jalgaon (and scalable to other cities) for efficient waste collection, volunteer coordination, and opportunity management.

The platform enables NGOs to post pickup requests / volunteer opportunities, volunteers to apply and contribute, and admins to monitor overall activity.

Live Demo (if deployed): [https://wastezero.vercel.app](https://wastezero.vercel.app)  
Backend API: [https://wastezero-backend.onrender.com](https://wastezero-backend.onrender.com) (or your hosted URL)

## Features

### For Volunteers
- Browse and apply to volunteer opportunities posted by NGOs
- Track application status (Pending / Accepted / Rejected)
- View applied opportunities in "My Applications"
- Simple password + OTP login

### For NGOs
- Post new volunteer opportunities with title, description, image, skills, duration, location
- View all applications received for each opportunity
- Accept or reject applications with optional note
- Manage posted opportunities

### For Admins (future scope)
- Overview dashboard
- Manage users (volunteers, NGOs)
- Monitor platform activity & reports

### Core Platform Features
- Role-based access (Volunteer, NGO, Admin)
- Secure authentication (JWT + httpOnly cookies + OTP option)
- File uploads (opportunity images)
- Responsive Tailwind CSS UI
- Real-time toast notifications (react-hot-toast)
- Protected routes with role checks

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Tailwind CSS + lucide-react icons
- Axios (API client)
- Context API (auth state)
- react-hot-toast (notifications)

**Backend**
- Node.js + Express
- MongoDB (Mongoose ODM)
- JWT Authentication + httpOnly cookies
- Multer (file uploads)
- Bcrypt (password hashing)
- Nodemailer / custom OTP system

**Deployment Ready**
- Vite for fast dev & build
- Vercel / Netlify (frontend)
- Render / Railway / Cyclic (backend)

## Project Structure

```
wastezero/
├── backend/
│   ├── controllers/          → auth, opportunity, application
│   ├── middleware/           → auth, role checks
│   ├── models/               → User, Opportunity, Application
│   ├── routes/               → auth, opportunities, applications
│   ├── uploads/              → stored images
│   ├── server.js
│   └── ...
├── frontend/                 (or src/ in monorepo)
│   ├── src/
│   │   ├── components/       → Header, Sidebar, reusable UI
│   │   ├── contexts/         → AuthContext
│   │   ├── pages/            → Dashboard, Login, Opportunities, MyApplications, ...
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── public/
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm / yarn / pnpm

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wastezero
JWT_SECRET=your-very-long-secret-key
NODE_ENV=development
```

Install & run:

```bash
npm install
npm start
# or
npm run dev   # with nodemon
```

API will run at: http://localhost:5000

### Frontend Setup

```bash
cd frontend   # or root if monorepo
cp .env.example .env
```

Fill `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Install & run:

```bash
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### Default Test Users (after seeding or manual registration)

- Volunteer: `vijay@example.com` / password: `123456`
- NGO: `ngo.jalgaon@example.com` / password: `ngo123`
- Admin: (future)

## API Endpoints (Summary)

### Auth
- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login with password
- `POST /api/auth/send-otp` – Send OTP
- `POST /api/auth/verify-otp` – Verify OTP & login
- `GET /api/auth/profile` – Get current user
- `POST /api/auth/logout` – Logout

### Opportunities (NGO)
- `POST /api/opportunities` – Create opportunity (multipart)
- `GET /api/opportunities` – List all open opportunities
- `GET /api/opportunities/my-posted` – NGO's own posted (future)

### Applications
- `POST /api/applications/:opportunityId/apply` – Volunteer apply
- `GET /api/applications/my` – Volunteer's applications
- `GET /api/applications/opportunity/:opportunityId` – NGO view apps for one opp
- `PATCH /api/applications/:applicationId/status` – NGO accept/reject

## Deployment

### Frontend (Vercel / Netlify)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend.com`
4. Deploy

### Backend (Render / Railway)

1. Create new Web Service
2. Connect GitHub repo / backend folder
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add disk for `/uploads` if needed

## Future Enhancements (Roadmap)

- Real-time notifications (Socket.io / Pusher)
- Email alerts on application status change
- Admin dashboard + user management
- Waste pickup requests (separate from volunteer opps)
- Mobile responsive improvements
- Map integration for locations (Google Maps / Leaflet)

## Contributing

Feel free to open issues or PRs!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License

---

**Built with ❤️ in Jalgaon for a cleaner & greener India**  
**WasteZero – Cleaner India • Smarter Tomorrow** ♻️
```
