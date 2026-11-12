import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { User, IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Formats a consistent user-facing suspension message when an account is blocked.
 */
export function formatAccountBlockedMessage(blockedReason?: string): string {
  const reason = blockedReason?.trim();
  return reason
    ? `Your account has been suspended by administrator. Reason: ${reason}`
    : "Your account has been suspended by administrator. Please contact support.";
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User session expired or user no longer exists.",
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: formatAccountBlockedMessage(user.blockedReason),
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) {
      req.user = user;
    }
    next();
  } catch {
    // Silently continue for optional auth
    next();
  }
};

