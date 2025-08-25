const express = require('express');
const router = express.Router();

// In-memory user storage (same as in auth.js)
const users = [
  {
    id: '1',
    email: 'doctor@example.com',
    name: 'Dr. Sarah Johnson',
    role: 'doctor',
    specialization: 'Cardiology'
  },
  {
    id: '2',
    email: 'patient@example.com',
    name: 'John Smith',
    role: 'patient',
    age: 35
  }
];

// Get all doctors
router.get('/doctors', (req, res) => {
  try {
    const doctors = users.filter(user => user.role === 'doctor');
    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all patients
router.get('/patients', (req, res) => {
  try {
    const patients = users.filter(user => user.role === 'patient');
    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
