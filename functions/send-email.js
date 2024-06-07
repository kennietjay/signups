const { handler } = require("@netlify/functions");
const express = require("express");
const resend = require("resend");

const app = express();
app.use(express.json());

// Configure the Resend client
const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = new resend.Resend(resendApiKey);

app.post("/send-email", async (req, res) => {
  const { recipientEmail, subject, htmlContent } = req.body;

  try {
    const response = await resendClient.emails.send({
      from: "Sababu Fund <NoReply@sababufund.org>",
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    res
      .status(200)
      .json({ message: "Email sent successfully", data: response });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

// Export the function handler
exports.handler = handler(app);
