const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Input sanitization helper
const sanitize = (str, maxLen = 1000) => {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim().slice(0, maxLen)
}

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// Rate limiting — prevents spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 contact messages per window
  message: { error: 'Too many requests, please try again later.' }
})

// MongoDB schema
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, trim: true, maxlength: 200, default: 'No subject' },
  message: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

const Message = mongoose.model('Message', messageSchema)

// Nodemailer transporter
const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail app password
  }
})

// POST /api/contact
app.post('/api/contact', limiter, async (req, res) => {
  try {
    const raw = req.body
    const name = sanitize(raw.name, 100)
    const email = sanitize(raw.email, 254)
    const subject = sanitize(raw.subject || 'Portfolio Contact', 200)
    const message = sanitize(raw.message, 2000)

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    // Save to MongoDB
    const msg = new Message({ name, email, subject: subject || 'Portfolio Contact', message })
    await msg.save()

    // Send notification email to Sahal
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL || 'sahal.bin.thaha@gmail.com',
      replyTo: email,
      subject: `[Portfolio] New message from ${name}: ${subject || 'No subject'}`,
      html: `
        <div style="font-family: monospace; background: #0a0a0f; color: #f0ece0; padding: 32px; border-left: 4px solid #d4820a;">
          <h2 style="color: #d4820a; margin-bottom: 24px;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #706c60; padding: 6px 0; width: 100px;">From:</td><td style="color: #f0ece0;">${name}</td></tr>
            <tr><td style="color: #706c60; padding: 6px 0;">Email:</td><td><a href="mailto:${email}" style="color: #d4820a;">${email}</a></td></tr>
            <tr><td style="color: #706c60; padding: 6px 0;">Subject:</td><td style="color: #f0ece0;">${subject || 'Not specified'}</td></tr>
            <tr><td style="color: #706c60; padding: 6px 0; vertical-align: top;">Message:</td><td style="color: #f0ece0; white-space: pre-wrap;">${message}</td></tr>
            <tr><td style="color: #706c60; padding: 6px 0;">Received:</td><td style="color: #706c60;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
          </table>
        </div>
      `,
    })

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Sahal P T" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Got your message, ${name.split(' ')[0]}!`,
      html: `
        <div style="font-family: monospace; background: #0a0a0f; color: #f0ece0; padding: 32px; border-left: 4px solid #d4820a;">
          <h2 style="color: #d4820a;">Hey ${name.split(' ')[0]},</h2>
          <p style="color: #c0bca8; line-height: 1.7; margin: 16px 0;">
            Thanks for reaching out through my portfolio. I've received your message and will get back to you within 24 hours.
          </p>
          <p style="color: #c0bca8; line-height: 1.7;">
            In the meantime, feel free to check out my work on 
            <a href="https://github.com/sahal-thaha" style="color: #d4820a;">GitHub</a> or connect on 
            <a href="https://linkedin.com/in/sahal-thaha" style="color: #d4820a;">LinkedIn</a>.
          </p>
          <hr style="border-color: #d4820a; opacity: 0.2; margin: 24px 0;" />
          <p style="color: #706c60; font-size: 12px;">
            — Sahal P T<br>
            Cybersecurity Engineer & Developer<br>
            Thrissur, Kerala, India
          </p>
        </div>
      `,
    })

    res.json({ success: true, message: 'Message sent successfully!' })
  } catch (err) {
    console.error('Contact error:', err)
    res.status(500).json({ error: 'Internal server error. Please email directly.' })
  }
})

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Connect & start
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('✓ MongoDB connected')
    } else {
      console.warn('⚠ No MONGODB_URI — messages will not be saved to DB')
    }
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`))
  } catch (err) {
    console.error('Startup error:', err)
    process.exit(1)
  }
}

startServer()

// Note for deployment: install helmet for additional security headers
// npm install helmet
// Then add: const helmet = require('helmet'); app.use(helmet());
