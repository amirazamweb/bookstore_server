const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const { signupController, loginController, profileImageController } = require('../controllers/authController');
const { isLogin, isAdmin } = require('../middlewares/authMiddleware');

// signup ||post
router.post('/signup', formidable(), signupController)

// login || post
router.post('/login', loginController);

// profile image || get
router.get('/profile-image/:uID', profileImageController);

// user protected route
router.get('/user', isLogin, (req, res) => {
    res.send({ ok: true })
})

// admin protected route
router.get('/admin', isLogin, isAdmin, (req, res) => {
    res.send({ ok: true })
})

module.exports = router;