const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    if (User.findByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = User.create({
      email,
      password: hashedPassword,
      name
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    console.log('📋 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    console.log('🔑 Checking password...');
    const isPasswordValid = await User.verifyPassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('🎉 Login successful for:', user.email);
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { signup, login };