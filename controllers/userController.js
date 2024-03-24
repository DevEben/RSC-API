const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateUser, validateUserLogin, validateResetPassword, validateUserForgotPassword, validateUserUpdate, validateUserSubscribe, } = require('../middleware/validator');
const sendEmail = require('../utils/email');
const { generateDynamicEmail } = require('../utils/emailText');
const { resetFunc } = require('../utils/forgot');
require('dotenv').config();
const cloudinary = require("../middleware/cloudinary");
const fs = require('fs');
const path = require('path');


//Function to register a new user
const signUp = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const toTitleCase = (inputText) => {
        return inputText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };
      const userData = {
        businessName: req.body.businessName.trim(),
        email: req.body.email.trim(),
        phoneNumber: req.body.phoneNumber.trim(),
        password: req.body.password.trim(),
        confirmPassword: req.body.confirmPassword.trim(),
      }


      const emailExists = await userModel.findOne({ email: userData.email });
      if (emailExists) {
        return res.status(200).json({
          message: 'Email already exists',
        })
      }

      const businessNameExists = await userModel.findOne({ businessName: toTitleCase(userData.businessName) });
      if (businessNameExists) {
        return res.status(200).json({
          message: 'Business Name already exists',
        })
      }

      const salt = bcrypt.genSaltSync(12)
      const hashpassword = bcrypt.hashSync(userData.password, salt);
      const user = new userModel({
        businessName: toTitleCase(userData.businessName),
        email: userData.email.toLowerCase(),
        phoneNumber: userData.phoneNumber,
        password: hashpassword,
      });


      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }
      const token = jwt.sign({
        businessName: user.businessName,
        email: user.email,
      }, process.env.SECRET, { expiresIn: "300s" });
      user.token = token;
      const subject = 'VERIFY YOUR EMAIL'

      const generateOTP = () => {
        const min = 1000;
        const max = 9999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const otp = generateOTP();

      user.otpCode = otp
      const html = generateDynamicEmail(user.businessName, otp)
      sendEmail({
        email: user.email,
        html,
        subject
      })
      await user.save()
      return res.status(200).json({
        message: 'User business profile created successfully!, Please check your email to verify',
        data: {
          businessName: user.businessName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
          role: user.role,
          id: user._id,
          token: user.token,

        },
      })

    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    })
  }
};



//Function to verify a new user with an OTP
const verify = async (req, res) => {
  try {
    const id = req.params.id;
    //const token = req.params.token;
    const user = await userModel.findById(id);
    const token = user.token;
    const { userInput } = req.body;

    //Check if the otp is still valid
    jwt.verify(token, process.env.SECRET)
    if (user && userInput === user.otpCode) {
      // Update the user if verification is successful
      await userModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });
      res.send("You've been successfully verified, kindly proceed to the login page.");
      setTimeout(() => {
        res.redirect(`${req.protocol}://${req.get("host")}/api/login`)
      }, 5000);
      return;
    } else {
      return res.status(400).json({
        message: "Incorrect OTP, Please check your email for the code"
      })
    }

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: "OTP has expired, please request a new OTP",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error: " + error.message,
      });
    }
  }
};


// Function to resend the OTP incase the user didn't get the OTP
const resendOTP = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);

    const generateOTP = () => {
      const min = 1000;
      const max = 9999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const subject = 'RE-VERIFY YOUR EMAIL'
    const otp = generateOTP();

    user.otpCode = otp
    const html = generateDynamicEmail(user.firstName, otp)
    sendEmail({
      email: user.email,
      html,
      subject
    })
    const token = jwt.sign({
      businessName: user.businessName,
      email: user.email,
    }, process.env.SECRET, { expiresIn: "300s" });
    user.token = token;
    await user.save()
    return res.status(200).json({
      message: "Please check your email for the new OTP"
    })

  } catch (err) {
    return res.status(500).json({
      message: "Internal server error: " + err.message,
    });
  }
};



