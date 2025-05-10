// 1) Gerekli kütüphaneler
const express = require("express");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;
const { createClient } = require("@supabase/supabase-js");

// 2) Supabase istemcisi
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// 3) Express ayarları
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// 4) Webhook endpoint’i
app.post("/api/webhook", async (req, res) => {
  console.log("🔔 Webhook body:", req.body);

  const incoming = (req.body.Body || "").trim(); // Gelen mesaj
  const msg = incoming.toLowerCase(); // Küçük harfe çevir
  const twiml = new MessagingResponse();

  if (msg.startsWith("!randevu")) {
    // Komutu parçala: "!randevu 2025-06-10 15:30"
    const parts = incoming.split(" ");
    const datePart = parts[1]; // "2025-06-10"
    const timePart = parts[2]; // "15:30"
    const isoString = `${datePart}T${timePart}`; // "2025-06-10T15:30"
    const datetime = new Date(isoString);

    // 5) Supabase’e kaydet
    const { error } = await supabase.from("appointments").insert([
      {
        customer: req.body.From,
        time: datetime,
        status: "booked",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      twiml.message("Üzgünüm, randevunuzu kaydederken bir sorun oldu.");
    } else {
      twiml.message(`Randevunuz ${datePart} ${timePart} olarak kaydedildi.`);
    }
  } else {
    // !randevu komutu değilse
    twiml.message(
      "Merhaba! Randevu almak için “!randevu YYYY-AA-GG SS:DD” formatında yazın.",
    );
  }

  // 6) Twilio’ya yanıtı gönder
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

// 7) Sunucuyu başlat
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server ${port} portunda çalışıyor`));
