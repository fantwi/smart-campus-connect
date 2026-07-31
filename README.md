# UCC Campus Connect

Smart-campus application for the University of Cape Coast, built with Laravel, React, Vite, and MariaDB.

## Requirements

- PHP 8.2 or newer
- Composer
- Node.js 20 or newer
- MariaDB 10.6 or newer

## Setup

```bash
cp .env.example .env
composer install
php artisan key:generate
```

Create a MariaDB database named `smart_campus`, update the `DB_*` values in `.env`, then run:

```bash
php artisan migrate
php artisan storage:link
npm install
npm run build
php artisan serve
```

Open `http://localhost:8000`. Use **Create an account** on the sign-in screen to register the first user.

Email/password accounts are built into the app and require no external identity provider. To optionally enable Google sign-in, create a Google OAuth web client, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and register this callback URL:

```text
http://localhost:8000/auth/google/callback
```

`CHATGPT_SIGN_IN_URL` is intentionally blank by default. Set it only when deploying in an environment that supplies a supported Sign in with ChatGPT flow. If these optional values are blank, their buttons are not shown.

For local development with hot reload, use `npm run dev` alongside `php artisan serve`.

## Data stored in MariaDB

- Laravel users and sessions
- Student/staff profiles
- Personal timetable entries
- Accessibility, travel, saved-place, and visit preferences
- Campus issue reports and uploaded-photo paths
- AI answer feedback

Uploaded issue photos are stored on Laravel's `public` disk. Run `php artisan storage:link` once so they can be served from the web.