//Function to login a verified user
const logIn = async (req, res) => {
  try {
    const { error } = validateUserLogin(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const { email, password } = req.body;
      const checkEmail = await userModel.findOne({ email: email.toLowerCase() });
      if (!checkEmail) {
        return res.status(404).json({
          message: 'User not registered'
        });
      }

      const checkPassword = bcrypt.compareSync(password, checkEmail.password);
      if (!checkPassword) {
        return res.status(404).json({
          message: "Password is incorrect"
        })
      }
      const token = jwt.sign({
        userId: checkEmail._id,
        businessName: checkEmail.businessName,
        role: checkEmail.role,
        isSuperAdmin: checkEmail.isSuperAdmin
      }, process.env.SECRET, { expiresIn: "15h" });
      const business = {
        userId: checkEmail._id,
        businessName: checkEmail.businessName, 
        email: checkEmail.email,
        phoneNumber: checkEmail.phoneNumber,
        isVerified: checkEmail.isVerified,
        role: checkEmail.role,
        token: token,
    }

      if (checkEmail.isVerified === true) {
        res.status(200).json({
          message: "Login Successfully! Welcome " + checkEmail.businessName, 
          data: business,
        })
        checkEmail.token = token;
        await checkEmail.save();
      } else {
        res.status(400).json({
          message: "Sorry user not verified yet."
        })
      }
    }

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function for the user incase password is forgotten
const forgotPassword = async (req, res) => {
  try {
    const { error } = validateUserForgotPassword(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const { email } = req.body;
      const checkUser = await userModel.findOne({ email: email.toLowerCase() });
      if (!checkUser) {
        return res.status(404).json({
          message: 'User does not exist'
        });
      }
      else {
        const subject = 'Kindly reset your password'
        const link = `${req.protocol}://${req.get("host")}/api/reset-user/:${checkUser._id}`
        const html = resetFunc(checkUser.businessName, link)
        sendEmail({
          email: checkUser.email,
          html,
          subject
        })
        return res.status(200).json({
          message: "Kindly check your email to reset your password",
        })
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    })
  }
};



//Function to reset the user password
const resetPassword = async (req, res) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const userId = req.params.userId;
      const { password, confirmPassword } = req.body;

      if (!password || !confirmPassword) {
        return res.status(400).json({
          message: "Password cannot be empty",
        });
      }

      const checkUser = await userModel.findById(userId);
      if (!checkUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const checkPassword = bcrypt.compareSync(password, checkUser.password);
      if (checkPassword) {
        return res.status(400).json({
          message: "Can't use previous password!",
        });
      }

      const salt = bcrypt.genSaltSync(12);
      const hashPassword = bcrypt.hashSync(password, salt);

      const reset = await userModel.findByIdAndUpdate(userId, { password: hashPassword }, { new: true });
      res.send("Password changed successfully, kindly proceed to the login page")
      setTimeout(() => {
        res.redirect(`${req.protocol}://${req.get("host")}/api/login`);
      })
      return;
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    })
  }
};



//Function to signOut a user
const signOut = async (req, res) => {
  try {
    const userId = req.params.userId
    const newUser = await userModel.findById(userId)
    if (!newUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    newUser.token = null;
    await newUser.save();
    return res.status(201).json({
      message: `user has been signed out successfully`
    })
  }
  catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    })
  }
}


// Function to upload a Logo image
const uploadLogoToCloudinary = async (logoImg, business) => {
  try {
    if (business.logoImg && business.logoImg.public_id) {
      return await cloudinary.uploader.upload(logoImg.tempFilePath, {
        public_id: business.logoImg.public_id,
        overwrite: true
      });
    } else {
      return await cloudinary.uploader.upload(logoImg.tempFilePath, {
        public_id: `business_logo_${business._id}`,
        folder: "Rapid-Stock-Control"
      });
    }
  } catch (error) {
    throw new Error("Error uploading logo image to Cloudinary: " + error.message);
  }
};

