const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('📝 Signup attempt for:', email);
    console.log('🔑 Original password:', password);
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Hashed password:', hashedPassword);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    console.log('✅ User created with hash:', user.password);
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier }
    });
  } catch (error) {
    console.error('💥 Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    console.log('📋 User found:', user ? `Yes (id: ${user.id})` : 'No');
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('🔑 Stored hash:', user.password);
    console.log('🔑 Provided password:', password);
    
    // Check password
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