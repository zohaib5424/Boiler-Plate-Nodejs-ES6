import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { ObjectID as ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { sendEmail } from '../helpers/sendEmail.js';
import { sendMessage } from '../helpers/sendMessage.js';
import otpModel from '../models/otpModel.js';
import Role from '../models/Role.js';
import twilio from 'twilio';

const saltRounds = 10;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

const sendOtp = async (req, res) => {
  try {
    const { email, phoneno } = req.body;
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log('otp : ', otp);

    if (email) {
      const emailSent = await sendEmail(
        email,
        'OTP for registration',
        `Add This OTP ${otp} to register`
      );
      if (!emailSent) {
        return res.status(404).json({
          success: false,
          message: 'Email Not Valid',
        });
      }
      const otpEntry = new otpModel({
        otp: otp,
        email: email,
      });
      await otpEntry.save();
    }

    if (phoneno) {
      const length = phoneno.toString().length;
      if (length < 6 || length > 12) {
        return res.status(422).json({
          success: false,
          message: 'Number digits should be 6-12',
        });
      }
      const messageSent = await sendMessage(
        phoneno,
        `Add This OTP ${otp} to register`
      );
      if (!messageSent) {
        return res.status(404).json({
          success: false,
          message: 'Number Not Valid',
        });
      }
      const otpEntry = new otpModel({
        otp: otp,
        phoneno: phoneno,
      });
      await otpEntry.save();
    }

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent.',
    });
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      return res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};

const confirmOtp = async (req, res) => {
  try {
    console.log(req.body.otp);
    const otpProfile = await otpModel.findOne({ otp: req.body.otp });
    if (otpProfile) {
      await otpModel.updateOne(
        { otp: req.body.otp },
        {
          $set: { otp: null },
        }
      );
      res.status(200).send({
        success: true,
        otpProfile: otpProfile,
        message: 'OTP Successful, User Can Register',
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Invalid Otp',
      });
    }
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};

const createUser = async (req, res) => {
  try {
    const {
      email,
      phoneno,
      role,
      companyId,
      password,
      firstname,
      lastname,
      address,
    } = req.body;
    if (role === 'driver' && !companyId) {
      throw new Error('Need CompanyId for this.');
    }
    const lowerCaseEmail = email.toLowerCase();
    const existingUser = await userModel.findOne({
      $or: [{ phoneno }, { email: lowerCaseEmail }],
    });
    if (existingUser) {
      if (existingUser.isDeleted) {
        return res.status(200).send({
          success: false,
          message: 'This User is Deleted.',
          data: [],
        });
      } else {
        return res.status(200).send({
          success: false,
          message: 'User Already Exists.',
        });
      }
    } else {
      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new userModel({
        firstname,
        lastname,
        email: lowerCaseEmail,
        address,
        phoneno,
        role,
        profilepic:
          req.files?.length > 0 ? '/src/' + req.files[0].filename : null,
        password: encryptedPassword,
        companyId,
      });
      const savedUser = await newUser.save();
      res.status(200).send({
        success: true,
        message: 'You are now user',
        data: savedUser,
      });
    }
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, phoneno, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ phoneno }, { email }],
    });
    if (user) {
      if (user.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'User not exists',
        });
      }
      if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '2d',
        });
        return res.status(200).json({
          success: true,
          message: 'Correct Details',
          user,
          accessToken,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Error: Email and Pass Dont Match',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'User not exists',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, phoneno } = req.body;
    if (email) {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this Email!',
        });
      }
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const emailSent = await sendEmail(
        email,
        'Reset Password',
        `Reset Password OTP: ${otp}`
      );
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send email',
        });
      }
      user.resetPasswordOtp = otp;
      await user.save();
      return res.status(200).send({
        success: true,
        message: 'Reset Password Email sent',
      });
    } else if (phoneno) {
      const user = await userModel.findOne({ phoneno });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this Phone Number!',
        });
      }
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const messageSent = await sendMessage(
        phoneno,
        `Reset Password OTP: ${otp}`
      );
      if (!messageSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send message',
        });
      }
      user.resetPasswordOtp = otp;
      await user.save();
      return res.status(200).send({
        success: true,
        message: 'Reset Password message sent',
      });
    }
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { resetPasswordOtp } = req.body;
    const user = await userModel.findOne({ resetPasswordOtp });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid OTP',
      });
    } else {
      return res.status(200).json({
        success: true,
        user,
        message: 'OTP Verified. User Can Change The Password',
      });
    }
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    const updatePassword = await userModel.updateOne(
      { resetPasswordOtp: otp },
      {
        $set: {
          resetPasswordOtp: null,
          password: encryptedPassword,
        },
      }
    );
    if (updatePassword?.nModified > 0) {
      return res.status(200).json({
        success: true,
        message: 'Password Updated',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Otp not valid',
      });
    }
  } catch (err) {
    console.log(err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export default {
  sendOtp,
  confirmOtp,
  createUser,
  login,
  forgetPassword,
  verifyOTP,
  resetPassword,
  getRoles,
};
