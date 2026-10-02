# Portfolio, MongoDB + email

1. Create a free cluster at https://cloud.mongodb.com, add a database user, and under Network Access allow your IP.
2. Copy `.env.example` to `.env` and add your MongoDB connection string (keep the database name `portfolio`).
3. `npm install`
4. `npm run seed`   (adds your projects to MongoDB)
5. `npm start`      (open http://localhost:3000)

## Contact form email

The form only reports success after the configured email provider accepts the message.

### Render Free

Render Free web services block outbound SMTP ports `25`, `465`, and `587`. Use Resend's HTTPS API instead:

1. Create a Resend account and verify a domain you control at https://resend.com/domains.
2. Create an API key at https://resend.com/api-keys.
3. Set `RESEND_API_KEY`, `EMAIL_FROM` (for example, `Portfolio <contact@your-verified-domain.com>`), and `MAIL_TO` in the Render service's Environment settings.
4. Deploy the latest code and submit a test inquiry. Check Render logs if delivery fails.

Never commit the API key. The `EMAIL_FROM` address must use the verified domain. Resend is used whenever `RESEND_API_KEY` is set.

### Local Gmail SMTP (optional)

1. Enable 2-Step Verification on the sending Google account.
2. Create a Google App Password for this application. Do not use your normal Google password.
3. Set `SMTP_USER` to the sending Gmail address, `SMTP_PASS` to the App Password, and `MAIL_TO` to `adityagaikwad4434@gmail.com`.
4. Keep `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`.
5. Restart the server and send a test inquiry. If SMTP is unavailable, the form keeps the entered information and displays a direct email link instead of claiming it was sent.

For paid hosts that allow outbound SMTP, add the SMTP variables as private service environment variables. Never commit `.env` or an App Password. `MAIL_TO` defaults to `SMTP_USER` if omitted.

Messages are also saved in Atlas under `portfolio > messages` when MongoDB is connected.
Edit projects in portfolio > projects. Set `published` to true to show one.
Static hosts (GitHub Pages) cannot run this server. Use Render, Railway or similar and set `MONGODB_URI` and the appropriate email provider variables there.
