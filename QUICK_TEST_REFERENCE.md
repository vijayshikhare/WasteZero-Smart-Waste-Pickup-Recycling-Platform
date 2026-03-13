# WasteZero - Quick Testing Reference

## 🚀 START HERE

### Access the Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000/api

---

## 📋 Quick URL Reference

### Authentication Pages
| Page | URL | What to Test |
|------|-----|--------------|
| Register | `/register` | Create new account (password or OTP) |
| Login | `/login` | Signin with password or OTP |
| Home | `/` | Landing page |

### Volunteer/User Pages
| Page | URL | What to Test |
|------|-----|--------------|
| User Dashboard | `/user-dashboard` | View applications, pickups, notifications |
| My Applications | `/my-applications` | View status of submitted applications |
| Opportunities | `/opportunities` | Browse and apply for opportunities |
| View Opportunity | `/opportunities/:id` | See full details and apply |
| Pickups | `/pickups` | Schedule and track pickups |
| Profile | `/profile` | Manage profile and upload picture |

### NGO Pages
| Page | URL | What to Test |
|------|-----|--------------|
| NGO Dashboard | `/ngo-dashboard` | View created opportunities and applications |
| Create Opportunity | `/create-opportunity` | Create new volunteer opportunity |
| Edit Opportunity | `/edit-opportunity/:id` | Edit created opportunity |
| My Opportunities | `/my-posted` | View all posted opportunities |
| Applications | `/ngo-applications` | Review applications received |
| Profile | `/profile` | Manage NGO profile |

### Admin Pages
| Page | URL | What to Test |
|------|-----|--------------|
| Admin Dashboard | `/admin-dashboard` | View platform statistics and metrics |
| User Management | `/admin/users` | Manage users, suspend/activate |
| Reports | `/admin/reports` | Review and handle user reports |
| Analytics | `/admin/analytics` | View platform trends and statistics |

---

## 🧪 Test Scenarios

### Scenario 1: Complete Volunteer Journey (15 mins)
```
1. Register as Volunteer
   → http://localhost:5174/register
   → Select "Password" mode
   → Fill: Name, Email, Password
   → Select Role: "Volunteer"
   → Click "Register"
   ✅ Should redirect to /user-dashboard

2. Explore Dashboard
   → http://localhost:5174/user-dashboard
   ✅ See: Applications count, Pickups, Notifications

3. Browse Opportunities
   → http://localhost:5174/opportunities
   ✅ See: List of opportunities from NGOs

4. Apply for Opportunity
   → Click on any opportunity
   → http://localhost:5174/opportunities/[id]
   → Click "Apply"
   ✅ See: Success message, button changes to "Already Applied"

5. View My Applications
   → http://localhost:5174/my-applications
   ✅ See: Your submitted applications with status

6. Profile
   → http://localhost:5174/profile
   ✅ Edit info, upload profile picture
```

### Scenario 2: Complete NGO Journey (15 mins)
```
1. Register as NGO
   → http://localhost:5174/register
   → Select "Password" mode
   → Fill: Name, Email, Password
   → Select Role: "NGO"
   → Click "Register"
   ✅ Should redirect to /ngo-dashboard

2. Explore Dashboard
   → http://localhost:5174/ngo-dashboard
   ✅ See: Opportunities created count, Applications received

3. Create Opportunity
   → Click "Create Opportunity" button on dashboard
   → OR http://localhost:5174/create-opportunity
   → Fill: Title, Description, Location, Skills
   → Upload image (optional)
   → Click "Create"
   ✅ See: Success message, opportunity appears in dashboard

4. Edit Opportunity
   → http://localhost:5174/my-posted
   → Find your opportunity
   → Click "Edit"
   → Change title or description
   → Click "Save"
   ✅ Changes saved successfully

5. View Applications
   → http://localhost:5174/ngo-applications
   → Click on an application
   → Click "Accept" or "Reject"
   ✅ Application status changes

6. Profile
   → http://localhost:5174/profile
   ✅ Edit NGO information
```

### Scenario 3: Role-Based Access Control (5 mins)
```
1. Login as Volunteer
   → Visit /ngo-dashboard
   ✅ Should redirect to /user-dashboard (access denied)

2. Login as NGO
   → Visit /user-dashboard
   ✅ Should show NGO version or redirect

3. Check Header
   → Volunteer: Header shows "🌱 Volunteer"
   → NGO: Header shows "🏢 Organization"
   → Admin: Header shows "👑 Admin"
```

