// /api/webhook/stripe

import { db } from "@/server/db";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    console.error("Error constructing Stripe event:", err);
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const credits = Number(session.metadata?.["credits"]);
    const userId = session.client_reference_id;

    if (!userId || !credits) {
      console.error("Missing userId or credits in session metadata");
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 400 },
      );
    }

    await db.stripeTransaction.create({
      data: {
        userId,
        credits,
      },
    });

    await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
    return NextResponse.json(
      { message: "Credits added successfully" },
      { status: 200 },
    );
  }

  return NextResponse.json({ message: "Stripe webhook received" });
}
