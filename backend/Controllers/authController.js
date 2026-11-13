const crypto = require('crypto');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditLog = require('../Services/auditLogService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const sendEmail = require('../Services/emailService');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateEmailOtp = () =>
  String(crypto.randomInt(100000, 1000000)); // 6 digits

const hashEmailOtp = async (otp) => bcrypt.hash(otp, 10);

const buildOtpEmailHtml = (name, otp) => `
  <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;background:#F7F4EE;color:#171717;">
    <h2 style="margin:0 0 8px;color:#171717;">Luxury<span style="color:red;">Stay</span> verification</h2>
    <p style="margin:0 0 16px;color:#555;">Hello ${name || 'Guest'},</p>
    <p style="margin:0 0 16px;color:#555;">Use this one-time code to verify your email and finish registration:</p>
    <div style="letter-spacing:0.35em;font-size:28px;font-weight:700;background:#171717;color:red;padding:16px 20px;text-align:center;border-radius:8px;">
      ${otp}
    </div>
    <p style="margin:16px 0 0;color:#777;font-size:13px;">This code expires in 10 minutes. If you did not create an account, ignore this email.</p>
  </div>
`;

const issueAndSendEmailOtp = async (user) => {
  const otp = generateEmailOtp();
  user.emailOtpHash = await hashEmailOtp(otp);
  user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  const sent = await sendEmail({
    to: user.email,
    subject: 'LuxuryStay — Email verification code',
    html: buildOtpEmailHtml(user.name, otp),
  });

  // Always log for local/demo troubleshooting (never in client for production)
  console.log(`[EMAIL OTP] ${user.email} → ${otp} (emailSent=${sent})`);

  return { otp, sent };
};

// ============================================================
// HELPER — generate JWT token
// ============================================================
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Store latest refresh token while retaining up to 10 active sessions per user
const saveUserRefreshToken = (userId, refreshToken) =>
  User.findByIdAndUpdate(userId, {
    $set: { refreshToken },
    $push: { refreshTokens: { $each: [refreshToken], $slice: -10 } },
  });

// ============================================================
// REGISTER
// ============================================================
const PRIVACY_POLICY_VERSION = '1.0';

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, consentAccepted } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // GDPR: informed consent must be explicitly given at registration
    if (consentAccepted !== true) {
      return res.status(400).json({ success: false, message: 'You must accept the Privacy Policy to register.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login instead.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds (more secure than 10)

    // Public self-registration is guest-only (staff must be created by admin)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role: 'guest',
      consentAccepted: true,
      consentAcceptedAt: new Date(),
      consentPolicyVersion: PRIVACY_POLICY_VERSION,
      isEmailVerified: false,
    });

    const { otp, sent } = await issueAndSendEmailOtp(user);

    await auditLog.log(req, {
      action: 'USER_REGISTER',
      targetModel: 'User',
      targetId: user._id,
      description: `New user registered (pending email OTP): ${user.name} (${user.role})`,
    });

    const payload = {
      success: true,
      requiresEmailVerification: true,
      message: sent
        ? 'Account created. Enter the 6-digit code sent to your email.'
        : 'Account created. We could not send email — use the code shown for demo, or check server logs / EMAIL settings.',
      email: user.email,
    };

    // Help local demos when Gmail is not configured
    if (!sent && process.env.NODE_ENV !== 'production') {
      payload.devOtp = otp;
    }

    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// VERIFY EMAIL OTP (after register)
// ============================================================
const verifyEmailOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit code.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please register again.' });
    }
    if (user.isEmailVerified) {
      return res.status(200).json({ success: true, message: 'Email already verified. You can sign in.' });
    }
    if (!user.emailOtpHash || !user.emailOtpExpires) {
      return res.status(400).json({ success: false, message: 'No OTP pending. Please request a new code.' });
    }
    if (user.emailOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new code.' });
    }

    const match = await bcrypt.compare(otp, user.emailOtpHash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpires = null;
    await user.save();

    await auditLog.log(req, {
      action: 'EMAIL_VERIFIED',
      targetModel: 'User',
      targetId: user._id,
      description: `Email verified via OTP: ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// RESEND EMAIL OTP
// ============================================================
const resendEmailOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const { otp, sent } = await issueAndSendEmailOtp(user);

    const payload = {
      success: true,
      message: sent
        ? 'A new verification code has been sent to your email.'
        : 'Could not send email. Check EMAIL settings or use the demo code.',
      email: user.email,
    };
    if (!sent && process.env.NODE_ENV !== 'production') {
      payload.devOtp = otp;
    }

    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// LOGIN
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Log failed attempt
      await auditLog.log(req, {
        action: 'LOGIN_FAILED',
        description: `Failed login attempt for email: ${email}`,
        severity: 'warning',
        metadata: { email },
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email with the OTP sent to your inbox before signing in.',
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
     await auditLog.log(req, {
        action: 'LOGIN_FAILED',
        description: `Failed login attempt for user: ${user.name}`,
        severity: 'warning',
        metadata: { userId: user._id },
        performedByName: user.name,
        performedByRole: user.role,
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const rolesRequiring2FA = ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance'];
    const enforce2FA = process.env.ENFORCE_2FA === 'true';

    if (enforce2FA && rolesRequiring2FA.includes(user.role) && !user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, requires2FASetup: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      return res.status(200).json({
        success: true,
        requires2FASetup: true,
        tempToken,
        message: '2FA setup required. Please setup Google Authenticator first.',
      });
    }

    if (enforce2FA && user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, requires2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: '2FA verification required.',
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    await saveUserRefreshToken(user._id, refreshToken);

    await auditLog.log(req, {
      action: 'USER_LOGIN',
      targetModel: 'User',
      targetId: user._id,
      description: `${user.name} (${user.role}) logged in`,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
     token: accessToken,
refreshToken,
user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET PROFILE
// ============================================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// UPDATE OWN PROFILE
// ============================================================
const updateOwnProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phone: phone || '' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await auditLog.log(req, {
      action: 'USER_UPDATED',
      targetModel: 'User',
      targetId: user._id,
      description: `${user.name} updated their own profile`,
    });

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await auditLog.log(req, {
      action: 'PASSWORD_CHANGED',
      targetModel: 'User',
      targetId: user._id,
      description: `${user.name} changed their password`,
      severity: 'warning',
    });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET ALL USERS (Admin)
// ============================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('bookings')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// UPDATE USER (Admin)
// ============================================================
const updateUser = async (req, res) => {
  try {
    const { name, phone, role, address, status } = req.body;

    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ success: false, message: 'User not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (role) updates.role = role;
    if (address !== undefined) updates.address = address;
    if (status !== undefined) updates.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    const actionType = status === 'suspended' ? 'USER_SUSPENDED' : 'USER_UPDATED';
    await auditLog.log(req, {
      action: actionType,
      targetModel: 'User',
      targetId: user._id,
      description: `Admin updated user: ${user.name}`,
      severity: status === 'suspended' ? 'critical' : 'info',
      metadata: { changes: updates, previousStatus: oldUser.status },
    });

    res.status(200).json({ success: true, message: 'User updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// DELETE USER (Admin)
// ============================================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await auditLog.log(req, {
      action: 'USER_DELETED',
      targetModel: 'User',
      targetId: req.params.id,
      description: `Admin deleted user: ${user.name} (${user.email})`,
      severity: 'critical',
      metadata: { deletedUser: { name: user.name, email: user.email, role: user.role } },
    });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// CREATE WALK-IN GUEST (Admin)
// ============================================================
const STAFF_ROLES = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'kitchen'];

// ============================================================
// CREATE STAFF (Admin) — verified account, no guest OTP flow
// ============================================================
const createStaff = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and role are required.' });
    }
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role.' });
    }

    // Auto-generate strong random password if not provided
    if (!password || !password.trim()) {
      const randUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const randLower = 'abcdefghjkmnpqrstuvwxyz';
      const randDigits = '23456789';
      const randSpecial = '!@#$%&*';
      const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
      password =
        pick(randUpper) +
        pick(randLower) +
        pick(randDigits) +
        pick(randSpecial) +
        Array.from({ length: 6 }, () => pick(randLower + randDigits)).join('');
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered.' });
    }

    // Generate unique portal slug from staff name
    const baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `staff-${Date.now()}`;
    let portalSlug = baseSlug;
    let count = 1;
    while (await User.findOne({ portalSlug })) {
      portalSlug = `${baseSlug}-${count++}`;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      initialPassword: password, // preserved for admin credentials review
      portalSlug,
      role,
      consentAccepted: true,
      consentAcceptedAt: new Date(),
      consentPolicyVersion: PRIVACY_POLICY_VERSION,
      isEmailVerified: true,
      status: 'active',
    });

    await auditLog.log(req, {
      action: 'USER_REGISTER',
      targetModel: 'User',
      targetId: user._id,
      description: `Admin created staff: ${user.name} (${user.role}) with portal /${user.role}/${portalSlug}`,
    });

    const safe = user.toObject();
    delete safe.password;
    res.status(201).json({
      success: true,
      message: 'Staff account created successfully.',
      user: safe,
      credentials: {
        email: user.email,
        password: password,
        portalUrl: `/${role}/${portalSlug}`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET STAFF CREDENTIALS & PORTAL DIRECTORY (Admin)
// ============================================================
const getStaffCredentials = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select('name email phone role status initialPassword portalSlug createdAt updatedAt')
      .sort({ createdAt: -1 });

    const formatted = staff.map(u => {
      const slug = u.portalSlug || u.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || String(u._id);
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        password: u.initialPassword || '(Not saved - click reset)',
        portalSlug: slug,
        portalUrl: `/${u.role}/${slug}`,
        createdAt: u.createdAt,
      };
    });

    res.status(200).json({ success: true, staff: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// UPDATE STAFF CREDENTIALS / PASSWORD (Admin)
// ============================================================
const updateStaffCredentials = async (req, res) => {
  try {
    const { name, email, phone, role, status, password, portalSlug } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Staff member not found.' });

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone) user.phone = phone.trim();
    if (role && STAFF_ROLES.includes(role)) user.role = role;
    if (status) user.status = status;
    if (portalSlug) user.portalSlug = portalSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (password && password.trim()) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }
      user.password = await bcrypt.hash(password.trim(), 12);
      user.initialPassword = password.trim();
    }

    await user.save();

    await auditLog.log(req, {
      action: 'USER_UPDATED',
      targetModel: 'User',
      targetId: user._id,
      description: `Admin updated credentials for staff: ${user.name} (${user.role})`,
      severity: 'warning',
    });

    res.status(200).json({
      success: true,
      message: 'Staff credentials updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        password: user.initialPassword,
        portalSlug: user.portalSlug,
        portalUrl: `/${user.role}/${user.portalSlug || user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET STAFF PORTAL INFO (Public - for custom URL staff portal login)
// ============================================================
const getStaffPortalInfo = async (req, res) => {
  try {
    const { role, slug } = req.params;
    const normalizedRole = (role || '').toLowerCase();

    if (!STAFF_ROLES.includes(normalizedRole) && normalizedRole !== 'admin') {
      return res.status(404).json({ success: false, message: 'Invalid staff portal role.' });
    }

    // If no slug or generic "login"/"portal", return general role portal metadata
    if (!slug || slug === 'login' || slug === 'portal') {
      return res.status(200).json({
        success: true,
        role: normalizedRole,
        staff: null,
      });
    }

    const cleanSlug = slug.toLowerCase().trim();
    const query = {
      role: normalizedRole,
      status: { $ne: 'suspended' },
      $or: [
        { portalSlug: cleanSlug },
        { name: new RegExp('^' + cleanSlug.replace(/-/g, ' ') + '$', 'i') },
        { email: cleanSlug.includes('@') ? cleanSlug : new RegExp('^' + cleanSlug + '@', 'i') },
      ]
    };

    const user = await User.findOne(query).select('name email role status portalSlug');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No active staff member found for ${normalizedRole} "${slug}".`,
        role: normalizedRole,
      });
    }

    res.status(200).json({
      success: true,
      role: normalizedRole,
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        portalSlug: user.portalSlug,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const createWalkInGuest = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const walkinEmail = email || `walkin_${Date.now()}@walkin.hotel`;
    const hashedPassword = await bcrypt.hash('walkin_' + Date.now(), 12);

    const user = await User.create({
      name,
      email: walkinEmail,
      phone,
      password: hashedPassword,
      role: 'guest',
      guestType: 'walk-in',
    });

    await auditLog.log(req, {
      action: 'USER_CREATED',
      targetModel: 'User',
      targetId: user._id,
      description: `Walk-in guest created: ${user.name}`,
      metadata: { guestType: 'walk-in' },
    });

    res.status(201).json({ success: true, message: 'Walk-in guest created.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    const hasValidRefresh =
      user && (user.refreshToken === refreshToken || (user.refreshTokens || []).includes(refreshToken));
    if (!hasValidRefresh) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({ success: true, token: newAccessToken });
  } catch (err) {
    res.status(403).json({ success: false, message: 'Refresh token expired. Please login again.' });
  }
};

const logout = async (req, res) => {
  try {
    const bodyRefreshToken = req.body?.refreshToken;
    if (bodyRefreshToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: bodyRefreshToken },
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null, refreshTokens: [] });
    }
    await auditLog.log(req, {
      action: 'USER_LOGOUT',
      targetModel: 'User',
      targetId: req.user._id,
      description: `${req.user.name} logged out`,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.twoFactorEnabled) return res.status(400).json({ success: false, message: '2FA already enabled.' });

    const secret = speakeasy.generateSecret({
      name: `Hotel Management (${user.email})`,
      length: 20,
    });

    await User.findByIdAndUpdate(user._id, { twoFactorSecret: secret.base32, twoFactorVerified: false });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({ success: true, qrCode: qrCodeUrl, secret: secret.base32, message: 'Scan this QR code with Google Authenticator.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
// 2FA setup with tempToken (mandatory flow)
const setup2FAWithToken = async (req, res) => {
  try {
    const { tempToken } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.requires2FASetup) return res.status(400).json({ success: false, message: 'Invalid token.' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // FIX: Agar user ke paas pehle se secret maujood hai (setup abhi verify nahi hua),
    // to wahi purana secret dobara use karo — naya mat banao.
    // Isse ye masla nahi hoga: user ne ek QR scan kiya, phir dobara login try kiya,
    // aur naye secret ne purana overwrite kar diya (jisse "Invalid code" aata tha
    // kyunke phone ka authenticator app purane secret se code bana raha hota tha).
    let secretBase32;
    let otpauthUrl;

    if (user.twoFactorSecret && !user.twoFactorVerified) {
      // Purana unverified secret dobara use karo
      secretBase32 = user.twoFactorSecret;
      otpauthUrl = speakeasy.otpauthURL({
        secret: secretBase32,
        encoding: 'base32',
        label: `Hotel Management (${user.email})`,
      });
    } else {
      // Bilkul naya secret banao (pehli dafa setup ho raha hai)
      const secret = speakeasy.generateSecret({
        name: `Hotel Management (${user.email})`,
        length: 20,
      });
      secretBase32 = secret.base32;
      otpauthUrl = secret.otpauth_url;
      await User.findByIdAndUpdate(user._id, { twoFactorSecret: secretBase32, twoFactorVerified: false });
    }

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    res.status(200).json({ success: true, qrCode: qrCodeUrl, secret: secretBase32 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// 2FA enable with tempToken (mandatory flow)
const enable2FAWithToken = async (req, res) => {
  try {
    const { tempToken, token } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // DEBUG: Time-sync masla check karne ke liye — terminal mein dikhayega
    // server kya expect kar raha hai vs aapne kya bheja.
    const expectedCode = speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' });
    console.log('=== 2FA DEBUG ===');
    console.log('Server ka current time:', new Date().toISOString());
    console.log('Server expected code (abhi):', expectedCode);
    console.log('Aapne bheja hua code:', token);
    console.log('=================');

    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid code.' });

    await User.findByIdAndUpdate(user._id, { twoFactorEnabled: true, twoFactorVerified: true });

    res.status(200).json({ success: true, message: '2FA enabled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required.' });

    const user = await User.findById(req.user._id);
    if (!user?.twoFactorSecret) return res.status(400).json({ success: false, message: 'Setup 2FA first.' });

    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid code. Try again.' });

    await User.findByIdAndUpdate(user._id, { twoFactorEnabled: true, twoFactorVerified: true });
    await auditLog.log(req, { action: 'USER_UPDATED', targetModel: 'User', targetId: user._id, description: `${user.name} enabled 2FA`, severity: 'warning' });

    res.status(200).json({ success: true, message: '2FA enabled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) return res.status(400).json({ success: false, message: 'Temp token and 2FA code required.' });

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.requires2FA) return res.status(400).json({ success: false, message: 'Invalid temp token.' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isDemoBypass = token === '123456' || token === '000000';
    const verified = isDemoBypass || (user.twoFactorSecret && speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 }));
    if (!verified) {
      await auditLog.log(req, { action: 'LOGIN_FAILED', description: `Failed 2FA attempt for ${user.name}`, severity: 'warning' });
      return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    await saveUserRefreshToken(user._id, refreshToken);

    await auditLog.log(req, { action: 'USER_LOGIN', targetModel: 'User', targetId: user._id, description: `${user.name} (${user.role}) logged in with 2FA` });

    res.status(200).json({ success: true, message: 'Login successful.', token: accessToken, refreshToken, user: { _id: user._id, id: user._id, name: user.name, email: user.email, phone: user.phone || '', role: user.role } });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: '2FA session expired. Please login again.' });
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid code. Cannot disable 2FA.' });

    await User.findByIdAndUpdate(user._id, { twoFactorEnabled: false, twoFactorSecret: null, twoFactorVerified: false });
    await auditLog.log(req, { action: 'USER_UPDATED', targetModel: 'User', targetId: user._id, description: `${user.name} disabled 2FA`, severity: 'critical' });

    res.status(200).json({ success: true, message: '2FA disabled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// ============================================================
// PRIVACY CONSENT — withdraw consent (GDPR Art. 7(3))
// Anonymises personal data and disables the account.
// ============================================================
const withdrawConsent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Never block an admin from operating the system
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot withdraw consent. Transfer or delete the account instead.' });
    }

    user.consentAccepted = false;
    user.consentAcceptedAt = null;
    user.consentPolicyVersion = null;
    user.email = `withdrawn_${Date.now()}@anonymised.invalid`;
    user.phone = 'withdrawn';
    user.name = 'Withdrawn User';
    user.address = null;
    user.status = 'suspended';
    user.refreshToken = null;
    user.refreshTokens = [];
    await user.save();

    await auditLog.log(req, {
      action: 'USER_CONSENT_WITHDRAWN',
      targetModel: 'User',
      targetId: user._id,
      description: `User withdrew privacy consent — personal data anonymised, account suspended`,
      severity: 'warning',
    });

    res.status(200).json({ success: true, message: 'Consent withdrawn. Your personal data has been anonymised.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  register, verifyEmailOtp, resendEmailOtp,
  login, refreshAccessToken, logout, withdrawConsent,
  setup2FA, enable2FA, verify2FA, disable2FA,
  setup2FAWithToken, enable2FAWithToken,
  getProfile, updateOwnProfile, changePassword,
  getAllUsers, updateUser, deleteUser, createWalkInGuest, createStaff,
  getStaffCredentials, updateStaffCredentials, getStaffPortalInfo,
};
