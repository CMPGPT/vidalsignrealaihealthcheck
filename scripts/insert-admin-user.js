const path = require('path');
require('ts-node').register();

// Import dbConnect and AdminUser model
const dbConnect = require(path.join(__dirname, '../lib/dbConnect')).default;
const AdminUser = require(path.join(__dirname, '../models/AdminUser.ts')).default;

async function insertAdminUser() {
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existing = await AdminUser.findOne({ email: 'vidalsign@gmail.com' });
    if (existing) {
      console.log('⚠️ Admin user already exists:', existing.email);
      return;
    }

    const user = await AdminUser.create({
      email: 'vidalsign@gmail.com',
      password: '123456789kkid!@##',
      userType: 'admin',
    });
    console.log('✅ Admin user created:', user.email);
  } catch (err) {
    console.error('❌ Error inserting admin user:', err);
  } finally {
    // Mongoose connection will be closed by dbConnect cache logic if needed
    process.exit(0);
  }
}

insertAdminUser(); 