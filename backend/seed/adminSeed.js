const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    let admin = await User.findOne({ email: 'admin@syndycate.com' });
    if (!admin) {
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
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('Default admin password/role ensured: admin@syndycate.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;
