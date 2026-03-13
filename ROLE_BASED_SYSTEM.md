# WasteZero Role-Based System Implementation

## Overview

This document describes the comprehensive role-based system implemented for WasteZero, with three distinct user roles: **Volunteer**, **NGO**, and **Admin**.

---

## User Roles & Responsibilities

### 1. **Volunteer / Normal User**

**Description:** Individual users who want to participate in waste management, volunteering, or recycling activities.

**Capabilities:**

- ✅ Register and login with email/password or OTP
- ✅ Create and manage user profile
- ✅ Select waste types and skills
- ✅ Schedule waste pickups
- ✅ Browse and apply for opportunities
- ✅ Chat with NGOs and pickup agents
- ✅ Receive notifications about opportunities and applications
- ✅ Track waste statistics and contribution

**Dashboard Features:**

- View dashboard statistics (applications, pickups, waste collected)
- Manage applications submitted to opportunities
- Schedule and track pickups
- View notifications and alerts
- Edit profile information and preferences

**Protected Routes:**
- `/user-dashboard`
- `/profile`
- `/my-applications`
- `/pickups`

---

### 2. **NGO / Opportunity Creator**

**Description:** Organizations or pickup agents managing recycling activities and coordinating volunteers.

**Capabilities:**

- ✅ Create, edit, and manage opportunities
- ✅ Specify location, duration, and required skills
- ✅ Chat with volunteer users
- ✅ Accept or reject volunteer applications
- ✅ Provide feedback to applicants
- ✅ Track application metrics

**Dashboard Features:**

- View NGO-specific statistics (active opportunities, pending applications)
- Browse recent opportunities they've created
- Review and manage volunteer applications
- Accept/reject applications with feedback
- Edit opportunity details
- View performance metrics

**Protected Routes:**
- `/ngo-dashboard`
- `/ngo/opportunities`
- `/ngo/applications`
- `/create-opportunity`
- `/edit-opportunity/:id`

---

### 3. **Admin / Super Controller**

**Description:** Platform managers with complete system control and monitoring capabilities.

**Capabilities:**

- ✅ Monitor all user activities
- ✅ View comprehensive reports and analytics
- ✅ Suspend or activate user accounts
- ✅ Remove inappropriate content (opportunities, posts)
- ✅ Manage platform health and security
- ✅ Review and resolve user reports
- ✅ View activity logs and user behavior

**Dashboard Features:**

- System overview with key metrics
- Total users, opportunities, and applications
- Pending reports requiring review
- Quick access to management tools
- Platform health status

**Management Panels:**

1. **User Management** (`/admin/users`)
   - View all users with filters
   - Search by name/email
   - Filter by role (Volunteer, NGO, Admin)
   - Filter by status (Active, Suspended)
   - Suspend users with reason
   - Activate suspended users
   - View user activity history

2. **Reports Management** (`/admin/reports`)
   - View user-submitted reports
   - Filter by status (Pending, Reviewing, Resolved, Dismissed)
   - Review report details and evidence
   - Add admin notes
   - Specify action taken (Warning, Suspension, Deletion, etc.)
   - Mark reports as resolved or dismissed

3. **Activity Logs** (`/admin/activity`)
   - Track all system activities
   - Filter by action type
   - View user behavior patterns
   - Monitor platform usage

4. **Analytics** (`/admin/analytics`)
   - User growth trends
   - Opportunity statistics
   - Application metrics
   - Report statistics
   - Date range filtering

**Protected Routes:**
- `/admin-dashboard`
- `/admin/users`
- `/admin/reports`
- `/admin/activity`
- `/admin/analytics`

---

## Database Models

### New Models Created

#### 1. **ActivityLog**
Tracks all user actions on the platform for audit purposes.

```javascript
{
  userId: ObjectId,
  userName: String,
  userRole: String,
  action: String,
  description: String,
  targetId: ObjectId,
  targetType: String,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

#### 2. **Notification**
Manages user notifications across the application.

```javascript
{
  userId: ObjectId,
  title: String,
  message: String,
  type: String,
  relatedId: ObjectId,
  relatedType: String,
  isRead: Boolean,
  actionUrl: String,
  createdAt: Date
}
```

#### 3. **Report**
Stores user-submitted reports about inappropriate content or behavior.

```javascript
{
  reporterId: ObjectId,
  reportType: String,
  targetId: ObjectId,
  targetUserId: ObjectId,
  reason: String,
  description: String,
  status: String,
  adminNotes: String,
  actionTaken: String,
  resolvedBy: ObjectId,
  evidence: [String],
  createdAt: Date
}
```

---

## Backend API Endpoints

### Admin Endpoints (`/api/admin`)

```
GET    /dashboard/stats              - Get dashboard statistics
GET    /users                         - List all users with filters
GET    /users/:userId                 - Get user details with activity
POST   /users/:userId/suspend         - Suspend a user
POST   /users/:userId/activate        - Activate a suspended user
DELETE /opportunities/:opportunityId  - Remove inappropriate opportunity
GET    /reports                       - List reports with filters
PUT    /reports/:reportId            - Update report status
GET    /activity-logs                 - Get activity logs
GET    /analytics                     - Get platform analytics
```

### User Endpoints (`/api/user`)

```
GET    /profile                       - Get user profile
PUT    /profile                       - Update user profile
GET    /dashboard/stats               - Get user dashboard stats
GET    /notifications                 - Get user notifications
PUT    /notifications/:id/read        - Mark notification as read
PUT    /notifications/mark-all-read   - Mark all notifications as read
DELETE /notifications/:id             - Delete notification
GET    /statistics                    - Get user statistics
```

### NGO Endpoints (`/api/ngo`)

```
GET    /profile                       - Get NGO profile
PUT    /profile                       - Update NGO profile
GET    /dashboard/stats               - Get NGO dashboard stats
GET    /opportunities                 - List NGO's opportunities
GET    /applications                  - List applications to NGO's opportunities
POST   /applications/:id/accept       - Accept an application
POST   /applications/:id/reject       - Reject an application
GET    /statistics                    - Get NGO statistics
```

### Notification Endpoints (`/api/notifications`)

```
GET    /unread-count                  - Get unread notification count
GET    /                              - Get all notifications
PUT    /:id/read                      - Mark as read
PUT    /mark-all-read                 - Mark all as read
DELETE /:id                           - Delete notification
DELETE /                              - Delete all notifications
```

---

## Frontend Components & Pages

### New Pages Created

1. **UserDashboard.jsx** - Volunteer dashboard with stats and notifications
2. **NgoDashboard.jsx** - NGO management dashboard
3. **AdminDashboard.jsx** - Admin control panel with metrics
4. **AdminUserManagement.jsx** - User management and suspension
5. **AdminReports.jsx** - Report review and action management

### Component Hierarchy

```
App
├── Public Routes
│   ├── Home
│   ├── Login
│   └── Register
│
├── User Routes (allowedRoles: ['volunteer'])
│   ├── UserDashboard
│   ├── Profile
│   └── MyApplications
│
├── NGO Routes (allowedRoles: ['ngo'])
│   ├── NgoDashboard
│   ├── CreateOpportunity
│   ├── EditOpportunity
│   └── ViewApplications
│
└── Admin Routes (allowedRoles: ['admin'])
    ├── AdminDashboard
    ├── AdminUserManagement
    ├── AdminReports
    ├── ActivityLogs
    └── Analytics
