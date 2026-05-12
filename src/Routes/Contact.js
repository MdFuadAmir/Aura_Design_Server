import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";

const Contact = (app, contactCollection, verifyToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  app.post("/contact", async (req, res) => {
    const contactData = req.body;
    try {
      const result = await contactCollection.insertOne(contactData);

      const mailToOwner = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `🚀 New Project Inquiry: ${contactData.subject}`,
        replyTo: contactData.email,
        html: `
<div style="font-family: sans-serif; border: 1px solid #10b981; padding: 20px; border-radius: 15px;">
  <h2 style="color: #10b981;">New Message from Website</h2>
  <p><strong>Name:</strong> ${contactData.name}</p>
  <p><strong>Email:</strong> ${contactData.email}</p>
  <p><strong>Subject:</strong> ${contactData.subject}</p>
  <p><strong>Message:</strong></p>
  <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981; white-space: pre-wrap;">
    ${contactData.message}
  </div>
</div>
`,
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactData.email,
        subject: "📩 Message Received - Md Fuad Amir",
        html: `
          <div style="font-family: sans-serif; border: 1px solid #10b981; padding: 40px; border-radius: 24px; max-width: 600px; margin: auto; background-color: #ffffff;">
            <h2 style="color: #10b981; text-transform: uppercase; letter-spacing: 2px; font-size: 20px; margin-bottom: 20px;">Inquiry Received</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi <b>${contactData.name}</b>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">Thank you for reaching out! I have received your message regarding <span style="color: #10b981; font-weight: bold;">"${contactData.subject}"</span>.</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">I appreciate your interest. I will review your inquiry and get back to you within <b>24 hours</b>.</p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; line-height: 1.5;">Regards,<br><b style="color: #10b981; font-size: 14px;">Md Fuad Amir</b><br>Web Developer</p>
          </div>
        `,
      };
      await transporter.sendMail(mailToOwner);
      await transporter.sendMail(mailOptions);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  app.get("/inquiries", verifyToken, async (req, res) => {
    try {
      const result = await contactCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  app.patch("/inquiries/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { status: "read" } };
      const result = await contactCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  app.delete("/inquiries/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
      const result = await contactCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  app.post("/inquiries/reply", verifyToken, async (req, res) => {
    const { email, name, replyMessage } = req.body;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Reply to your inquiry - Md Fuad Amir`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #10b981; padding: 30px; border-radius: 15px;">
          <h3 style="color: #10b981;">Hello ${name},</h3>
          <p>${replyMessage}</p>
          <br/>
          <p>Best Regards,<br/><b>Md Fuad Amir</b></p>
        </div>
      `,
    };
    try {
      await transporter.sendMail(mailOptions);
      res.send({ success: true });
    } catch (error) {
      res.status(500).send({ success: false });
    }
  });
};

export default Contact;
