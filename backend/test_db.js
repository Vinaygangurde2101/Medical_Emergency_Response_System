const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://vinaygangurde2107_db_user:J4wt0ybZPJIIDch5@mers.ezqq3tr.mongodb.net/mers_sid?appName=mers');
    console.log("Connected");
    const user = new User({ name: 'Test', email: 'test4@test.com', phone: '123', password: 'abc' });
    await user.save();
    console.log("User saved");
    const profile = new Profile({ user: user.id, qrId: '123' });
    await profile.save();
    console.log("Profile saved");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}
run();
