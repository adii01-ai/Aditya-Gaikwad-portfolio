# Portfolio, MongoDB + email

1. Create a free cluster at https://cloud.mongodb.com, add a database user, and under Network Access allow your IP.
2. Copy `.env.example` to `.env` and add your MongoDB connection string (keep the database name `portfolio`).
3. `npm install`
4. `npm run seed`   (adds your projects to MongoDB)
5. `npm start`      (open http://localhost:3000)

## Contact form email

1. Create a Web3Forms access key for the email address that should receive contact inquiries.
2. Set the key in `public/js/config.js`. Web3Forms keys are intended for client-side use; do not place MongoDB or CallMeBot credentials in public files.
3. Deploy the latest code and submit a test inquiry. Email is sent from the browser to Web3Forms over HTTPS.

The form sends to Web3Forms only after the portfolio server accepts the inquiry for validation, MongoDB saving, and WhatsApp notification. The visitor's email is used for replies.

Messages are also saved in Atlas under `portfolio > messages` when MongoDB is connected.
Edit projects in portfolio > projects. Set `published` to true to show one.
Static hosts (GitHub Pages) cannot run this server. Use Render, Railway or similar and set `MONGODB_URI` and the optional WhatsApp variables there.
