import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, password, role, companyName } = req.body;

    // Check if user exists with this email or phone
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: "An account with this email address already exists.",
        });
        return;
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        res.status(409).json({
          success: false,
          message: "An account with this phone number already exists.",
        });
        return;
      }
    }

    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      password,
      role: role || "organizer",
      companyName,
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyName: user.companyName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: "Please provide either an email or phone number to log in.",
      });
      return;
    }

    const query: any = {};
    if (email) query.email = email.toLowerCase();
    else if (phone) query.phone = phone;

    const user = await User.findOne(query).select("+password");

    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your details.",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your details.",
      });
      return;
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyName: user.companyName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = req.body;

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ phone });
    if (!user) {
      // Pre-create user shell if new
      user = new User({
        name: `Guest (${phone.slice(-4)})`,
        phone,
      });
    }

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log(`[OTP Gateway Mock] Sent OTP ${otp} to phone ${phone}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phone}`,
      data: {
        // Returned in development mode for easy testing
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        expiresInSeconds: 300,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp, name } = req.body;

    let user = await User.findOne({ phone }).select("+otpCode +otpExpiresAt");

    // Allow master dev bypass code 123456 in non-production environments
    if (otp === "123456" && process.env.NODE_ENV !== "production") {
      if (!user) {
        user = new User({
          name: name || `Guest (${phone.slice(-4)})`,
          phone,
          isPhoneVerified: true,
        });
      }
    } else {
      if (!user || !user.otpCode || !user.otpExpiresAt) {
        res.status(400).json({
          success: false,
          message: "No pending OTP verification found for this phone number. Please request an OTP code first.",
        });
        return;
      }

      if (new Date() > user.otpExpiresAt) {
        res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
        return;
      }

      if (user.otpCode !== otp) {
        res.status(400).json({
          success: false,
          message: "Invalid OTP code. Please check and try again.",
        });
        return;
      }
    }

    // Mark verified
    user.isPhoneVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    if (name && (!user.name || user.name.startsWith("Guest ("))) {
      user.name = name;
    }
    await user.save();

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        companyName: req.user.companyName,
        avatarUrl: req.user.avatarUrl,
        isPhoneVerified: req.user.isPhoneVerified,
        isEmailVerified: req.user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, email, phone, companyName, avatarUrl } = req.body;
    const user = req.user;

    if (email && email.toLowerCase() !== user.email?.toLowerCase()) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        res.status(400).json({
          success: false,
          message: "This email address is already in use by another account.",
        });
        return;
      }
      user.email = email.toLowerCase();
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });
      if (existingPhone) {
        res.status(400).json({
          success: false,
          message: "This phone number is already registered to another account.",
        });
        return;
      }
      user.phone = phone;
    }

    if (name) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyName: user.companyName,
          avatarUrl: user.avatarUrl,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.password) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: "Current password is required to set a new password.",
        });
        return;
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: "Current password does not match our records.",
        });
        return;
      }
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