---

## 🔍 Testing Checklist

### Quick Check (5 mins)
- [ ] Can you register?
- [ ] Can you login?
- [ ] Does dashboard show?
- [ ] Does profile photo work?
- [ ] Can you logout?

### Basic Features (20 mins)
- [ ] Register as both Volunteer and NGO
- [ ] Login with both accounts
- [ ] NGO can create opportunity
- [ ] Volunteer can apply to opportunity
- [ ] Status changes show up

### Advanced Features (30 mins)
- [ ] Accept/reject applications as NGO
- [ ] Notifications work
- [ ] Profile editing works
- [ ] Profile pictures upload
- [ ] Mobile menu works on small screens

### Mobile Testing (10 mins)
- [ ] Header hamburger menu works
- [ ] Forms are usable on mobile
- [ ] Buttons are easy to tap
- [ ] No horizontal scrolling
- [ ] Text is readable

---

## 📱 Mobile Testing URLs

Test these URLs on mobile (or with DevTools set to 375px width):

```
http://localhost:5174/register     ← Full form on mobile
http://localhost:5174/login        ← Both password and OTP tabs
http://localhost:5174/user-dashboard ← Responsive layout
http://localhost:5174/opportunities ← List scrolls vertically
http://localhost:5174/profile      ← Form adjusts for touch
```

---

## ✅ What You Should See

### Home Page (/)
- WasteZero logo with animation
- Navigation menu
- Login/Register buttons (if not logged in)
- OR Profile menu (if logged in)

### Register Page (/register)
- Two tabs: "Password" and "OTP"
- Form with Name, Email, Password fields
- Role selection: Volunteer, NGO
- Password strength indicator (OTP mode)
- "Register" button

### Login Page (/login)
- Two tabs: "Password" and "OTP"
- Email field
- Password field (password mode) or OTP fields (OTP mode)
- "Forgot Password?" link
- Login button

### User Dashboard (/user-dashboard)
```
┌──────────────────────────────────┐
│  VOLUNTEER DASHBOARD             │
├──────────────────────────────────┤
│  📊 Statistics                   │
│  ├─ Applications: X              │
│  ├─ Accepted: X                  │
│  └─ Pending: X                   │
├──────────────────────────────────┤
│  🔔 Notifications                │
│  ├─ Notification 1               │
│  └─ Notification 2               │
├──────────────────────────────────┤
│  📦 Recent Pickups               │
│  └─ [List of pickups]            │
├──────────────────────────────────┤
│  🔗 Quick Links                  │
│  ├─ Browse Opportunities         │
│  ├─ My Applications              │
│  └─ Schedule Pickup              │
└──────────────────────────────────┘
```

### NGO Dashboard (/ngo-dashboard)
```
┌──────────────────────────────────┐
│  ORGANIZATION DASHBOARD          │
├──────────────────────────────────┤
│  📊 Statistics                   │
│  ├─ Opportunities: X             │
│  ├─ Active: X                    │
│  └─ Applications: X              │
├──────────────────────────────────┤
│  🔗 Quick Actions                │
│  ├─ [Create Opportunity]         │
│  └─ [View Applications]          │
├──────────────────────────────────┤
│  📋 Recent Opportunities         │
│  ├─ [Opportunity 1]              │
│  └─ [Opportunity 2]              │
├──────────────────────────────────┤
│  👥 Recent Applications          │
│  ├─ [Application 1]              │
│  └─ [Application 2]              │
└──────────────────────────────────┘
```

### Profile Dropdown (All Users)
```
┌──────────────────────────────────┐
│  [Avatar] User Name              │
│  user@email.com                  │
│  [🌱 Volunteer Tag]              │
├──────────────────────────────────┤
│  📊 Dashboard                    │
│  → Go to your workspace          │
├──────────────────────────────────┤
│  ⚙️  Profile Settings             │
├──────────────────────────────────┤
│  🚪 Sign Out                      │
└──────────────────────────────────┘
```

