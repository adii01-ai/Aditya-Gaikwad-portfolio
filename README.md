# Portfolio, MongoDB + email

1. Create a free cluster at https://cloud.mongodb.com, add a database user, and under Network Access allow your IP.
2. Copy `.env.example` to `.env` and add your MongoDB connection string (keep the database name `portfolio`).
3. `npm install`
4. `npm run seed`   (adds your projects to MongoDB)
5. `npm start`      (open http://localhost:3000)

## Contact form email

The form only reports success after the server's SMTP provider accepts the email. For Gmail:

1. Enable 2-Step Verification on the sending Google account.
2. Create a Google App Password for this application. Do not use your normal Google password.
3. Set `SMTP_USER` to the sending Gmail address, `SMTP_PASS` to the App Password, and `MAIL_TO` to `adityagaikwad4434@gmail.com`.
4. Keep `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`.
5. Restart the server and send a test inquiry. If SMTP is unavailable, the form keeps the entered information and displays a direct email link instead of claiming it was sent.

For Render, add these as service environment variables (especially `SMTP_USER`, `SMTP_PASS`, and `MAIL_TO`) and deploy the latest commit. Never commit `.env` or an App Password. `MAIL_TO` defaults to `SMTP_USER` if omitted.

Messages are also saved in Atlas under `portfolio > messages` when MongoDB is connected.
Edit projects in portfolio > projects. Set `published` to true to show one.
Static hosts (GitHub Pages) cannot run this server. Use Render, Railway or similar and set `MONGODB_URI` and the SMTP variables there.
