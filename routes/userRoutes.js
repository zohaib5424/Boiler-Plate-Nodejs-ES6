import express from 'express';
import userController from '../controllers/userController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  console.log(token);
  if (!token) {
    res.send('We need a token');
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('You failed to authenticate');
        res.json({ auth: false, message: 'You failed to authenticate' });
      } else {
        req.userId = decoded.id;
        console.log('You are authenticated');
        next();
      }
    });
  }
};

// Route for sending registration OTP
router.post('/sendotp', userController.sendOtp);

// Route for verifying registration OTP
router.post('/confirmotp', userController.confirmOtp);

// Route for registering after verification
router.post('/', userController.createUser);

// Route for logging in
router.post('/login', userController.login);

// Route for getting forget password OTP on email
router.post('/forgetpassword', userController.forgetPassword);

// Route for verifying forget password OTP
router.post('/verifyotp', userController.verifyOTP);

// Route for resetting password
router.post('/resetpassword', userController.resetPassword);

// Route for getting roles
router.get('/roles', userController.getRoles);

router.get('/me', (req, res, next) => {
  return res.status(200).json({
    status: 'success',
    message: 'User Routes',
  });
});

export default router;
