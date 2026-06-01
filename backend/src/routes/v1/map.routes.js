const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

// Route to fetch the Mappls map token/key securely
// Requires JWT authentication
router.get('/token', authenticate, (req, res) => {
  const token = process.env.MAPPLS_API_KEY || 'arxkjsjvwolfdjwcjgxjnufhwlzhppvfpeca';
  
  res.status(200).json({
    success: true,
    data: {
      token: token,
      expiresIn: 3600 // Cache token on frontend for 1 hour
    }
  });
});

module.exports = router;