const uploadLogo = async (req, res) => {
  try {
    const id = req.params.id;
    const business = await userModel.findById(id);

    if (!business) {
      return res.status(404).json({
        message: "Business not found in our database"
      });
    }

    // Check if only one file is uploaded
    if (logoImg.length > 1) {
      return res.status(400).json({
        message: "Please upload only one image file",
      });
    }

    if (!req.files || !req.files.logoImg) {
      return res.status(400).json({
        message: 'No logo image provided'
      });
    }

    const logoImg = req.files.logoImg;

    const fileExtension = path.extname(logoImg.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        message: 'Only image files are allowed.'
      });
    }

    let fileUploader;
    try {
      fileUploader = await uploadLogoToCloudinary(logoImg, business);
      await fs.promises.unlink(req.files.logoImg.tempFilePath);
    } catch (uploadError) {
      return res.status(500).json({ message: 'Error uploading logo image' + uploadError });
    }

    if (fileUploader) {
      const logoData = {
        public_id: fileUploader.public_id,
        url: fileUploader.secure_url
      };

      const updatedBusiness = await userModel.findByIdAndUpdate(id, { logoImg: logoData }, { new: true });

      return res.status(200).json({
        message: 'Business logo uploaded successfully',
        business: updatedBusiness.logoImg
      });
    } else {
      return res.status(500).json({ message: 'Failed to upload logo image' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' + error.message });
  }
};


//Function to update a particular business data
const updateBuiness = async (req, res) => {
  try {
    const { error } = validateUserUpdate(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const userId = req.params.userId;

      const business = await userModel.findById(userId)
      if (!business) {
        return res.status(404).json({
          message: 'Business not found',
        })
      }

      const data = {
        firstName: req.body.firstName || business.firstName,
        lastName: req.body.lastName || business.lastName,
        phoneNumber: req.body.phoneNumber || business.phoneNumber,
      }

      const updateBusiness = await userModel.findByIdAndUpdate(userId, data, { new: true })
      if (!updateBusiness) {
        return res.status(400).json({
          message: "Unable to update business data"
        })
      };

      return res.status(200).json({
        message: 'Business data updated successfully',
        data: {
          firstName: updateBusiness.firstName,
          lastName: updateBusiness.lastName,
          phoneNumber: updateBusiness.phoneNumber,
        }
      })
    }

  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error' + error.message
    });
  }
}



//Function to view all business in the database
const viewBuiness = async (req, res) => {
  try {

    const business = await userModel.find().sort({createdAt: -1});
    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      })
    }

    return res.status(200).json({
      message: 'Businesses successfully fetched: ',
      data: business,
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error' + error.message
    });
  }
}



//Function to view a particular business in the database
const viewABuiness = async (req, res) => {
  try {
    const userId = req.params.userId;

    const business = await userModel.findById(userId)
    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      })
    }

    return res.status(200).json({
      message: 'The selected business found: ',
      data: business,
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error' + error.message
    });
  }
}



//Function to delete a particular business in the database
const deleteBuiness = async (req, res) => {
  try {
    const userId = req.params.userId;

    const business = await userModel.findById(userId)
    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      })
    }

    const deleteBusiness = await userModel.findByIdAndDelete(userId)
    if (!deleteBusiness) {
      return res.status(400).json({
        message: "Unable to delete business"
      })
    }

    return res.status(200).json({
      message: 'Business successfully deleted',
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error' + error.message
    });
  }
}



const subscribePlan = async (req, res) => {
  try {
    const { error } = validateUserSubscribe(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message
      })
    } else {
      const userId = req.params.userId;

      const { email } = req.body;

      // Check if user with provided email exists
      const user = await userModel.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.status(404).json({ 
            message: 'User not found.' 
          });
      }

      // Update user's plan to premium
      user.plan = 'premium';
      user.subscriptionDate = new Date();
      await user.save();

      return res.status(200).json({ 
        message: 'Subscription to Premium plan successful.'
      });
    }
  } catch (error) {
      return res.status(500).json({ 
        message: 'Internal server error: ' + error.message, 
      });
  }
};




module.exports = {
  signUp,
  verify,
  resendOTP,
  logIn,
  forgotPassword,
  resetPassword,
  signOut,
  uploadLogo,
  updateBuiness,
  viewBuiness,
  viewABuiness,
  deleteBuiness,
  subscribePlan,

}