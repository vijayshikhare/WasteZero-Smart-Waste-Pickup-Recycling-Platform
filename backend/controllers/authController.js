// controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const path = require('path');
const fs = require('fs').promises;

// ────────────────────────────────────────────────
// Disposable / Temp / Spam Domains & Patterns
// ────────────────────────────────────────────────
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
  'yopmail.com', 'trashmail.com', 'throwawaymail.com', 'temp-mail.org',
  'dispostable.com', 'maildrop.cc', 'getairmail.com', '33mail.com',
  'sharklasers.com', 'armyspy.com', 'cuvox.de', 'einrot.com', 'jourrapide.com',
  'rhyta.com', 'superrito.com', 'teleworm.us', 'fakeinbox.com', 'mail.tm',
  'mailcatch.com', 'tmpmail.org', 'discard.email', 'airmail.cc', 'mymail.com',
  'mailnull.com', 'spamgourmet.com', 'spambox.us', 'spaml.com', 'spammotel.com',
  'spamspot.com', 'thisisnotmyrealemail.com', 'wegwerfmail.de', 'shitmail.me',
]);

const SPAM_USERNAME_PATTERNS = [
  /^test\d*$/i, /^spam\d*$/i, /^fake\d*$/i, /^dummy\d*$/i,
  /^temp\d*$/i, /^123\d*$/, /^abc\d*$/i, /^qwerty\d*$/i,
  /^admin\d*$/i, /^info\d*$/i, /^support\d*$/i, /^noreply\d*$/i,
];

const SPAM_PREFIXES = [
  'admin', 'info', 'support', 'noreply', 'no-reply', 'office', 'sales', 'marketing',
  'hr', 'test', 'spam', 'fake', 'dummy', 'temp', '123', 'abc', 'qwerty',
  'hello', 'hi', 'bye', 'fuck', 'shit', 'porn', 'sex', 'xxx', 'bot', 'robot',
];

// ────────────────────────────────────────────────
// Email Validation Helpers
// ────────────────────────────────────────────────
const hasValidMXRecords = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    const mx = await dns.resolveMx(domain);
    return mx.length > 0;
  } catch {
    return false;
  }
};

const isDisposableOrSpamEmail = async (email) => {
  const normalized = email.toLowerCase().trim();
  const [username, domain] = normalized.split('@');

  if (!username || !domain) {
    return { valid: false, message: 'Invalid email format' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, message: 'Temporary / disposable email addresses are not allowed' };
  }

  if (SPAM_USERNAME_PATTERNS.some(p => p.test(username))) {
    return { valid: false, message: 'This email appears to be a test or spam account' };
  }

  if (SPAM_PREFIXES.includes(username.toLowerCase())) {
    return { valid: false, message: 'Generic or suspicious email prefix detected' };
  }

  if (!(await hasValidMXRecords(normalized))) {
    return { valid: false, message: 'Invalid email domain (no mail server found)' };
  }

  return { valid: true };
};

// ────────────────────────────────────────────────
// OTP Helpers
// ────────────────────────────────────────────────
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const sendVerificationEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"WasteZero" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'WasteZero Verification Code',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <h2 style="color: #10b981;">WasteZero Email Verification</h2>
        <p>Use this code to verify your email:</p>
        <h1 style="letter-spacing: 10px; font-family: monospace; background: #e5e7eb; padding: 20px; text-align: center; border-radius: 12px; color: #111827;">
          ${otp}
        </h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 0.95rem;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });
};

