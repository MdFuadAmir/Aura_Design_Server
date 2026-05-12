import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
const Subscriber = (app, subscriberCollection, verifyToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  app.post("/subscribe", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .send({ success: false, message: "Email is required" });
      }
      const isExist = await subscriberCollection.findOne({ email });
      if (isExist) {
        return res
          .status(400)
          .send({ success: false, message: "You are already subscribed!" });
      }
      const doc = {
        email,
        createdAt: new Date(),
      };
      const result = await subscriberCollection.insertOne(doc);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🎉 Welcome to My Creative World!",
        html: `
          <div style="font-family: sans-serif; border: 1px solid #10b981; padding: 30px; border-radius: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #10b981; text-transform: uppercase;">Thanks for Subscribing!</h2>
            <p>Hello,</p>
            <p>Thank you for joining my newsletter. You'll now receive updates about my latest projects, blog posts, and design insights.</p>
            <hr style="border: 0.5px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: gray;">Regards,<br><b>Md Fuad Amir</b></p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.send({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    }
  });

  app.get("/subscribers", verifyToken, async (req, res) => {
    try {
      const result = await subscriberCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch subscribers" });
    }
  });

  app.delete("/subscribers/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await subscriberCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to delete subscriber" });
    }
  });
};

export default Subscriber;

