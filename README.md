# Portfolio + MongoDB

1. Create a free cluster at https://cloud.mongodb.com, add a database user, and under Network Access allow your IP.
2. Copy `.env.example` to `.env` and paste your connection string (keep the database name `portfolio`).
3. `npm install`
4. `npm run seed`   (adds your projects to MongoDB)
5. `npm start`      (open http://localhost:3000)

Messages from the contact form appear in Atlas under portfolio > messages.
Edit projects in portfolio > projects. Set `published` to true to show one.
Static hosts (GitHub Pages) cannot run this server. Use Render, Railway or similar and set MONGODB_URI there.
