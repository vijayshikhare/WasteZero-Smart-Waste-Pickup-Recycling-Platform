# WasteZero Role-Based System - Quick Start Guide

## Getting Started with the New Role-Based System

This guide will help you understand and use the newly implemented role-based system in WasteZero.

---

## 🚀 Quick Overview

The WasteZero platform now supports three distinct user roles, each with their own dashboard and capabilities:

### 1. **Volunteer (User)**
- Browse and apply for opportunities
- Track pickups and waste contributions
- Manage profile and skills
- Receive notifications

### 2. **NGO (Organization)**
- Create and manage opportunities
- Review and manage volunteer applications
- Track performance metrics
- Communicate with volunteers

### 3. **Admin (Super User)**
- Monitor all platform activities
- Manage users (suspend/activate)
- Review and resolve reports
- View analytics and insights

---

## 📁 Key Files to Know

### Backend

```
backend/
├── models/
│   ├── ActivityLog.js      ← Tracks all user actions
│   ├── Notification.js     ← User notifications
│   ├── Report.js           ← User-submitted reports
│   └── User.js             ← Updated with suspension fields
│
├── controllers/
│   ├── adminController.js   ← 9 admin functions
│   ├── userController.js    ← 6 user functions
│   ├── ngoController.js     ← 7 NGO functions
│   └── notificationController.js ← 6 notification functions
│
├── middleware/
│   └── roleMiddleware.js    ← Role-based access control
│
└── routes/
    ├── adminRoutes.js       ← Admin endpoints
    ├── userRoutes.js        ← User endpoints
    ├── ngoRoutes.js         ← NGO endpoints
    └── notificationRoutes.js← Notification endpoints
```

### Frontend

```
frontend/src/pages/
├── UserDashboard.jsx       ← Volunteer dashboard
├── NgoDashboard.jsx        ← NGO dashboard
├── AdminDashboard.jsx      ← Admin control panel
├── AdminUserManagement.jsx ← User management
├── AdminReports.jsx        ← Report management
└── AdminAnalytics.jsx      ← Analytics dashboard
```

---

## 🔐 Protecting Routes

### Backend Route Protection

```javascript
// In your route file
const roleMiddleware = require('../middleware/roleMiddleware');
const auth = require('../middleware/authMiddleware');

router.use(auth);                              // Check authentication
router.use(roleMiddleware.requireAdmin);       // Check if admin

// Now this route is protected
router.get('/dashboard/stats', adminController.getDashboardStats);
```

### Frontend Route Protection

```javascript
// In App.jsx
<Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 📊 API Endpoints Quick Reference

### Admin APIs (`/api/admin`)

```bash
GET    /dashboard/stats              # Platform statistics
GET    /users                         # List users
GET    /users/:userId                # User details
POST   /users/:userId/suspend        # Suspend user
POST   /users/:userId/activate       # Activate user
DELETE /opportunities/:opId          # Remove opportunity
GET    /reports                      # List reports
PUT    /reports/:reportId            # Update report
GET    /activity-logs                # Audit trail
GET    /analytics                    # Platform analytics
```

### User APIs (`/api/user`)

```bash
GET    /profile                      # Get profile
PUT    /profile                      # Update profile
GET    /dashboard/stats              # Dashboard metrics
GET    /notifications                # Get notifications
PUT    /notifications/:id/read       # Mark as read
GET    /statistics                   # Waste statistics
```

### NGO APIs (`/api/ngo`)

```bash
GET    /profile                      # Get NGO profile
PUT    /profile                      # Update profile
GET    /dashboard/stats              # Dashboard metrics
GET    /opportunities                # List opportunities
GET    /applications                 # List applications
POST   /applications/:id/accept      # Accept application
POST   /applications/:id/reject      # Reject application
GET    /statistics                   # Performance metrics
```

### Notification APIs (`/api/notifications`)

```bash
GET    /unread-count                 # Unread count
GET    /                             # Get notifications
PUT    /:id/read                     # Mark as read
PUT    /mark-all-read                # Mark all as read
DELETE /:id                          # Delete notification
DELETE /                             # Delete all notifications
```

---

## 💻 Example: Adding a New Feature for Admins

### Step 1: Create Controller Function

```javascript
// In backend/controllers/adminController.js

exports.getActivitySummary = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.status(200).json({ activities });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
```

### Step 2: Create Route

```javascript
// In backend/routes/adminRoutes.js

router.get('/activity-summary', adminController.getActivitySummary);
```

### Step 3: Create Frontend Component

```jsx
// In frontend/src/pages/AdminActivitySummary.jsx

import { useAuth } from '../contexts/AuthContext';

export default function AdminActivitySummary() {
  const { api } = useAuth();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get('/api/admin/activity-summary')
      .then(res => setActivities(res.data.activities))
      .catch(err => console.error(err));
  }, []);

  return (
    // Your JSX here
  );
}
```

### Step 4: Add Route in App.jsx

```jsx
<Route
  path="/admin/activity-summary"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminActivitySummary />
    </ProtectedRoute>
  }
