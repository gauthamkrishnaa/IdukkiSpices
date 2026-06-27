# Idukki Spices

Responsive ecommerce website for Idukki Spices with a React storefront, Node backend, admin dashboard, Stripe Checkout, OTP login, SendGrid email, and invoice generation.

## Local Development

```bash
npm install
npm run build
npm start
```

Open:

```text
http://127.0.0.1:3000
```

## Environment

Copy `.env.example` to `.env` and fill the required values:

- `PUBLIC_BASE_URL`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `EMAIL_FROM`
- `COMPANY_EMAIL`

## Deploy

This repo includes `render.yaml` for Render deployment with a persistent disk for SQLite data.
