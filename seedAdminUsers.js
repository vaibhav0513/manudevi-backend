const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const logger = require('./src/config/logger');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/manudevi-db';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  try {
    await connectDB();

    // Super Admin Details
    const superAdminData = {
      first_name: 'Super',
      middle_name: '',
      last_name: 'Admin',
      mobile_no: '9999999999', // Change this to your number
      email: 'superadmin@manudevi.com', // Change this
      address: 'Yaval, Jalgaon, Maharashtra',
      role: 'super_admin', // ← Super Admin Role
      terms_accepted: true,
      isMobileVerified: true,
      isActive: true,
      lastLogin: new Date(),
    };

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      mobile_no: superAdminData.mobile_no 
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists:', existingSuperAdmin.mobile_no);
      
      // Update role if needed
      if (existingSuperAdmin.role !== 'super_admin') {
        existingSuperAdmin.role = 'super_admin';
        await existingSuperAdmin.save();
        console.log('✅ Updated existing user to Super Admin');
      }
    } else {
      // Create new super admin
      const superAdmin = await User.create(superAdminData);
      console.log('✅ Super Admin created successfully!');
      console.log('📱 Mobile:', superAdmin.mobile_no);
      console.log('📧 Email:', superAdmin.email);
      console.log('👤 Role:', superAdmin.role);
    }

    // Also create a regular admin for testing
    const adminData = {
      first_name: 'Admin',
      middle_name: '',
      last_name: 'User',
      mobile_no: '8888888888', // Change this
      email: 'admin@manudevi.com',
      address: 'Yaval, Jalgaon, Maharashtra',
      role: 'admin', // ← Admin Role
      terms_accepted: true,
      isMobileVerified: true,
      isActive: true,
      lastLogin: new Date(),
    };

    const existingAdmin = await User.findOne({ 
      mobile_no: adminData.mobile_no 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.mobile_no);
      
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to Admin');
      }
    } else {
      const admin = await User.create(adminData);
      console.log('✅ Admin created successfully!');
      console.log('📱 Mobile:', admin.mobile_no);
      console.log('📧 Email:', admin.email);
      console.log('👤 Role:', admin.role);
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nYou can now login with:');
    console.log('Super Admin: 9999999999');
    console.log('Admin: 8888888888');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin users:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();