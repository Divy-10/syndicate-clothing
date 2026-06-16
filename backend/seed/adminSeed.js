const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin',
        email: 'admin@syndycate.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+919999999999',
        gender: 'Male',
        dob: new Date('1990-01-01'),
      });
      console.log('Default admin created: admin@syndycate.com / admin123');
    }
  } catch (error) {
    // Admin already exists or DB not ready, skip silently
  }
};

module.exports = seedAdmin;