/>
```

---

## 🔔 Creating Notifications

When important events happen, create notifications:

```javascript
const Notification = require('../models/Notification');

// Example: When application is accepted
await Notification.create({
  userId: applicantId,
  title: 'Application Accepted!',
  message: `Your application for "${opportunity.title}" was accepted`,
  type: 'application_update',
  relatedId: applicationId,
  relatedType: 'application',
  actionUrl: `/applications/${applicationId}`,
});
```

---

## 📝 Logging Activities

Track important user actions:

```javascript
const ActivityLog = require('../models/ActivityLog');

// Example: When user updates profile
await ActivityLog.create({
  userId: req.user._id,
  userName: user.name,
  userRole: user.role,
  action: 'profile_update',
  description: 'Updated profile information',
  targetId: userId,
  targetType: 'user',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

## 👤 User Roles & Permissions

### Volunteer Permissions
- ✅ Read opportunities
- ✅ Create applications
- ✅ Edit own profile
- ✅ View own applications
- ✅ Schedule pickups
- ❌ Cannot create opportunities
- ❌ Cannot suspend users
- ❌ Cannot view reports

### NGO Permissions
- ✅ Read opportunities
- ✅ Create opportunities
- ✅ Edit own opportunities
- ✅ Review applications
- ✅ Accept/reject applications
- ✅ Edit own profile
- ❌ Cannot suspend users
- ❌ Cannot view all users
- ❌ Cannot view reports

### Admin Permissions
- ✅ Read everything
- ✅ Create/edit/delete opportunities
- ✅ Manage users (suspend/activate)
- ✅ Review reports
- ✅ View activity logs
- ✅ Access analytics
- ✅ All volunteer permissions
- ✅ All NGO permissions

---

## 🧪 Testing the System

### Test Account Credentials

**Volunteer Account:**
```
Email: volunteer@wastezero.com
Password: password123
Role: volunteer
Dashboard: /user-dashboard
```

**NGO Account:**
```
Email: ngo@wastezero.com
Password: password123
Role: ngo
Dashboard: /ngo-dashboard
```

**Admin Account:**
```
Email: admin@wastezero.com
Password: password123
Role: admin
Dashboard: /admin-dashboard
```

### Manual Testing Checklist

- [ ] Register as volunteer, verify redirects to `/user-dashboard`
- [ ] Register as NGO, verify redirects to `/ngo-dashboard`
- [ ] Login as admin, verify redirects to `/admin-dashboard`
- [ ] As admin, suspend a user and verify they cannot login
- [ ] As admin, activate the user again
- [ ] As NGO, create an opportunity
- [ ] As volunteer, apply to the opportunity
- [ ] As NGO, accept/reject the application
- [ ] Verify notifications are created and sent
- [ ] Check activity logs for all actions

---

## 🐛 Troubleshooting

### Issue: User can access admin routes
**Solution:** Check that `ProtectedRoute` has `allowedRoles={['admin']}`

### Issue: Notifications not showing
**Solution:** Verify `Notification.create()` is called and fetch is working with `/api/notifications`

### Issue: Activity logs not recording
**Solution:** Ensure `ActivityLog.create()` is called with all required fields

### Issue: Role middleware not working
**Solution:** Make sure `roleMiddleware` is applied AFTER `auth` middleware

```javascript
router.use(auth);                    // First
router.use(roleMiddleware.requireAdmin);  // Then
```

---

## 📚 Additional Resources

- [Full Documentation](./ROLE_BASED_SYSTEM.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- Backend Controllers: `backend/controllers/`
- Frontend Pages: `frontend/src/pages/`
- API Routes: `backend/routes/`

---

## ❓ FAQ

**Q: Can a user have multiple roles?**
A: Currently, each user has one role. This can be extended for multi-role support.

**Q: How do I add a new role?**
A: Update the User model's role enum, create controllers, middleware, routes, and pages.

**Q: Are suspended users blocked from all features?**
A: Yes, `requireActiveUser()` middleware blocks suspended users from protected routes.

**Q: How long are activity logs kept?**
A: Indefinitely. For production, implement log rotation/archival.

**Q: Can notifications be sent via email?**
A: Not yet. Implement with Nodemailer for email notifications.

---

## 🎯 Next Steps

1. Review the [detailed documentation](./ROLE_BASED_SYSTEM.md)
2. Test all three user roles
3. Verify backend APIs are working
4. Test frontend pages and navigation
5. Check activity logs are being recorded
6. Verify notifications are working
7. Test admin suspension functionality
8. Configure production settings

---

## 📞 Support

For issues or questions about the role-based system:
1. Check the troubleshooting section above
2. Review inline code comments
3. Check MongoDB logs for database errors
4. Check browser console for frontend errors
5. Check server logs for backend errors

---

**Happy coding! 🚀**

*Last Updated: February 24, 2026*
