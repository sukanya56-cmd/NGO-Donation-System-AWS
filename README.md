# Sahayata — NGO and donor platform

This version preserves the existing Sahayata homepage, visual theme, hero imagery, quote, journey, about and contact sections, and extends the registration, organization profile, requirement, donor, and admin flows.

## Requirements
- Node.js 20.19+ (or a current Node 22 release)
- npm
- VS Code recommended

## Start the project (Windows)
1. Extract this ZIP.
2. Open the extracted `ngo-domation-system` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. In the first terminal run:
   ```powershell
   cd backend
   npm install
   npm start
   ```
   Leave this terminal running. The API runs at `http://localhost:5000`.
5. Open a second terminal (**Terminal → New Terminal**) and run:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
6. Open the URL Vite prints, normally `http://localhost:5173`.

## Local admin login
- Email: `admin@sahayata.local`
- Password: `Admin@12345`

These are demo-only credentials. Change them in `backend/.env` before any deployment.

## What is connected
- Three pre-approved sample organizations and their sample requirements.
- Organization detail pages with public requirements and progress.
- NGO account creation with unique email, local OTP verification, pending admin approval, login, and a dashboard for adding requirements.
- Donor registration/login, basic donor profile details, donation history, and printable certificate layout.
- Admin approval/rejection, NGO overview, requirement table, and donation records.
- JSON file persistence under `backend/`.

## Demo limitations — read before presenting/deploying
- **OTP:** The local version displays a development OTP on-screen. It does not send email. Real email OTP and password recovery require configuring an email provider and implementing its delivery.
- **Payments:** UPI and cash are demonstration choices only. No real payment is taken, verified, or transferred. Integrate a payment gateway (and server-side verification/webhooks) before accepting money.
- **Receipts/certificates:** These are printable demonstration records, not tax receipts or proof of a real payment.
- **Storage:** JSON files are suitable for a local academic demo, not concurrent production use. Back up the `backend/*.json` data files.
- **Security:** Use HTTPS, change the admin password, add rate limiting and robust session storage, validate uploads server-side, and move to a database before deployment.
- **Images:** NGO registration accepts a small image upload (up to 2 MB) and stores it in the JSON profile as a data URL for local demonstration.

## Data files
The backend creates `ngos.json`, `users.json`, and `otps.json` when it first starts. Existing `donations.json` and `requirements.json` are retained. Do not delete these JSON files if you want to keep the local demo data.
