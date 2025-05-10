// api/webhook.js
import { json } from "@vercel/node"; // veya next/server
import { MessagingResponse } from "twilio/lib/twiml/VoiceResponse.js";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const twiml = new MessagingResponse();
  const body = req.body.Body?.toLowerCase().trim();

  // ... isteği işle
  // örneğin supabase'e kayıt vs.

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twiml.toString());
}
