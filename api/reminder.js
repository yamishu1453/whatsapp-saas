// api/reminder.js
import { createClient } from "@supabase/supabase-js";
import { json } from "@vercel/node";
import cron from "node-cron"; // eğer gerçekten cron kullanıyorsan, yoksa direkt DB sorgu

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }
  // Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
  );

  // 1. remind tablosundan yapılacakları al
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("scheduled", true);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  // 2. her birine Twilio ile mesaj gönder
  const twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
  for (const r of data) {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${r.phone}`,
      body: r.message,
    });
  }

  return res.status(200).json({ sent: data.length });
}
