import { User as User } from "../Models/user.js";

export const requirePro = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus cancelAtPeriodEnd currentPeriodEnd"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const activeStates = ["active", "trialing"];
    const isPro =
      user.plan === "pro" &&
      activeStates.includes(user.subscriptionStatus) &&
      (!user.cancelAtPeriodEnd ||
        (user.currentPeriodEnd && new Date() < user.currentPeriodEnd));

    if (!isPro) {
      return res
        .status(403)
        .json({ error: "This feature requires a Pro subscription" });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Could not verify subscription" });
  }
};