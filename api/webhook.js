// api/webhook.js
import { urlencoded } from "body-parser";
import { createServer } from "micro";
import { MessagingResponse } from "twilio").twiml;

// micro + body-parser kullanarak POST verisini alıyoruz
const parser = urlencoded({ extended: false });

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  // body-parser ile req.body'yi dolduruyoruz
  await parser(req, res);

  console.log("🔔 Webhook body:", req.body);
  const incoming = req.body.Body || "";

  // TwiML cevabı hazırlıyoruz
  const twiml = new MessagingResponse();
  twiml.message("Gelen mesaj: " + incoming);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  return res.end(twiml.toString());
};

// micro sunucu olarak dışa aktar
export default createServer(handler);
