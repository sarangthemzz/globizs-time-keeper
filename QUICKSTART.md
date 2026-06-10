# Globizs - Quick Start Guide

## Project Overview

**Globizs** is a modern, full-stack scheduling application built with Next.js 15, featuring secure authentication, dynamic time slot scheduling, and a beautiful responsive UI.

**Key Features:**
- ✅ Secure credential-based authentication (30-day sessions)
- ✅ Dynamic time slot builder with auto-generation
- ✅ Schedule history with search and filtering
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Professional UI with shadcn/ui components
- ✅ SQLite (dev) / PostgreSQL (production) support
- ✅ TypeScript for type safety

---

## 📋 Prerequisites

- **Node.js** 18+ (verify: `node --version`)
- **npm** 9+ (verify: `npm --version`)
- A code editor (VS Code recommended)

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Navigate to Project
```bash
cd d:\Globizs\GlobizsSushil01\Globizs01
```

### Step 2: Start Development Server
```bash
npm run dev
```

The server will start at **http://localhost:3000**

### Step 3: Open in Browser
Navigate to http://localhost:3000

### Step 4: Sign In with Demo Account
- **Email:** demo@example.com
- **Password:** password123

---

## 🎯 First Time Setup (if needed)

If you encounter any issues, run the setup sequence:

```bash
# Install dependencies
npm install

# Create database
npm run db:push

# Seed demo data
npm run db:seed

# Build project
npm run build

# Start dev server
npm run dev
```

---

## 🏗️ Project Structure

```
Globizs01/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Authentication
│   │   └── schedules/              # Schedule API
│   ├── dashboard/                   # Protected dashboard
│   ├── page.tsx                     # Login page
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Styles
│   └── not-found.tsx                # 404 page
├── components/
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard layout
│   │   ├── sidebar.tsx              # Sidebar (history)
│   │   ├── main-content.tsx         # Main area
│   │   ├── date-selector.tsx        # Date picker
│   │   ├── time-slot-builder.tsx    # Time slots
│   │   └── history-modal.tsx        # Schedule history
│   ├── ui/                          # Reusable components
│   └── logo.tsx                     # Logo component
├── lib/
│   ├── prisma.ts                    # Database client
│   ├── utils.ts                     # Utilities
│   └── time-utils.ts                # Time formatting
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.js                      # Demo data
├── types/
│   └── next-auth.d.ts               # Auth types
├── auth.ts                          # Auth config
├── middleware.ts                    # Route protection
├── .env                             # Environment vars
└── package.json                     # Dependencies
```

---

## 🔑 Main Features Tour

### 1. **Landing Page (Login)**
- Clean card design with professional styling
- Email/Phone and password fields
- Form validation and error handling
- Demo credentials provided

### 2. **Dashboard Header**
- Globizs logo on the left
- Sign Out button on the right
- Responsive sticky header

### 3. **Left Panel (30%) - Schedule Manager**
- "View History" button
- Opens history modal with:
  - All submitted schedules
  - Search by date
  - Time slots display
  - Submission timestamps

### 4. **Right Panel (70%) - Schedule Builder**
- **Date Selector:** Click to pick any future date
- **Dynamic Time Slots:**
  - First row: Start time 09:00 AM (read-only)
  - Add end times (e.g., 10:00 AM)
  - Each new row auto-generates with previous end time
  - Continue indefinitely
- **Submit Button:** Save all slots to database

---

## 💾 Database Schema

### Users
```sql
- id (Integer, PK)
- email (String, Unique)
- phone (String, Optional)
- password (String, Hashed with bcryptjs)
- name (String, Optional)
- createdAt, updatedAt (DateTime)
```

### Schedules
```sql
- id (Integer, PK)
- userId (Integer, FK)
- selectedDate (DateTime)
- createdAt, updatedAt (DateTime)
```

### TimeSlots
```sql
- id (Integer, PK)
- scheduleId (Integer, FK)
- startTime (DateTime)
- endTime (DateTime)
- createdAt (DateTime)
```

