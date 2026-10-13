import stripe from "../Utils/stripe.js";
import { Users as User} from "../Models/user.js";
import { WebhookEvent } from "../Models/WebhookEvent.js";

const PRICE_MAP = {
  monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { billingCycle } = req.body;

    if (!billingCycle || !PRICE_MAP[billingCycle]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const priceId = PRICE_MAP[billingCycle];

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?checkout=canceled`,
      client_reference_id: user._id.toString(),
      metadata: { userId: user._id.toString() },
      subscription_data: {
        metadata: { userId: user._id.toString() },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    res.status(500).json({ error: "Could not create checkout session" });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus currentPeriodEnd cancelAtPeriodEnd"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      plan: user.plan,
      status: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch subscription status" });
  }
};

export const createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: "No billing account found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/profile`,
    });

    res.json({ url: portalSession.url });
  } catch (err) {
    console.error("Portal session error:", err.message);
    res.status(500).json({ error: "Could not create billing portal session" });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const alreadyProcessed = await WebhookEvent.findOne({
    stripeEventId: event.id,
  });
  if (alreadyProcessed) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.customer && session.client_reference_id) {
          await User.findByIdAndUpdate(session.client_reference_id, {
            stripeCustomerId: session.customer,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan =
          subscription.status === "active" || subscription.status === "trialing"
            ? "pro"
            : "free";

        const update = {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          priceId,
          plan,
        };

        if (userId) {
          await User.findByIdAndUpdate(userId, update);
        } else {
          await User.findOneAndUpdate(
            { stripeCustomerId: subscription.customer },
            update
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const update = {
          subscriptionStatus: "canceled",
          plan: "free",
          cancelAtPeriodEnd: false,
        };

        if (userId) {
          await User.findByIdAndUpdate(userId, update);
        } else {
          await User.findOneAndUpdate(
            { stripeCustomerId: subscription.customer },
            update
          );
        }
        break;
      }

      case "invoice.paid": {
        console.log("Invoice paid:", event.data.object.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.customer) {
          await User.findOneAndUpdate(
            { stripeCustomerId: invoice.customer },
            { subscriptionStatus: "past_due" }
          );
        }
        break;
      }

      default:
        break;
    }

    await WebhookEvent.create({ stripeEventId: event.id, type: event.type });
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};