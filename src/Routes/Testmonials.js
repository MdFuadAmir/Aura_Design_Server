import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
const Testmonials = (app, testmonialCollection, verifyToken) => {
  // Nodemailer Transporter Setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  app.post("/testimonials", async (req, res) => {
    try {
      const review = req.body;

      const doc = {
        name: review.name,
        email: review.email,
        role: review.role,
        text: review.text,
        rating: review.rating,
        image: review.image,
        status: "pending",
        createdAt: new Date(),
      };

      const result = await testmonialCollection.insertOne(doc);

      if (result.insertedId) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: review.email,
          subject: "✨ Thank You for Your Review!",
          html: `
            <div style="font-family: sans-serif; border: 1px solid #10b981; padding: 30px; border-radius: 20px; max-width: 600px; margin: auto;">
              <h2 style="color: #10b981; text-transform: uppercase;">Review Received!</h2>
              <p>Hi <b>${review.name}</b>,</p>
              <p>Thank you for your feedback! Your review is currently under process.</p>
              <hr style="border: 0.5px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: gray;">Regards,<br><b>Md Fuad Amir</b></p>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (mailError) {
          res.status(500).send({
            success: false,
            message:
              "Failed to send verification email. Please try again later.",
            error: mailError.message,
          });
        }
        res.send(result);
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Failed to save data to database",
        error: error.message,
      });
    }
  });

  app.get("/testimonials", async (req, res) => {
    try {
      const result = await testmonialCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch testimonials" });
    }
  });
  app.patch("/testimonials/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: { status: status },
      };
      const result = await testmonialCollection.updateOne(filter, updatedDoc);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to update status" });
    }
  });

  // ৪. রিভিউ ডিলিট করা
  app.delete("/testimonials/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testmonialCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to delete testimonial" });
    }
  });
};

export default Testmonials;
