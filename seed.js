require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const projects = require('./public/projects.json'); // edit projects here, then run: npm run seed

(async () => {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env first.');
  await mongoose.connect(process.env.MONGODB_URI);
  const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
  // $set: running the seed again updates each project to match projects.json
  await Project.bulkWrite(projects.map((p, i) => ({
    updateOne: { filter: { title: p.title }, update: { $set: { ...p, order: i + 1, published: true } }, upsert: true }
  })));
  // remove the old placeholder projects
  await Project.deleteMany({ title: { $in: ['Software project', 'AI project', 'Portfolio website'] } });
  console.log('Seeded', projects.length, 'projects');
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
