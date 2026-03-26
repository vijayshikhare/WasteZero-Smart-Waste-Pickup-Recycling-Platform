# WasteZero - Complete Setup & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally or connection string ready
- Git installed

### Environment Setup

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/wastezero

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email (for OTP & notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@wastezero.com

# API
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5174

# File Upload
UPLOAD_PATH=public/uploads
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=WasteZero
```

### Installation & Running

**Terminal 1 - Backend:**
```bash
cd wastezero/backend
npm install
npm start
# Should show: "Server running on port 5000"
```

**Terminal 2 - Frontend:**
```bash
cd wastezero/frontend
npm install
npm run dev
# Should show: "VITE ready in xxx ms, Local: http://localhost:5174/"
```

**Access the application:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api

---

## 🧪 Complete Testing Workflow

### Phase 1: Authentication (15 mins)

#### Test 1.1: Volunteer Registration
1. Navigate to http://localhost:5174/register
2. Select **Password Registration**
3. Fill in:
   - Name: `John Volunteer`
   - Email: `volunteer@example.com`
   - Password: `Password123`
   - Role: **Volunteer**
4. Click **Register**
5. ✅ **Expected**: Redirect to User Dashboard

#### Test 1.2: NGO Registration
1. Go back to /register
2. Select **Password Registration**
3. Fill in:
   - Name: `Green Earth NGO`
   - Email: `ngo@example.com`
   - Password: `Password123`
   - Role: **NGO**
4. Click **Register**
5. ✅ **Expected**: Redirect to NGO Dashboard

#### Test 1.3: OTP Registration
1. Go back to /register
2. Select **OTP Registration**
3. Fill in:
   - Name: `Jane Doe`
   - Email: `jane@example.com`
   - Role: **Volunteer**
4. Click **Send OTP**
5. ✅ **Expected**: OTP sent confirmation
6. Check backend logs for OTP (in development mode, printed to console)
7. Enter 6-digit OTP
8. ✅ **Expected**: Account created and redirect to User Dashboard

#### Test 1.4: Login with Password
1. Logout first (if logged in)
2. Go to /login
3. Enter: `volunteer@example.com` / `Password123`
4. Click **Log in**
5. ✅ **Expected**: Redirect to User Dashboard

#### Test 1.5: Login with OTP
1. Go to /login
2. Switch to **Email OTP** tab
3. Enter: `volunteer@example.com`
4. Click **Send OTP**
5. Enter received OTP
6. ✅ **Expected**: Logged in and redirect to dashboard

#### Test 1.6: Profile Dropdown
1. When logged in, click profile avatar in header
2. ✅ **Expected**: Dropdown shows:
   - User name and email
   - Role badge (🌱 Volunteer, 🏢 Organization, 👑 Admin)
   - "Dashboard" button (role-appropriate)
   - "Profile Settings" link
   - "Sign Out" button

---

### Phase 2: Dashboard Access Control (10 mins)

#### Test 2.1: Volunteer Dashboard
1. Login as volunteer
2. Should land on `/user-dashboard`
3. ✅ **Expected**: See:
   - "Volunteer Dashboard" title
   - Application statistics
   - Pickup information
   - Notifications panel
   - Quick action links

#### Test 2.2: NGO Dashboard
1. Logout and login as NGO
2. Should land on `/ngo-dashboard`
3. ✅ **Expected**: See:
   - "Organization Dashboard" title
   - Opportunities created
   - Active opportunities list
   - Applications received
   - Performance metrics

#### Test 2.3: Role-Based Navigation
1. In header dropdown, click "Dashboard"
2. Volunteer → `/user-dashboard`
3. NGO → `/ngo-dashboard`
4. ✅ **Expected**: Correct dashboard for each role

#### Test 2.4: Access Control
1. Volunteer: Try to access `/ngo-dashboard` in URL bar
2. ✅ **Expected**: Redirect to `/user-dashboard` or access denied

---

### Phase 3: Opportunity Management (20 mins)

#### Test 3.1: Browse Opportunities (Volunteer)
1. Login as volunteer
2. Navigate to `/opportunities` or click "Opportunities" in navbar
3. ✅ **Expected**: See list of opportunities with:
   - Opportunity title and description
   - Location
   - Required skills
   - NGO name
   - "Apply" button

#### Test 3.2: Create Opportunity (NGO)
1. Login as NGO
2. Click "Create Opportunity" on dashboard OR navigate to `/create-opportunity`
3. Fill in:
   - Title: `Tree Planting Drive`
   - Description: `Help us plant 100 trees in urban areas`
   - Location: `Nagpur, India`
   - Skills: `Physical fitness, teamwork`
   - Duration: `3 months`
   - Upload image (optional)
4. Click **Create**
5. ✅ **Expected**: 
   - Opportunity created successfully
   - Toast notification shown
   - Redirect to opportunity detail or dashboard
   - Opportunity appears in "My Opportunities"

#### Test 3.3: Edit Opportunity (NGO)
1. On NGO dashboard, find recently created opportunity
2. Click **Edit**
3. Change title to `Updated Tree Planting`
4. Click **Save**
5. ✅ **Expected**: 
   - Changes saved
   - Opportunity updated in list

#### Test 3.4: Delete Opportunity (NGO)
1. On NGO dashboard, find an opportunity
2. Click **Delete** (or more menu)
3. Confirm deletion
4. ✅ **Expected**: 
   - Opportunity removed from list
   - Confirmation toast shown

#### Test 3.5: View Opportunity Details
1. From volunteer dashboard, click on an opportunity
2. ✅ **Expected**: See full details:
   - Title, description, location
   - Required skills
   - NGO information
   - Application count
   - "Apply" button (if not already applied)

---

### Phase 4: Application Workflow (20 mins)

#### Test 4.1: Submit Application (Volunteer)
1. Login as volunteer
2. Browse opportunities
3. Click "Apply" on an opportunity
4. Optional: Add cover letter
5. Click **Submit Application**
6. ✅ **Expected**:
   - Success notification
   - Button changes to "Already Applied"
   - Application appears in "My Applications"

#### Test 4.2: View My Applications (Volunteer)
1. Login as volunteer
2. Navigate to `/my-applications`
3. ✅ **Expected**: See all applications with:
   - Opportunity title
   - Status (pending, accepted, rejected)
   - Apply date
   - Last update date
   - NGO feedback (if any)

#### Test 4.3: Accept Application (NGO)
1. Login as NGO
2. Go to dashboard
3. View "Recent Applications" section
4. Click on an application
5. Click **Accept**
6. (Optional) Add feedback/notes
7. Click **Confirm Accept**
8. ✅ **Expected**:
   - Application status changed to "Accepted"
   - Volunteer receives notification
   - Activity logged

#### Test 4.4: Reject Application (NGO)
1. Login as NGO
2. Find another application
3. Click **Reject**
4. Enter rejection reason
5. Click **Confirm**
6. ✅ **Expected**:
   - Status changes to "Rejected"
   - Volunteer notified with reason
   - Activity logged

#### Test 4.5: View NGO Applications
1. Login as NGO
2. Navigate to `/ngo-applications` or dashboard
3. ✅ **Expected**: 
   - Filter by status (pending, accepted, rejected)
   - Search applications
   - View applicant details
   - See their skills match

---

### Phase 5: Profile Management (10 mins)

#### Test 5.1: Edit Profile (Volunteer)
1. Login as volunteer
2. Navigate to `/profile` or click "Profile Settings" in dropdown
3. Edit:
   - Add bio/description
   - Update skills
   - Add phone number
   - Update location
4. Click **Save**
5. ✅ **Expected**: Changes saved and confirmed

#### Test 5.2: Upload Profile Picture
1. On profile page, click profile picture area
2. Select an image from device
3. ✅ **Expected**:
   - Upload progress shown
   - Picture updated immediately
   - Appears in header and dashboard

#### Test 5.3: Edit NGO Profile
1. Login as NGO
2. Navigate to `/profile`
3. Edit:
   - Organization description
   - Add service area
   - Update contact info
4. Click **Save**
5. ✅ **Expected**: Changes persisted

---

### Phase 6: Notifications (10 mins)

#### Test 6.1: Receive Notifications
1. Login as NGO
2. In another browser/tab, login as volunteer
3. Volunteer applies for your opportunity
4. ✅ **Expected**: NGO receives notification
5. Navigate to `/notifications` on NGO account
6. See application notification

#### Test 6.2: Mark as Read
1. On notifications page
2. Click on unread notification
3. ✅ **Expected**: Marked as read (visual indicator changes)

#### Test 6.3: Delete Notification
1. Click delete icon on notification
2. ✅ **Expected**: Notification removed

---

### Phase 7: Pickups (Optional - if implemented)

#### Test 7.1: Schedule Pickup (Volunteer)
1. Login as volunteer
2. Navigate to `/pickups` or dashboard Pickups section
3. Click **Schedule Pickup**
4. Select items and location
5. Click **Confirm**
6. ✅ **Expected**: Pickup scheduled

#### Test 7.2: Track Pickup Status
1. On pickups page
2. ✅ **Expected**: See status (scheduled, completed, cancelled)

---

### Phase 8: Mobile Responsiveness (10 mins)

#### Test 8.1: Header on Mobile
1. Open http://localhost:5174 on mobile device or use Chrome DevTools (375px width)
2. ✅ **Expected**:
   - Logo and company name visible
   - Hamburger menu visible
   - Auth buttons/profile visible

#### Test 8.2: Mobile Menu
1. Click hamburger menu
2. ✅ **Expected**:
   - Slide-in menu from right
   - All navigation items visible
   - User profile section
   - Logout button
   - Close on item click

#### Test 8.3: Dashboard Mobile
1. Open user dashboard on mobile
2. ✅ **Expected**:
   - Sidebar hidden/collapsed
   - Top navigation bar visible
   - Content properly stacked
   - All buttons accessible

#### Test 8.4: Forms on Mobile
1. Try to create opportunity on mobile
2. ✅ **Expected**:
   - Form fields properly sized
   - Keyboard doesn't hide form
   - Submit button accessible

---

## 🔍 Testing Checklist

### Authentication ✅
- [ ] Volunteer registration with password
- [ ] NGO registration with password
- [ ] OTP registration flow
- [ ] Login with password
- [ ] Login with OTP
- [ ] Logout functionality
- [ ] Session persistence (refresh page)
- [ ] Auto-redirect based on role

### Navigation ✅
- [ ] Header displays correctly
- [ ] Mobile menu works
- [ ] Profile dropdown shows role
- [ ] Role-based dashboard links work
- [ ] Navigation items functional

### Dashboards ✅
- [ ] Volunteer dashboard loads
- [ ] NGO dashboard loads
- [ ] Correct data displayed
- [ ] Statistics accurate
- [ ] Quick links functional

### Opportunities ✅
- [ ] List opportunities
- [ ] View opportunity details
- [ ] Create opportunity (NGO)
- [ ] Edit opportunity (NGO)
- [ ] Delete opportunity (NGO)
- [ ] Apply to opportunity (Volunteer)
- [ ] Prevent duplicate applications

### Applications ✅
- [ ] View my applications (Volunteer)
- [ ] View received applications (NGO)
- [ ] Accept application (NGO)
- [ ] Reject application (NGO)
- [ ] Add feedback
- [ ] Receive notifications

### Profile ✅
- [ ] View profile
- [ ] Edit profile
- [ ] Upload profile picture
- [ ] Changes persist

### Notifications ✅
- [ ] Receive notifications
- [ ] View notifications
- [ ] Mark as read
- [ ] Delete notifications
- [ ] Badge count updates

### Mobile ✅
- [ ] Header responsive
- [ ] Menu works
- [ ] Forms accessible
- [ ] Content readable
- [ ] Touch targets adequate

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
```bash
# Backend terminal
npm start
# Should start on port 5000
# Check http://localhost:5000/api/auth/check-auth
```

### Issue: "CORS error"
**Solution:** Backend CORS is already configured. If persists:
```javascript
// backend/server.js already has:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));
```

### Issue: "Application won't load"
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab → see if API calls fail
4. Clear browser cache: Ctrl+Shift+Delete

### Issue: "Database connection failed"
**Solution:**
```bash
# Check MongoDB running
mongod  # or use MongoDB Atlas connection string in .env

# Or verify connection string:
MONGODB_URI=mongodb://localhost:27017/wastezero
```

### Issue: "Email/Password incorrect"
**Solution:**
1. Verify user exists in database:
```javascript
// In Node REPL or MongoDB shell:
db.users.findOne({email: "test@example.com"})
```
2. Check password is hashed (should start with `$2a` or `$2b`)

### Issue: "OTP not received"
**Solution:**
1. Check backend logs for OTP code
2. In development, OTP is logged to console
3. Verify SMTP configuration in `.env`

### Issue: "Images not uploading"
**Solution:**
```bash
# Create uploads directory
mkdir -p backend/public/uploads/opportunities
mkdir -p backend/public/uploads/profiles
chmod 755 backend/public/uploads
```

---

## 📊 API Response Examples

### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Volunteer",
    "email": "volunteer@example.com",
    "role": "volunteer",
    "isSuspended": false
  }
}
```

### Create Opportunity
```json
{
  "success": true,
  "opportunity": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Tree Planting",
    "description": "Help us plant...",
    "location": "Nagpur",
    "createdBy": "507f1f77bcf86cd799439011",
    "applicationCount": 0,
    "status": "open"
  }
}
```

### Submit Application
```json
{
  "success": true,
  "application": {
    "id": "507f1f77bcf86cd799439013",
    "volunteerId": "507f1f77bcf86cd799439011",
    "opportunityId": "507f1f77bcf86cd799439012",
    "status": "pending",
    "createdAt": "2024-02-24T10:30:00Z"
  }
}
```

---

## 📚 Files Reference

### Backend Key Files
- `server.js` - Express setup, port 5000
- `models/User.js` - User schema with roles
- `models/Opportunity.js` - Opportunity schema
- `models/Application.js` - Application schema
- `controllers/applicationController.js` - Application logic
- `middleware/authMiddleware.js` - JWT verification
- `middleware/roleMiddleware.js` - Role-based access

### Frontend Key Files
- `App.jsx` - Route configuration
- `components/Header/Header.jsx` - Top navigation (ENHANCED)
- `components/Navbar/DashboardNav.jsx` - Dashboard sidebar (NEW)
- `pages/UserDashboard.jsx` - Volunteer dashboard
- `pages/NgoDashboard.jsx` - NGO dashboard
- `pages/Register.jsx` - Registration form
- `pages/Login.jsx` - Login form
- `pages/Opportunities.jsx` - Browse opportunities
- `pages/MyApplications.jsx` - View applications

---

## ✨ New Features Summary

### Enhanced Header Component
- **Role Badges**: Visual indicators for user role (Volunteer/Organization/Admin)
- **Dashboard Links**: Role-aware "Go to Dashboard" button
- **Improved Dropdown**: Better organized profile menu
- **Mobile Optimized**: Full-featured hamburger menu
- **Animations**: Smooth transitions and hover effects

### New Dashboard Sidebar Component
- **Responsive Design**: Collapses on mobile, full sidebar on desktop
- **Nested Navigation**: Support for submenu items
- **Visual Feedback**: Active state indicators
- **User Profile Card**: Quick access to profile and logout
- **Energy Efficient**: Uses CSS Grid for minimal overhead

---

## 🎯 Expected Results

### After Completing All Tests
- ✅ User registration working for all roles
- ✅ Authentication secure with JWT tokens
- ✅ Dashboard access role-based
- ✅ Opportunities can be created, edited, deleted
- ✅ Applications workflow complete
- ✅ Notifications functional
- ✅ Mobile responsive and user-friendly
- ✅ UI/UX professional and intuitive

---

**Test Time Estimate: 2-3 hours for full coverage**

**Status: READY FOR TESTING** ✅
