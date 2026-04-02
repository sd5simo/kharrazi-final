# 🚗 AutoFlex Admin — Internal Car Rental ERP/CRM

A production-grade admin-only management platform for a car rental agency.
Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, Recharts & Zustand.

---

## ⚡ Quick Start (5 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Initialize Shadcn UI (first time only)
```bash
npx shadcn@latest init
# Choose: Dark theme | CSS variables: yes | tailwind.config.ts

npx shadcn@latest add button card badge table tabs dialog \
  dropdown-menu avatar separator tooltip input label \
  select popover calendar form sheet
```

### 3. Setup the database
```bash
npx prisma db push
npm run db:seed
```

### 4. Start the dev server
```bash
npm run dev
```

### 5. Open in browser
```
http://localhost:3000
```
→ Auto-redirects to the Statistics Dashboard

---

## 📁 Platform Sections

| URL | Feature |
|-----|---------|
| `/dashboard/statistiques` | Financial stats dashboard with charts |
| `/clients/liste` | Client CRM with search & blacklist toggle |
| `/clients/liste-noire` | Global blacklist management |
| `/reservations/liste` | Reservation tracking |
| `/reservations/nouveau` | New reservation form |
| `/locations/liste` | Active & completed rentals |
| `/locations/nouveau` | **New rental + live PDF contract generator** |
| `/vehicules/liste` | Fleet with oil change & inspection alerts |
| `/vehicules/nouveau` | Add vehicle + damage log diagram |
| `/comptabilite/revenus` | Revenue analytics with bar charts |
| `/comptabilite/charges` | Expense tracker by category |
| `/moderation/infractions` | Infraction & dispute management |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Brand Green | `#22c55e` |
| Brand Orange | `#f97316` |
| Background | `#0d1117` |
| Surface Card | `#161b22` |
| Border | `#21262d` / `#30363d` |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables dark theme
- **Components**: Shadcn UI (Radix UI)
- **State**: Zustand
- **Database**: Prisma ORM + SQLite
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF**: Native browser `window.print()` with styled HTML preview
  (upgrade to `@react-pdf/renderer` for server-side PDF generation)

---

## 📦 Database Commands

```bash
npm run db:push     # Sync schema to SQLite
npm run db:seed     # Load demo data (clients, vehicles, rentals)
npm run db:studio   # Open Prisma Studio GUI
```

---

## 🔑 Key Features

### ✅ Global Blacklist
- Toggle any client's blacklist status with a reason
- Blacklisted clients shown with red indicators throughout the platform
- Prevention warning on new reservation/rental forms

### ✅ Vehicle Alert System
- **Oil change warning**: when within 2,000 km of due mileage
- **Technical inspection**: 30 days before expiry / expired
- **Insurance expiry**: 30 days warning
- **Vignette expiry**: 30 days warning

### ✅ Damage Log
- Per-vehicle damage tracking with zone (Front/Rear/Left/Right/Top/Interior)
- Severity levels (Minor/Moderate/Severe)
- Repair status tracking

### ✅ PDF Contract Generator
- Live preview in the `/locations/nouveau` page
- Includes: Agency header, Client info, Vehicle info, Rental terms
- **État des lieux** section with damage zones and signature lines
- Print/PDF download via `window.print()`

### ✅ Financial Dashboard
- Total revenue, expenses, net profit metrics
- Monthly breakdown cards with green/orange badge system
- "Performance positive!" banner
- Area chart + Net bar chart (Recharts)

---

## 🚀 Production Upgrade Path

1. **Authentication**: Add NextAuth.js with credentials provider
2. **Real PDF**: Replace print preview with `@react-pdf/renderer` server action
3. **Database**: Change `prisma/schema.prisma` datasource to PostgreSQL for production
4. **File uploads**: Add Cloudinary or S3 for vehicle images & receipt scans
5. **Email**: Add Resend for contract email delivery

---

## 📝 License

Internal tool — AutoFlex Car Rental Agency
