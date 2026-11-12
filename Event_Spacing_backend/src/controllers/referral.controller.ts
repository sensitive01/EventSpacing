import { Response, NextFunction } from "express";
import crypto from "crypto";
import { User, IUser } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const REFERRER_BONUS_INR = 1000;
export const REFEREE_BONUS_INR = 500;

/**
 * Generates or returns the existing unique Event Spacing referral code for a user.
 */
export async function ensureUserReferralCode(user: IUser): Promise<string> {
  if (user.referralCode) {
    return user.referralCode;
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const prefix = (user.name || "ES")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 3)
      .padEnd(2, "X");
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidate = `ES${prefix}${suffix}`;

    const clash = await User.exists({ referralCode: candidate });
    if (!clash) {
      user.referralCode = candidate;
      await user.save();
      return candidate;
    }
  }

  const fallback = `ES${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  user.referralCode = fallback;
  await user.save();
  return fallback;
}

/**
 * Shared helper to apply a referral code between a newly referred user and referrer.
 */
export async function applyReferralBetweenUsers(
  referee: IUser,
  rawCode: string
): Promise<{ applied: boolean; message: string; referrerName?: string }> {
  const normalizedCode = rawCode.trim().toUpperCase();
  if (!normalizedCode) {
    return { applied: false, message: "Please enter a valid referral code." };
  }

  if (referee.referredBy) {
    return { applied: false, message: "A referral code has already been applied to your account." };
  }

  const referrer = await User.findOne({ referralCode: normalizedCode });
  if (!referrer) {
    return { applied: false, message: "Referral code not found. Please verify and try again." };
  }

  if (referrer._id.toString() === referee._id.toString()) {
    return { applied: false, message: "You cannot apply your own referral code." };
  }

  referrer.referralCredits = (referrer.referralCredits || 0) + REFERRER_BONUS_INR;
  await referrer.save();

  referee.referredBy = referrer._id;
  referee.referralCredits = (referee.referralCredits || 0) + REFEREE_BONUS_INR;
  await referee.save();

  return {
    applied: true,
    message: `Applied code ${normalizedCode}! You earned ₹${REFEREE_BONUS_INR} referral bonus.`,
    referrerName: referrer.name,
  };
}

/**
 * GET /api/referrals/me
 * Returns logged-in user's or vendor's referral code, wallet credits, and referred accounts.
 */
export const getMyReferrals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const referralCode = await ensureUserReferralCode(req.user);

    const [referredUsers, referredByUser] = await Promise.all([
      User.find({ referredBy: req.user._id })
        .select("name role businessName createdAt")
        .sort({ createdAt: -1 })
        .limit(50),
      req.user.referredBy
        ? User.findById(req.user.referredBy).select("name referralCode")
        : Promise.resolve(null),
    ]);

    res.status(200).json({
      success: true,
      data: {
        referralCode,
        referralCredits: req.user.referralCredits || 0,
        referrerBonus: REFERRER_BONUS_INR,
        refereeBonus: REFEREE_BONUS_INR,
        totalReferred: referredUsers.length,
        hasAppliedReferral: Boolean(req.user.referredBy),
        referredBy: referredByUser
          ? {
              name: referredByUser.name,
              referralCode: referredByUser.referralCode,
            }
          : null,
        referredUsers: referredUsers.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          role: u.role,
          businessName: u.businessName || "",
          rewardEarned: REFERRER_BONUS_INR,
          joinedAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/referrals/apply
 * Applies a friend's / partner's referral code to the current authenticated account.
 */
export const applyReferralCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const code = typeof req.body?.referralCode === "string" ? req.body.referralCode : "";
    const result = await applyReferralBetweenUsers(req.user, code);

    if (!result.applied) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        referralCredits: req.user.referralCredits || 0,
        referrerName: result.referrerName,
      },
    });
  } catch (error) {
    next(error);
  }
};

