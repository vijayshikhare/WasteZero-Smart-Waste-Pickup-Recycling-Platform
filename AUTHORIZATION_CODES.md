# Authorization Codes for Secured Registration

To maintain data integrity and prevent unauthorized access, NGO and Admin accounts now require special authorization codes during registration.

## 🔐 Authorization Codes

### NGO Registration Code
```
WASTEZERO_NGO_2024
```

**When requested:** During NGO account registration
**Purpose:** Ensures only verified organizations can register as NGOs
**How to use:** 
1. Navigate to Register page
2. Select "🏢 NGO / Organization" as role
3. Enter the NGO Certification Code when prompted
4. Complete registration with password or OTP

---

### Admin Master Key
```
ADMIN_MASTER_KEY_SECURE_2024
```

**When requested:** During Admin account registration
**Purpose:** Restricts platform administrator access to authorized personnel only
**How to use:**
1. Navigate to Register page
2. Select "👨‍💼 Admin / Platform Manager" as role
3. Enter the Admin Master Key when prompted
4. Complete registration with password or OTP

---

## 🤝 Volunteer Registration

Volunteers do NOT require any special codes. They can register freely as:
- **Role:** 🤝 Volunteer / Individual
- **Process:** Standard registration with name, email, and password/OTP

---

## 🔒 Security Features

### Frontend Validation
- Authorization codes are validated before OTP is sent
- Codes must be entered for NGO/Admin account creation
- Error messages guide users when codes are missing or incorrect

### Backend Validation
- Codes are verified server-side before account creation
- Invalid codes receive a 403 Forbidden response
- Only exact matches are accepted (case-sensitive)

### Environment Configuration
Authorization codes are stored in `backend/.env`:
```env
NGO_CERTIFICATION_CODE=WASTEZERO_NGO_2024
ADMIN_SECRET_KEY=ADMIN_MASTER_KEY_SECURE_2024
```

⚠️ **Production Security Note**: 
- Change these codes immediately in production
- Use strong, random, unique codes
- Distribute only to authorized personnel
- Never commit production codes to version control

---

## 📋 Account Types Summary

| Account Type | Registration Code Required | Access Level |
|---|---|---|
| 🤝 Volunteer | ❌ No | Create/Join opportunities, View pickups |
| 🏢 NGO | ✅ Yes | Post opportunities, Manage teams, Advanced analytics |
| 👨‍💼 Admin | ✅ Yes | Full platform control, User management, Reports, Analytics |

---

## 🛠️ Changing Authorization Codes

### To update codes:

1. **Update `.env` file:**
   ```env
   NGO_CERTIFICATION_CODE=your_new_ngo_code
   ADMIN_SECRET_KEY=your_new_admin_key
   ```

2. **Restart backend server:**
   ```bash
   npm start
   ```

3. **Inform authorized users** of new codes

### Important:
- Only users who know the new codes can register after the change
- Existing NGO/Admin accounts are not affected
- Old codes will no longer work for registration

---

## ✅ Testing the System

### Test NGO Registration:
1. Go to `/register`
2. Select "🏢 NGO / Organization"
3. Enter NGO Certification Code: `WASTEZERO_NGO_2024`
4. Expected: Account created successfully

### Test Admin Registration:
1. Go to `/register`
2. Select "👨‍💼 Admin / Platform Manager"
3. Enter Admin Master Key: `ADMIN_MASTER_KEY_SECURE_2024`
4. Expected: Account created successfully

### Test Invalid Code:
1. Go to `/register`
2. Select NGO or Admin role
3. Enter wrong code
4. Expected: "Invalid certification code" error

---

## 📌 Notes

- Volunteers can change their role to NGO/Admin only by admin request (future feature)
- Authorization codes prevent:
  - Random people registering as NGOs
  - Unauthorized platform administrators
  - Data integrity issues from unverified accounts
- Codes are NOT email-based, role-based, or invite-link based (by design)

