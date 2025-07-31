const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidalsignrealaihealthcheck');

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, default: 'admin', enum: ['admin'] },
  openaiApiKey: { type: String, required: false },
  mistralApiKey: { type: String, required: false },
}, { timestamps: true });

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

async function createAdminUser() {
  try {
    console.log('✅ Connecting to MongoDB...');
    
    // Check if admin user already exists
    const existing = await AdminUser.findOne({ userType: 'admin' });
    if (existing) {
      console.log('⚠️ Admin user already exists:', existing.email);
      console.log('📧 Email:', existing.email);
      console.log('🔑 Password:', existing.password);
      return;
    }

    // Create new admin user with basic password
    const user = await AdminUser.create({
      email: 'admin@vidalsign.com',
      password: 'admin123', // Basic password - no hashing
      userType: 'admin',
      openaiApiKey: '',
      mistralApiKey: ''
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', user.password);
    console.log('👤 User Type:', user.userType);
    
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createAdminUser(); 