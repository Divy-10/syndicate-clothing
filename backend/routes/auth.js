const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to validate email domain
const validateEmailDomain = (emailVal) => {
  const allowedDomains = ['gmail.com', 'icloud.com'];
  const domain = emailVal?.split('@')[1];
  return allowedDomains.includes(domain?.toLowerCase());
};

// Helper function to generate and send OTP
const generateAndSendOTP = async (email) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save OTP to DB (TTL handles cleanup automatically)
  await OTP.create({ email: email.toLowerCase(), otp: otpCode });

  // Send Email
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"EL BRO SYNDICATE" <${process.env.SMTP_USER}>`,
        to: email.toLowerCase(),
        subject: "Email Verification OTP - EL BRO SYNDICATE",
        html: `<h3>Welcome to EL BRO SYNDICATE</h3>
               <p>Your one-time verification code is:</p>
               <h2 style="font-size: 32px; letter-spacing: 4px; color: #000; font-family: monospace;">${otpCode}</h2>
               <p>This code is valid for 5 minutes. Do not share it with anyone.</p>`
      });
      console.log(`✉️ OTP email successfully sent to: ${email}`);
    } catch (mailErr) {
      console.error("❌ Mailer Error:", mailErr.message);
    }
  }

  // Always output OTP to console for development ease
  console.log(`[OTP DEBUG] Verification OTP for ${email}: ${otpCode}`);
  return otpCode;
};

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, gender, dob } = req.body;

    // 1. STRICT DOMAIN CHECK
    if (!validateEmailDomain(email)) {
      return res.status(403).json({ 
        message: "Access Denied. Only @gmail.com and @icloud.com accounts are accepted for El Bro Syndicate membership." 
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      } else {
        // Delete unverified user to start signup fresh
        await User.deleteOne({ _id: existingUser._id });
        await OTP.deleteMany({ email: email.toLowerCase() });
      }
    }

    // 3. Hash Password and Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      name, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      phone: phone || '+919999999999',
      whatsapp,
      gender: gender || 'Other',
      dob: dob ? new Date(dob) : new Date('1990-01-01'),
      isVerified: false // Explicitly unverified until OTP check passes
    });
    await newUser.save();

    // 4. Generate and send OTP
    await generateAndSendOTP(email);

    res.status(201).json({ 
      success: true,
      email: email.toLowerCase(),
      message: "Welcome to the Syndicate. Verification OTP sent to your email." 
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- REGISTER ROUTE (Legacy / Redirects to Signup flow) ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, gender, dob } = req.body;
    
    if (!validateEmailDomain(email)) {
      return res.status(403).json({ 
        message: "Access Denied. Only @gmail.com and @icloud.com accounts are accepted for El Bro Syndicate membership." 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        await User.deleteOne({ _id: existingUser._id });
        await OTP.deleteMany({ email: email.toLowerCase() });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      name, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      phone: phone || '+919999999999',
      whatsapp,
      gender: gender || 'Other',
      dob: dob ? new Date(dob) : new Date('1990-01-01'),
      isVerified: false
    });
    await newUser.save();
    
    await generateAndSendOTP(email);

    res.status(201).json({ 
      success: true,
      email: email.toLowerCase(),
      message: "User created. Verification OTP sent to your email." 
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(400).json({ message: "User already exists or data error" });
  }
});

// --- VERIFY OTP ROUTE ---
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp: otp.trim() });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    // Clean up OTPs
    await OTP.deleteMany({ email: email.toLowerCase() });

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! You can now log in." 
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- RESEND OTP ROUTE ---
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Clean up old OTPs and send new one
    await OTP.deleteMany({ email: email.toLowerCase() });
    await generateAndSendOTP(email);

    res.status(200).json({ success: true, message: "Verification OTP resent successfully!" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Checking login for: ${email}`);

    // 1. Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log("❌ ERROR: User not found in Database");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if verified
    if (!user.isVerified) {
      console.log("❌ ERROR: Email not verified");
      return res.status(403).json({ message: "Please verify your email address to log in." });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ ERROR: Password does not match");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Success
    console.log("✅ LOGIN SUCCESSFUL");
    const token = generateToken(user);
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/auth/me — Get current user from token
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      whatsapp: req.user.whatsapp,
      gender: req.user.gender,
      dob: req.user.dob,
    },
  });
});

// PUT /api/auth/profile — Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, whatsapp, gender, dob, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (gender) user.gender = gender;
    if (dob) user.dob = new Date(dob);

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        whatsapp: updatedUser.whatsapp,
        gender: updatedUser.gender,
        dob: updatedUser.dob
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// --- GOOGLE LOGIN ROUTE ---
router.post('/google-login', async (req, res) => {
    try {
        const { token } = req.body;
        console.log("DEBUG: Loaded GOOGLE_CLIENT_ID in backend:", process.env.GOOGLE_CLIENT_ID);

        
        let payload;
        
        // Support fallback mock validation if client ID is mock or not specified
        if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.startsWith('mock-')) {
            console.log("ℹ️ MOCK GOOGLE LOGIN ACTIVE");
            payload = {
                email: 'google-client@gmail.com',
                name: 'Google Syndicate Client',
                sub: 'mock-google-id-12345'
            };
        } else {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }

        const { email, name, sub } = payload;

        // Apply strict domain filter to google login too
        const allowedDomains = ['gmail.com', 'icloud.com'];
        const domain = email?.split('@')[1];
        if (!allowedDomains.includes(domain?.toLowerCase())) {
            return res.status(403).json({ 
                message: "Access Denied. Only @gmail.com and @icloud.com accounts are accepted for El Bro Syndicate membership." 
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            // Register them automatically
            user = new User({
                name,
                email: email.toLowerCase(),
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random secure pass for OAuth
                role: 'customer',
                googleId: sub
            });
            await user.save();
        } else if (!user.googleId) {
            // Link googleId to existing user if signing in with Google for the first time
            user.googleId = sub;
            await user.save();
        }

        const jwtToken = generateToken(user);
        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                whatsapp: user.whatsapp,
                gender: user.gender,
                dob: user.dob
            }
        });
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(400).json({ message: "Google Login failed" });
    }
});

module.exports = router;
