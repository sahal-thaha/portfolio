# 🚀 Sahal PT — Portfolio Deployment Guide

## Project Structure

```
sahal-portfolio/
├── src/                    ← React frontend
│   ├── components/
│   │   ├── layout/         ← Navbar, Footer
│   │   ├── sections/       ← Hero, About, Skills, Experience, Projects, Certifications, Contact
│   │   ├── game/           ← DinoGame
│   │   └── ui/             ← SocialIcons
│   ├── index.css           ← Global styles + CSS variables (dark/light theme)
│   └── App.jsx             ← Root component
├── backend/                ← Node.js/Express API
│   ├── server.js           ← Contact form API + MongoDB + Nodemailer
│   └── .env.example        ← Environment variable template
├── public/                 ← Static assets
│   └── sahal-photo.jpg     ← YOUR PHOTO (see step below)
└── .env.example            ← Frontend env vars
```

---

## ⚡ Step 1 — Add Your Photo

Copy your profile photo (`IMG_20250616_151349.jpg`) to:
```
sahal-portfolio/public/sahal-photo.jpg
```

---

## 🌐 Step 2 — Deploy Frontend on Vercel (FREE)

1. Push the `sahal-portfolio` folder to GitHub:
```bash
cd sahal-portfolio
git init
git add .
git commit -m "Initial portfolio commit"
git remote add origin https://github.com/sahal-thaha/portfolio.git
git push -u origin main
```

2. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
3. Click **"New Project"** → Import your repo
4. Settings:
   - **Framework**: Vite
   - **Root directory**: `sahal-portfolio` (if in a subfolder)
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL (step 4 below)
6. Click **Deploy** ✅

Your site will be live at `https://sahal-thaha.vercel.app` (or custom domain)

---

## 🗄️ Step 3 — Set Up MongoDB Atlas (FREE)

1. Go to **[mongodb.com/atlas](https://mongodb.com/atlas)** → Create free account
2. Create a **Free Cluster** (M0 — Free Forever)
3. Create a **Database User** with password
4. Click **Connect** → Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/sahal-portfolio
   ```
5. In **Network Access**, add `0.0.0.0/0` (allow from anywhere)

---

## 📧 Step 4 — Set Up Gmail App Password

1. Go to your Google Account → **Security** → **2-Step Verification** (enable it first)
2. Then go to **App passwords** → Generate one for "Mail"
3. You'll get a 16-character password like `abcd efgh ijkl mnop`

---

## ☁️ Step 5 — Deploy Backend on Railway (FREE tier available)

1. Go to **[railway.app](https://railway.app)** → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your portfolio repo
4. Set **Root directory** to `backend`
5. Add environment variables (click **Variables**):

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `EMAIL_USER` | your-gmail@gmail.com |
| `EMAIL_PASS` | Your 16-char app password |
| `NOTIFY_EMAIL` | sahal.bin.thaha@gmail.com |
| `FRONTEND_URL` | https://your-portfolio.vercel.app |
| `PORT` | 5000 |

6. Railway auto-deploys. Copy the **public URL** (e.g. `https://portfolio-backend.railway.app`)

### Alternative: Render.com (also free)
- Same steps, but go to **[render.com](https://render.com)**
- Create **Web Service** → Connect GitHub → Set root to `backend`
- Add the same environment variables

---

## 🔄 Step 6 — Connect Frontend to Backend

Go back to your **Vercel project** → **Settings** → **Environment Variables**:
- Add `VITE_API_URL` = `https://your-backend.railway.app`

Then **Redeploy** the Vercel project.

---

## 📬 Step 7 — Set Up EmailJS (Optional — Client-Side Only)

If you don't want to run a backend at all, use EmailJS:

1. Sign up at **[emailjs.com](https://emailjs.com)** (free: 200 emails/month)
2. Create a service (connect your Gmail)
3. Create an email template with variables: `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`
4. Get your **Service ID**, **Template ID**, and **Public Key**
5. Update `src/components/sections/Contact.jsx`:
   ```js
   import emailjs from 'emailjs-com'
   // Replace the fetch call with:
   await emailjs.send(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)
   ```

---

## 🎨 Step 8 — Customization Tips

### Change photo
Replace `public/sahal-photo.jpg` with your photo.

### Update colors
In `src/index.css`, change:
```css
--accent: #f0a500;        /* Light mode gold */
--accent: #d4820a;        /* Dark mode dark orange */
```

### Add/edit sections
- Skills: `src/components/sections/Skills.jsx` → Edit `skillGroups` array
- Projects: `src/components/sections/Projects.jsx` → Edit `projects` array
- Experience: `src/components/sections/Experience.jsx` → Edit `experiences` array

---

## 🏎️ Performance

The portfolio is built with:
- **Vite** — ultra-fast bundler (252KB total JS, 30KB CSS gzipped)
- **CSS Modules** — zero runtime overhead for styles
- **Canvas API** — hardware-accelerated particle animations
- **Intersection Observer** — lazy animation triggers
- Google Fonts loaded asynchronously

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| > 900px | Full two-column layouts |
| 600–900px | Single column, stacked |
| < 600px | Mobile-optimized, smaller fonts |

---

## 🔐 Security Notes

- Rate limiting on backend (5 requests per 15 mins)
- Input validation on both frontend and backend
- CORS restricted to your frontend URL
- MongoDB sanitization via Mongoose

---

## 🌍 Custom Domain (Optional)

On Vercel → **Settings** → **Domains** → Add `sahalpt.com` or similar.
Update `FRONTEND_URL` in your backend env vars accordingly.
