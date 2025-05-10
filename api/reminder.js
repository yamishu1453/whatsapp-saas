// api/reminder.js

import { VercelRequest, VercelResponse } from "@vercel/node";
const { createClient } = require("@supabase/supabase-js");
const { Twilio } = require("twilio");

// 1) Ortam değişkenlerinden değerleri al
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const FROM_WHATSAPP = "whatsapp:+14155238886"; // Twilio Sandbox numaranız

// 2) Fonksiyonun ana gövdesi
export default async (req, res) => {
  try {
    // Şu anki zamandan 50–70 dakika sonrası arasındaki “booked” kayıtları çek
    const now = Date.now();
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "booked")
      .gte("time", new Date(now + 50 * 60 * 1000).toISOString())
      .lte("time", new Date(now + 70 * 60 * 1000).toISOString());

    if (error) throw error;

    // Her randevu için hatırlatma gönder ve status’u güncelle
    for (let appt of data) {
      const when = new Date(appt.time).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      await twilio.messages.create({
        from: FROM_WHATSAPP,
        to: appt.customer,
        body: `⏰ Hatırlatma: ${when} için randevunuz var!`,
      });
      await supabase
        .from("appointments")
        .update({ status: "reminded" })
        .eq("id", appt.id);
    }

    return res.status(200).send(`Sent ${data.length} reminders`);
  } catch (err) {
    console.error("Reminder function error:", err);
    return res.status(500).send("Error sending reminders");
  }
};
