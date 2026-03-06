# 🎬 Satyam Studio Pro

---

# ✅ KISKO KAHAN UPLOAD KARNA HAI

---

## 📦 1. GITHUB PE UPLOAD KARO (Code)

Steps:
1. github.com → New Repository → Name: satyam-studio
2. Terminal mein project folder mein jao, yeh chalaao:

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TERA_USERNAME/satyam-studio.git
git push -u origin main

NOTE: .env.local GitHub pe NAHI jayega — keys safe hain ✅

---

## 🔥 2. FIREBASE — Sirf Console mein ON karo (kuch upload nahi)

console.firebase.google.com → Satyam-Studio project open karo

A) Authentication:
   Build → Authentication → Get Started
   → Email/Password → Enable
   → Google → Enable

B) Database (Firestore):
   Build → Firestore Database → Create Database
   → "Start in test mode"
   → Region: asia-south1 (India)
   → Done ✅
   (Yahi database hai — alag kuch nahi karna!)

C) Storage (Photos/Videos ke liye):
   Build → Storage → Get Started
   → "Start in test mode"
   → Done ✅

---

## 🚀 3. VERCEL PE DEPLOY KARO (Live Website - FREE)

1. vercel.com → Login with GitHub
2. New Project → satyam-studio repo select karo
3. Environment Variables mein yeh sab daalo:

NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyApABMMLGaYk9zXl928paq5ILy41HA_Ekg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = satyam-studio-9851a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = satyam-studio-9851a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = satyam-studio-9851a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 222317334027
NEXT_PUBLIC_FIREBASE_APP_ID = 1:222317334027:web:b5013443d79cd5c76fc10e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-F105KLE348

4. Deploy!
   → Tumhara link milega: satyam-studio.vercel.app ✅

---

## SUMMARY

  CODE → GITHUB → VERCEL (live website)
  DATA → FIREBASE (database + storage + login)

---

## Local mein chalana:

npm install
npm run dev
http://localhost:3000
