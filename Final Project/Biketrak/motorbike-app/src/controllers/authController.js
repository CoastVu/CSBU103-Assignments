const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email và password bắt buộc' });

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'Email đã tồn tại' });

    const user = new User({ username, email: normalizedEmail, password });
    await user.save();
    console.log('User created:', user._id);
    return res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === 11000) return res.status(409).json({ error: 'Email đã tồn tại' });
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email và password bắt buộc' });

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};