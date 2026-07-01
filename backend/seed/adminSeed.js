const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    let admin = await User.findOne({ email: 'admin@syndycate.com' }).select('+password');
    if (!admin) {
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
    } else {
      const isMatch = await bcrypt.compare('admin123', admin.password);
      if (!isMatch || admin.role !== 'admin') {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        admin.role = 'admin';
        await admin.save();
        console.log('Default admin password/role updated/ensured: admin@syndycate.com / admin123');
      } else {
        console.log('Default admin already exists and is valid.');
      }
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;