// ────────────────────────────────────────────────
// Controllers
// ────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { name, email, password, role, ngoCertificationCode, adminSecretKey } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const emailCheck = await isDisposableOrSpamEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ message: emailCheck.message });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // ===== Validate Authorization Codes =====
    let finalRole = role && ['volunteer', 'ngo', 'admin'].includes(role) ? role : 'volunteer';

    if (finalRole === 'ngo') {
      if (!ngoCertificationCode?.trim()) {
        return res.status(400).json({ message: 'NGO Certification Code is required' });
      }
      if (ngoCertificationCode.trim() !== process.env.NGO_CERTIFICATION_CODE) {
        return res.status(403).json({ message: 'Invalid NGO Certification Code. Please contact WasteZero admin.' });
      }
    }

    if (finalRole === 'admin') {
      if (!adminSecretKey?.trim()) {
        return res.status(400).json({ message: 'Admin Master Key is required' });
      }
      if (adminSecretKey.trim() !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: 'Invalid Admin Master Key. Access denied.' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: finalRole,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd,                     // false in dev (http), true in prod (https)
      sameSite: isProd ? 'none' : 'lax',  // 'none' only works with secure:true
      maxAge: 30 * 60 * 1000,             // 30 minutes
      path: '/',
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    const payload = { message: 'Registration failed. Please try again.' };
    if (process.env.NODE_ENV !== 'production') {
      payload.error = err.message;
      payload.stack = err.stack && err.stack.substring(0, 1000);
    }
    res.status(500).json(payload);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select('+password');

    // Helpful debug for development
    console.log(`[LOGIN ATTEMPT] email=${normalized} found=${!!user} hasPassword=${!!user?.password}`);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If the user exists but has no password (created via OTP flow), guide them to use OTP or set a password
    if (!user.password) {
      return res.status(400).json({ message: 'This account does not have a password. Please use the OTP login or set a password via the "Forgot password" / profile flow.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password?.trim() || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[SET PASSWORD ERROR]', err);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const check = await isDisposableOrSpamEmail(email);
    if (!check.valid) {
      return res.status(400).json({ message: check.message });
    }

    const normalized = email.toLowerCase().trim();
    const otp = generateOTP();

    // Clean old OTPs
    await Otp.deleteMany({ email: normalized });

    await Otp.create({
      email: normalized,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendVerificationEmail(normalized, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[SEND OTP ERROR]', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    let { email, otp, role, ngoCertificationCode, adminSecretKey } = req.body;
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    email = email.toLowerCase().trim();

    const check = await isDisposableOrSpamEmail(email);
    if (!check.valid) {
      return res.status(400).json({ message: check.message });
    }

    const record = await Otp.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteOne({ _id: record._id });

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // ===== Validate Authorization Codes for New User =====
      let finalRole = role && ['volunteer', 'ngo', 'admin'].includes(role) ? role : 'volunteer';

      if (finalRole === 'ngo') {
        if (!ngoCertificationCode?.trim()) {
          return res.status(400).json({ message: 'NGO Certification Code is required' });
        }
        if (ngoCertificationCode.trim() !== process.env.NGO_CERTIFICATION_CODE) {
          return res.status(403).json({ message: 'Invalid NGO Certification Code. Please contact WasteZero admin.' });
        }
      }

      if (finalRole === 'admin') {
        if (!adminSecretKey?.trim()) {
          return res.status(400).json({ message: 'Admin Master Key is required' });
        }
        if (adminSecretKey.trim() !== process.env.ADMIN_SECRET_KEY) {
          return res.status(403).json({ message: 'Invalid Admin Master Key. Access denied.' });
        }
      }

      user = await User.create({
        email,
        name: email.split('@')[0].trim() || 'User',
        role: finalRole,
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isNewUser,
      message: isNewUser ? 'Account created and logged in' : 'Logged in successfully',
      token,
    });
  } catch (err) {
    console.error('[VERIFY OTP ERROR]', err);
    const payload = { message: 'Authentication failed' };
    if (process.env.NODE_ENV !== 'production') {
      payload.error = err.message;
      payload.stack = err.stack && err.stack.substring(0, 1000);
    }
    res.status(500).json(payload);
  }
};

const logout = (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -__v -createdAt -updatedAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('[GET PROFILE ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      email,
      address,
      location,
      skills,
      bio,
      currentPassword,
      newPassword,
    } = req.body;

    // Text fields
    if (name?.trim()) user.name = name.trim();

    if (email?.trim()) {
      const newEmail = email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const emailCheck = await isDisposableOrSpamEmail(newEmail);
        if (!emailCheck.valid) {
          return res.status(400).json({ message: emailCheck.message });
        }
        if (await User.findOne({ email: newEmail })) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        user.email = newEmail;
      }
    }

    if (address?.trim()) user.address = address.trim();
    if (location?.trim()) user.location = location.trim();
    if (bio !== undefined && bio !== null) user.bio = bio.trim();
    if (Array.isArray(skills)) {
      user.skills = skills.map(s => s.trim()).filter(Boolean);
    }

    // Password change
    if (newPassword && currentPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const userWithPass = await User.findById(req.user.id).select('+password');
      const isMatch = await bcrypt.compare(currentPassword, userWithPass.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Profile picture
    if (req.file) {
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', 'public', user.profilePicture);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.warn('[PROFILE] Failed to delete old photo:', err.message);
          }
        }
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const updated = await User.findById(user._id).select(
      '-password -__v -createdAt -updatedAt'
    );

    res.json({
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (err) {
    console.error('[UPDATE PROFILE ERROR]', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  setPassword,
  logout,
  getProfile,
  updateProfile,
};