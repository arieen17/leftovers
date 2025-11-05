const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const signup = async (req, res) => {
  try {
    const { email, password, name, birthday, phone_number, address } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      birthday,
      phone_number, 
      address
    });

    const token = generateToken(user.id);

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        tier: user.tier,
        birthday: user.birthday,
        phone_number: user.phone_number,
        address: user.address
      }
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
    
    const user = await User.findByEmail(email);
    console.log('📋 User found:', user ? `Yes (id: ${user.id})` : 'No');
    console.log('🔑 User password hash:', user?.password);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    console.log('🎉 Login successful, token generated');

    res.json({ 
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        tier: user.tier,
        birthday: user.birthday,
        phone_number: user.phone_number, 
        address: user.address
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { signup, login };