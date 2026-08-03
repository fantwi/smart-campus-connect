# UCC Campus Connect

Smart-campus application for the University of Cape Coast, built with Laravel, React, Vite, and MariaDB.

## Requirements

- PHP 8.3 or newer
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
npm install
npm run build
php artisan serve
```

Open `http://localhost:8000`. Use **Create an account** on the sign-in screen to register the first user.

Email/password accounts are built into the app and require no external identity provider. To optionally enable Google sign-in, create a Google OAuth web client, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and register this callback URL:

```text
http://localhost:8000/auth/google/callback
```

`CHATGPT_SIGN_IN_URL` is intentionally blank by default. Set it only when deploying in an environment that supplies a supported Sign in with ChatGPT flow. The URL must use HTTPS and its host must match `CHATGPT_SIGN_IN_ALLOWED_HOSTS`; subdomains of an allowed host are accepted. If these optional values are blank or invalid, their buttons are not shown.

For local development with hot reload, use `npm run dev` alongside `php artisan serve`.

## Data stored in MariaDB

- Laravel users and sessions
- Student/staff profiles
- Personal timetable entries
- Accessibility, travel, saved-place, and visit preferences
- Campus issue reports and uploaded-photo paths
- AI answer feedback

Uploaded issue photos are stored on Laravel's private `local` disk and are served only through the authenticated, owner-authorized application endpoint.

## Production configuration

Start production deployments from the hardened template rather than the local-development example:

```bash
cp .env.production.example .env
php artisan key:generate
```

Replace every placeholder host, database credential, and mail credential before deployment. Production startup fails closed when debugging is enabled, the application URL is not HTTPS, secure or HTTP-only session cookies are disabled, or the SameSite policy is unsafe. Do not use a database root account for the application.
