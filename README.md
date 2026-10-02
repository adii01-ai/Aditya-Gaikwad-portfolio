# Portfolio, MongoDB + email

1. Create a free cluster at https://cloud.mongodb.com, add a database user, and under Network Access allow your IP.
2. Copy `.env.example` to `.env` and add your MongoDB connection string (keep the database name `portfolio`).
3. `npm install`
4. `npm run seed`   (adds your projects to MongoDB)
5. `npm start`      (open http://localhost:3000)

## Contact form email

The form only reports success after the configured email provider accepts the message.

### Web3Forms over HTTPS

1. Create a Web3Forms access key for the email address that should receive contact inquiries.
2. Set `WEB3FORMS_ACCESS_KEY` and `MAIL_TO=adityagaikwad4434@gmail.com` in the Render service's Environment settings.
3. Deploy the latest code and submit a test inquiry. Check Render logs if delivery fails.

The access key is read only by the server and must never be committed. The server posts submissions to Web3Forms over HTTPS. The visitor's address is used for replies. Web3Forms' optional `ccemail` field is used for `MAIL_TO` and may require a Pro plan.

Messages are also saved in Atlas under `portfolio > messages` when MongoDB is connected.
Edit projects in portfolio > projects. Set `published` to true to show one.
Static hosts (GitHub Pages) cannot run this server. Use Render, Railway or similar and set `MONGODB_URI` and the appropriate email provider variables there.
