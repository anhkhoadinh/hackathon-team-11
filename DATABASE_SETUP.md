# Database Setup Guide

This guide will help you set up MySQL database for Meeting History feature.

## Option 1: Local MySQL (Development)

### Step 1: Install MySQL

**macOS (using Homebrew):**

```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**

- Download MySQL from <https://dev.mysql.com/downloads/installer/>
- Run installer and follow wizard

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE meeting_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional - for security)
CREATE USER 'meetingai'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON meeting_ai.* TO 'meetingai'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### Step 3: Configure Environment Variables

Add to your `.env.local` file:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# API Base URL
API_BASE_URL=http://localhost:3002/api

# Database URL
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:your_password@localhost:3306/meeting_ai"

# Or if you created a dedicated user:
# DATABASE_URL="mysql://meetingai:your_password@localhost:3306/meeting_ai"
```

### Step 4: Run Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

---

## Option 2: PlanetScale (Free Cloud MySQL)

PlanetScale offers a free MySQL database (5GB storage, 1 billion row reads/month).

### Step 1: Sign up

1. Go to <https://planetscale.com/>
2. Sign up with GitHub
3. Create new database: `meeting-ai`

### Step 2: Get Connection String

1. Click on your database
2. Go to "Connect"
3. Select "Prisma"
4. Copy the DATABASE_URL

### Step 3: Configure Environment

Add to `.env.local`:

```env
DATABASE_URL="mysql://..."  # Paste from PlanetScale
```

### Step 4: Run Migration

```bash
npx prisma generate
npx prisma db push  # Use db push for PlanetScale (they don't support migrations)
```

---

## Option 3: Railway (Free with GitHub)

Railway offers free MySQL hosting (5GB storage, 500MB RAM).

### Step 1: Sign up

1. Go to <https://railway.app/>
2. Sign in with GitHub
3. Create new project
4. Add MySQL service

### Step 2: Get Connection String

1. Click on MySQL service
2. Go to "Variables"
3. Copy `DATABASE_URL`

### Step 3: Configure Environment

Add to `.env.local`:

```env
DATABASE_URL="mysql://..."  # Paste from Railway
```

### Step 4: Run Migration

```bash
npx prisma generate
npx prisma migrate deploy
```

---

## Verification

After setup, verify your database:

```bash
# Check if Prisma can connect
npx prisma db pull

# Open Prisma Studio to browse data
npx prisma studio
# Opens at http://localhost:5555
```

You should see the `meetings` table created.

---

## Troubleshooting

### "Can't reach database server"

- Check if MySQL is running: `brew services list` (macOS)
- Verify DATABASE_URL in .env.local
- Check firewall settings

### "Access denied for user"

- Verify username and password in DATABASE_URL
- Make sure user has permissions on the database

### "Unknown database"

- Create the database: `CREATE DATABASE meeting_ai;`

### Prisma Client errors

- Regenerate client: `npx prisma generate`
- Check schema.prisma for syntax errors

---

## Next Steps

Once database is set up:

1. Restart your Next.js dev server: `npm run dev`
2. The app will now save all meetings to database
3. Visit `/history` to see your meeting history

---

## Database Schema

```
meetings table:
?? id (UUID) - Primary key
?? title (VARCHAR) - Meeting title
?? meeting_date (DATETIME) - When meeting happened
?? duration (INT) - Duration in seconds
?? transcript (TEXT) - Full transcript
?? summary (JSON) - Array of summary points
?? action_items (JSON) - Array of action items
?? key_decisions (JSON) - Array of decisions
?? participants (JSON) - Array of participant names
?? source (VARCHAR) - 'upload' or 'extension'
?? file_name (VARCHAR) - Original file name
?? file_size (INT) - File size in bytes
?? estimated_cost (FLOAT) - API cost
?? created_at (DATETIME) - When record was created
?? updated_at (DATETIME) - Last update time
```

Indexes on: meeting_date, source, created_at for fast queries.
