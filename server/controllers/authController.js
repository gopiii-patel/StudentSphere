const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../util/sendEmail");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      college,
      password,
      branch,
      semester,
      year,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !college ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Please fill all required fields",
      });
    }

    const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    message: "Invalid email format",
  });
}

const mobileRegex =
  /^[6-9]\d{9}$/;

if (!mobileRegex.test(mobile)) {
  return res.status(400).json({
    message:
      "Enter valid mobile number",
  });
}

if (password.length < 8) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters",
  });
}

    const emailExists =
      await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message:
          "Email already registered",
      });
    }

    const mobileExists =
      await User.findOne({ mobile });

    if (mobileExists) {
      return res.status(400).json({
        message:
          "Mobile number already registered",
      });
    }

    const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

if (
  !strongPassword.test(password)
) {
  return res.status(400).json({
    message:
      "Password must contain uppercase, lowercase and number",
  });
}

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const otp = Math.floor(
  100000 + Math.random() * 900000
).toString();

const user = await User.create({
  name,
  email,
  mobile,
  college,
  password: hashedPassword,
  branch,
  semester,
  year,

  otp,
  otpExpires:
    new Date(
      Date.now() + 10 * 60 * 1000
    ),

  emailVerified: false,
});

try {
  await sendEmail(
    email,
    "StudentSphere Email Verification",
    `Your OTP is ${otp}`
  );
} catch (err) {
  console.log(err);
}



    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message:
        "Registration successful. Verify OTP sent to your email.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
        year: user.year,
        skills: user.skills,
        bio: user.bio,
        profilePicture:
        user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please fill in all fields",
      });
    }

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        message:
          "Please verify your email first",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const isAdmin =
    user.email === process.env.ADMIN_EMAIL;

    res.status(200).json({
  token,
  user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      college: user.college,
      branch: user.branch,
      semester: user.semester,
      year: user.year,
      skills: user.skills,
      bio: user.bio,
      profilePicture: user.profilePicture,
      role: user.role,
      isAdmin,
    },
  });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isAdmin =
        user.email === process.env.ADMIN_EMAIL;

    res.status(200).json({
        user: {
          ...user.toObject(),
          isAdmin,
        },
      });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PROFILE
const updateUserProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const {
        name,
        mobile,
        college,
        branch,
        semester,
        year,
        skills,
        bio,
        profilePicture,
      } = req.body;

      if (name)
        user.name = name;

      if (mobile)
        user.mobile = mobile;

      if (college)
        user.college = college;

      if (branch !== undefined)
        user.branch = branch;

      if (semester !== undefined)
        user.semester = semester;

      if (year !== undefined)
        user.year = year;

      if (skills !== undefined) {
        user.skills =
          Array.isArray(skills)
            ? skills
            : skills
                .split(",")
                .map((s) =>
                  s.trim()
                )
                .filter(Boolean);
      }

      if (bio !== undefined)
        user.bio = bio;

      if (
        profilePicture !==
        undefined
      )
        user.profilePicture =
          profilePicture;

      const updatedUser =
        await user.save();

      res.status(200).json({
        message:
          "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

// GET USER BY ID
const getUserProfileById =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.status(200).json({
        user,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    user.emailVerified = true;
    user.otp = "";
    user.otpExpires = null;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const isAdmin =
    user.email === process.env.ADMIN_EMAIL;

    return res.status(200).json({
      message: "Email verified successfully",
      token,
      uuser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
        year: user.year,
        skills: user.skills,
        bio: user.bio,
        profilePicture: user.profilePicture,
        role: user.role,
        isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await sendEmail(
      email,
      "StudentSphere OTP",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {

      return res.status(404).json({
        message: "Email not found",
      });

    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOtp = otp;

    user.resetOtpExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    await user.save();

    await sendEmail(
      user.email,
      "StudentSphere Password Reset",
      `Your password reset OTP is ${otp}.`
    );

    res.json({
      message:
        "Password reset OTP sent",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.otp = "";

    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
  getMe,
  updateUserProfile,
  getUserProfileById,
};