### Opportunities List (/opportunities)
```
┌──────────────────────────────────┐
│  📋 OPPORTUNITIES                │
├──────────────────────────────────┤
│  [Opportunity Card 1]            │
│  ├─ Title: Tree Planting        │
│  ├─ Location: Nagpur            │
│  ├─ Skills: Physical fitness     │
│  ├─ Applications: 5              │
│  └─ [Apply Button]               │
├──────────────────────────────────┤
│  [Opportunity Card 2]            │
│  └─ ...                          │
└──────────────────────────────────┘
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: Page shows blank after login
**Fix**: Refresh page (Ctrl+R)

### Issue: Image not uploading
**Fix**: Check file size < 5MB, format = jpg/png

### Issue: OTP not received
**Fix**: Check browser console for OTP code (development mode shows it there)

### Issue: "Cannot connect to backend"
**Fix**: Make sure backend is running: `npm start` in backend folder

### Issue: Mobile menu not working
**Fix**: Clear browser cache (Ctrl+Shift+Delete)

### Issue: Profile picture not showing
**Fix**: Upload a new picture on profile page

---

## 🎯 Test Success Criteria

### ✅ Core Features Working
```
[✓] User can register
[✓] User can login
[✓] User can logout
[✓] Dashboard shows for correct role
[✓] Profile page works
[✓] NGO can create opportunity
[✓] Volunteer can apply to opportunity
[✓] Applications show status
[✓] Mobile menu works
[✓] Header shows role badge
```

### ✅ Advanced Features Working
```
[✓] OTP registration/login works
[✓] Profile picture upload works
[✓] Application accept/reject works
[✓] Notifications appear
[✓] Opportunity edit works
[✓] Opportunity delete works
[✓] Search and filter work
[✓] Pagination works (if implemented)
[✓] Mobile layout responsive
[✓] Animations smooth
```

---

## 📊 API Testing (Optional)

You can test API endpoints directly with curl or Postman:

### Register Volunteer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "volunteer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Create Opportunity (as NGO, with token)
```bash
curl -X POST http://localhost:5000/api/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Tree Planting",
    "description": "Help plant trees",
    "location": "Nagpur",
    "skillsRequired": ["physical fitness"],
    "duration": "3 months"
  }'
```

---

## 🎓 Learning Resources

### Frontend Architecture
```
App.jsx
├── Route: /register → Register.jsx
├── Route: /login → Login.jsx
├── Route: /user-dashboard → <ProtectedRoute> → UserDashboard.jsx
├── Route: /ngo-dashboard → <ProtectedRoute> → NgoDashboard.jsx
└── Route: /profile → <ProtectedRoute> → Profile.jsx
```

### Authentication Flow
```
User Input → AuthContext.login()
  ↓
API Call → /api/auth/login
  ↓
JWT Token → Stored in cookie + localStorage
  ↓
Header added to all requests
  ↓
Protected routes verify token
  ↓
Role-based access control
```

### Application Flow
```
Volunteer browsing
  → Opportunity list
    → Apply
      → Application created (pending)
        → NGO reviews
          → Accept/Reject
            → Status updated
              → Notifications sent
```

---

## 📞 Getting Help

### Logs to Check
1. **Backend Logs**: Terminal where you ran `npm start`
2. **Frontend Logs**: Browser DevTools (F12) → Console tab
3. **Network Requests**: Browser DevTools → Network tab

### Common Commands
```bash
# Check if backend is running
curl http://localhost:5000/api/auth/check-auth

# Check if frontend is running
curl http://localhost:5174

# View backend logs (if using logging)
tail -f wastezero/backend/logs.txt

# Restart servers
# Terminal 1: Ctrl+C, then npm start
# Terminal 2: Ctrl+C, then npm run dev
```

---

## ⏱️ Expected Test Duration

| Phase | Time |
|-------|------|
| Setup | 5 mins |
| Authentication | 15 mins |
| Dashboard Access | 10 mins |
| Opportunities | 20 mins |
| Applications | 20 mins |
| Profile Management | 10 mins |
| Mobile Testing | 10 mins |
| **Total** | **~90 mins** |

---

## 🎉 Next Steps After Testing

1. **If Everything Works**
   - ✅ Mark DEPLOYMENT_READY.md
   - ✅ Create test accounts for production
   - ✅ Setup environment variables
   - ✅ Deploy to production server

2. **If Issues Found**
   - 📝 Document the issue
   - 📋 Include steps to reproduce
   - 🔍 Check browser console for errors
   - 📞 Review backend logs
   - 🔧 Fix and test again

---

**Happy Testing! 🚀**

Start at: **http://localhost:5174**

---

*Last Updated: February 24, 2025*
