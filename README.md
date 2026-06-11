# Globizs - Modern Schedule Management Application

A full-stack scheduling application built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. Features secure authentication, dynamic time slot scheduling, and history tracking.

## 🚀 Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Authentication**: Secure credentials-based authentication with 30-day sessions
- **Dynamic Schedule Builder**: Create unlimited time slots with automatic row generation
- **History Modal**: View and search all submitted schedules
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Database**: Prisma ORM with SQLite (dev) and PostgreSQL (production) support
- **Type Safety**: Full TypeScript support
- **Protected Routes**: Dashboard routes protected with middleware
- **Dark Mode Ready**: Built with dark mode support

## 📋 Requirements

- Node.js 18+ and npm/yarn
- SQLite (development) or PostgreSQL (production)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env.local` with your settings:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-secret-key"
SESSION_MAX_AGE=2592000  # 30 days
```

For production with PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/globizs"
```

### 3. Setup Database

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📝 Demo Credentials

- **Email**: demo@example.com
- **Password**: password123

## 📁 Project Structure

```
globizs/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth configuration
│   │   └── schedules/                # Schedule API routes
│   ├── dashboard/                    # Protected dashboard page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Login page
│   └── globals.css                   # Global styles
├── components/
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard layout
│   │   ├── sidebar.tsx              # Sidebar with history button
│   │   ├── main-content.tsx         # Main content area
│   │   ├── date-selector.tsx        # Date picker component
│   │   ├── time-slot-builder.tsx    # Dynamic time slot builder
│   │   └── history-modal.tsx        # Schedule history modal
│   ├── ui/                          # shadcn/ui components
│   └── logo.tsx                     # Logo component
├── lib/
│   ├── prisma.ts                    # Prisma client
│   ├── utils.ts                     # Utility functions
│   └── time-utils.ts                # Time formatting utilities
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Seed script
├── auth.ts                          # NextAuth configuration
├── middleware.ts                    # Route protection middleware
└── tsconfig.json                    # TypeScript config
```

## 🏗️ Database Schema

### Users Table
```typescript
- id (Integer, Primary Key)
- email (String, Unique)
- phone (String, Optional)
- password (String, Hashed)
- name (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Schedules Table
```typescript
- id (Integer, Primary Key)
- userId (Integer, Foreign Key → User.id)
- selectedDate (DateTime)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### TimeSlots Table
```typescript
- id (Integer, Primary Key)
- scheduleId (Integer, Foreign Key → Schedule.id)
- startTime (DateTime)
- endTime (DateTime)
- createdAt (DateTime)
```

## 🎯 Key Features Explained

### Authentication Flow
1. User enters email/phone and password on landing page
2. Credentials are validated against database
3. JWT token is generated with 30-day expiration
4. User is redirected to `/dashboard`
5. Protected routes check authentication via middleware

### Dynamic Time Slot Builder
1. First row starts with 09:00 AM as start time
2. User enters end time (e.g., 10:00 AM)
3. Next row automatically creates with previous end time as new start time
4. Process continues until user submits
5. Validation prevents invalid/overlapping times

### Schedule Submission
1. All time slots are collected
2. Data is sent to API with selected date
3. Schedule and time slots are saved to database
4. Success notification is displayed
5. Form resets for new submission

### History Modal
1. Click "View History" in sidebar
2. Modal fetches all user schedules from database
3. Displays date, time slots, and submission timestamp
4. Search by date to filter results
5. List is sorted newest first

## 🔐 Security Features

- Password hashing with bcryptjs
- Protected API routes with session validation
- Middleware-based route protection
- CSRF protection via NextAuth
- Session expiration after 30 days
- Environment variables for secrets

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (full width layout)
- **Tablet**: 768px - 1024px (optimized spacing)
- **Desktop**: > 1024px (full 30/70 split)

## 🎨 Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible components
- **Lucide React** for icons
- **CSS custom properties** for theming
- Dark mode support via `dark:` classes

## 🚢 Production Deployment

### Environment Setup
```bash
# Generate secure NEXTAUTH_SECRET
openssl rand -base64 32

# Use PostgreSQL in production
DATABASE_URL="postgresql://user:pass@host:5432/globizs"
NEXTAUTH_URL="https://yourdomain.com"
```

### Build & Run
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel env add DATABASE_URL
vercel deploy
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Reset database
rm dev.db
npm run db:push
npm run db:seed
```

### Authentication Not Working
- Check NEXTAUTH_SECRET is set
- Verify DATABASE_URL is correct
- Ensure user exists in database
- Check NextAuth logs in browser console

### Styling Issues
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart dev server: `npm run dev`

## 📚 Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Future Enhancements

- Email verification
- Two-factor authentication
- Schedule templates
- Recurring schedules
- Team collaboration
- Export to calendar
- Real-time notifications
- Advanced analytics

---

Built with ❤️ using Next.js 15
# globizs-time-keeper


# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="replace-with-a-secure-random-string"

# Session Configuration
SESSION_MAX_AGE=2592000

# SMS OTP Configuration
SMS_API_KEY="replace-with-your-sms-api-key"
SMS_API_ROUTE="replace-with-your-sms-route"
SMS_API_SENDER="replace-with-your-sms-sender"
SMS_API_TEMPLATE_ID="replace-with-your-sms-template-id"
SMS_API_HOSTNAME="replace-with-your-sms-hostname"

# Geocoding Configuration
NOMINATIM_USER_AGENT="Globizs/1.0 (local-development)"