---

## 📱 Time Slot Behavior

**Example Workflow:**

1. User selects June 15, 2026
2. First row shows:
   - Start: 09:00 AM (pre-filled, read-only)
   - End: [empty input]
3. User types "10:00 AM" in end field
4. New row auto-creates:
   - Start: 10:00 AM (auto-filled from previous end)
   - End: [empty input]
5. User types "11:30 AM"
6. Another row auto-creates
7. ... process continues
8. Click "Submit Schedule" to save

**Validations:**
- End time must be after start time
- No overlapping times
- Required fields before submit
- Time format: HH:MM AM/PM

---

## 🔐 Authentication Details

- **Strategy:** JWT (JSON Web Tokens)
- **Session Duration:** 30 days
- **Password Hashing:** bcryptjs with salt rounds 10
- **Protected Routes:** `/dashboard/*` - redirects to login if not authenticated
- **Credentials Accepted:** Email OR Phone

---

## 🎨 Styling & UI

- **Framework:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI + Tailwind)
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)
- **Date Picker:** React Day Picker
- **Colors:** Professional dark/light theme support

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:push      # Sync schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint

# Setup
npm run setup        # Full setup (install + db + seed)
```

---

## 🌐 Environment Variables

**`.env` file (already configured):**
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="globizs-dev-secret-key-2026"
SESSION_MAX_AGE=2592000
```

**For Production:** Update these values in `.env.production`

---

## 🐛 Troubleshooting

### **Dev server won't start**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start again
npm run dev
```

### **Database errors**
```bash
# Reset database completely
rm dev.db*
npm run db:push
npm run db:seed
```

### **Login not working**
- Verify `.env` file exists with DATABASE_URL
- Check Prisma database is created: `ls dev.db`
- Reseed: `npm run db:seed`
- Check browser console for errors

### **Styles not loading**
```bash
# Clear build cache and restart
rm -rf .next
npm run dev
```

---

## 🚀 Next Steps

1. **Explore the UI**
   - Sign in with demo@example.com / password123
   - Try creating a schedule
   - View history modal

2. **Customize**
   - Update logo in `/components/logo.tsx`
   - Modify colors in `/app/globals.css`
   - Change form fields as needed

3. **Add New Users**
   - Sign up functionality can be added in future
   - Currently using pre-seeded demo account

4. **Deploy**
   - Use Vercel (recommended)
   - Set production environment variables
   - Configure PostgreSQL for production

---

## 📚 Technology Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | Full-stack framework |
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Prisma | ORM/Database |
| NextAuth v5 | Authentication |
| SQLite | Development DB |
| PostgreSQL | Production DB |
| shadcn/ui | UI Components |
| Sonner | Toast notifications |

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in (NextAuth)
- `POST /api/auth/signout` - Sign out (NextAuth)

### Schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - Get user's schedules

---

## 💡 Tips & Best Practices

1. **Development:** Always run `npm run dev` from the project root
2. **Database:** Never commit `.env` with real secrets
3. **Styling:** Use Tailwind classes, avoid inline styles
4. **Components:** Keep components small and reusable
5. **Authentication:** Sessions expire after 30 days

---

## 🎓 Learning Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [NextAuth.js v5](https://next-auth.js.org/v5)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## ✨ Features Overview

### Current
- ✅ Secure login/logout
- ✅ Dynamic schedule builder
- ✅ Schedule history with search
- ✅ Professional responsive UI
- ✅ Database persistence
- ✅ 30-day sessions

### Future Enhancements
- 📋 User registration
- 📧 Email notifications
- 🔄 Export schedules
- 📱 Mobile app
- 🌍 Multi-language
- 🎯 Advanced analytics

---

## 📞 Support

For issues or questions:
1. Check `/README.md` for detailed docs
2. Review error messages in browser console
3. Check terminal output for server errors
4. Verify environment variables in `.env`

---

**Happy scheduling! 🎯**
