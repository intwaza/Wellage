# Wellage — Smart District Management

A frontend MVP for managing residential estates in Rwanda.

## Project Structure

```
wellage/
├── index.html        # Main app (auth + dashboard shell)
├── css/
│   └── styles.css    # All styles with light/dark theme tokens
├── js/
│   └── app.js        # All logic: auth, navigation, modals, toasts
└── README.md
```

## Features

- **Auth** — Login and signup with role selector (Resident, Security, Admin)
- **Overview** — Stats dashboard with payment summary and activity log
- **Payments** — Payment records table with search, filter, and record modal
- **Visitors** — Live check-in form and visitor logbook
- **Notices** — Community announcement board
- **Residents** — Resident directory

## Theme

Light/dark mode toggle using CSS custom properties (`data-theme` on `<html>`).

## Running

No build step needed. Just open `index.html` in a browser, or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server 3000
```

## Next Steps

- Connect auth to a real backend (Node/Express or ASP.NET Core)
- Add a database for payments, visitors, residents (PostgreSQL recommended)
- Integrate MTN/Airtel Mobile Money API for payment verification
- Generate real QR codes for visitor guest passes