```

---

## Middleware

### Role-Based Access Control (`roleMiddleware.js`)

```javascript
// Available middleware functions:
- requireAdmin()           // Check if user is admin
- requireNGO()            // Check if user is NGO (or admin)
- requireVolunteer()      // Check if user is volunteer (or admin)
- requireRoles(['...'])   // Check multiple roles
- requireActiveUser()     // Check if user is not suspended
```

---

## Security Features

1. **Role-Based Access Control (RBAC)**
   - Protected routes enforce role requirements
   - Backend endpoints check user role before processing

2. **User Suspension**
   - Admin can suspend users with reason
   - Suspended users cannot access protected routes
   - Suspension reason stored for transparency

3. **Activity Logging**
   - All important actions logged
   - Admin can review user behavior
   - Audit trail for compliance

4. **Report System**
   - Users can report inappropriate content
   - Admin reviews and takes action
   - Multiple report statuses for workflow

5. **Notification System**
   - Real-time notifications for important events
   - Read/unread status tracking
   - Notification action links

---

## User Flow Examples

### Volunteer Registration & Usage

1. Register → `POST /api/auth/register`
2. Redirected to `/user-dashboard`
3. Browse opportunities → `GET /opportunities`
4. Apply to opportunity → `POST /api/applications`
5. Receive notification when accepted
6. Access dashboard stats → `GET /api/user/dashboard/stats`

### NGO Opportunity Creation

1. Register as NGO → `POST /api/auth/register` (role: 'ngo')
2. Redirected to `/ngo-dashboard`
3. Create opportunity → `POST /api/opportunities`
4. Edit opportunity → `PUT /api/opportunities/:id`
5. Review applications → `GET /api/ngo/applications`
6. Accept/Reject → `POST /api/ngo/applications/:id/accept`

### Admin User Management

1. Login as admin → Dashboard redirects to `/admin-dashboard`
2. View all users → `GET /api/admin/users`
3. Search/filter users
4. Click user to see details
5. Suspend user if needed → `POST /api/admin/users/:id/suspend`
6. View activity logs → `GET /api/admin/activity-logs`

---

## Frontend Route Structure

```
/
├── / (Home)
├── /login
├── /register
│
├── /user-dashboard (volunteer only)
├── /ngo-dashboard (ngo only)
├── /admin-dashboard (admin only)
│
├── /admin/users (admin only)
├── /admin/reports (admin only)
├── /admin/activity (admin only)
├── /admin/analytics (admin only)
│
├── /profile (all authenticated)
├── /my-applications (all authenticated)
└── /pickups (all authenticated)
```

---

## Configuration & Environment

No additional environment variables needed. The system uses existing MongoDB connection and authentication setup.

---

## Future Enhancements

1. **Real-time Notifications**
   - WebSocket integration for live notifications
   - Notification badges in header

2. **Advanced Analytics**
   - Charts and graphs for admin dashboard
   - Export reports functionality

3. **Email Notifications**
   - Send emails for important events
   - Notification preferences per user

4. **Two-Factor Authentication**
   - SMS or Email OTP for sensitive operations
   - Enhanced security for admin accounts

5. **User Roles Hierarchy**
   - Super Admin vs Regular Admin
   - Moderator role for content review

6. **Bulk Actions**
   - Bulk suspend/activate users
   - Bulk delete inappropriate content

---

## Testing Credentials

After implementation, test with:

**Volunteer Account:**
```
Email: volunteer@example.com
Password: password123
Role: volunteer
```

**NGO Account:**
```
Email: ngo@example.com
Password: password123
Role: ngo
```

**Admin Account:**
```
Email: admin@example.com
Password: password123
Role: admin
```

---

## Support & Documentation

For questions or issues related to this implementation, refer to:
- Backend Controllers: `/backend/controllers/`
- Frontend Pages: `/frontend/src/pages/`
- API Routes: `/backend/routes/`
- Middleware: `/backend/middleware/`

---

**Implementation Status: ✅ Complete**

All models, controllers, routes, and frontend pages have been created and configured for a fully functional role-based system.
