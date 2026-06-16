const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/syndycate-clothing';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    users.forEach(u => {
      console.log(`User: ${u._id} - ${u.email} - DOB: ${u.dob} (Type: ${typeof u.dob})`);
      if (u.dob) {
        try {
          const d = new Date(u.dob);
          console.log(`  Valid Date object: ${d.toISOString()}`);
        } catch (err) {
          console.log(`  ERROR converting DOB:`, err.message);
        }
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
