import nodemailer from "nodemailer";

const Settings = (app, userCollection, otpCollection, verifyToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // --- Profile Update ---
  app.patch("/users/update-profile/:email", verifyToken, async (req, res) => {
    try {
      const { email } = req.params;
      const { name, phone, photoURL, address } = req.body;

      if (req.decoded.email !== email) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized access" });
      }

      const updateDoc = {
        $set: {
          updatedAt: new Date(),
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(photoURL && { photoURL }),
        },
      };

      const result = await userCollection.updateOne({ email }, updateDoc);
      res.send({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).send({ success: false, message: "Update failed" });
    }
  });

  // --- Get Profile ---
  app.get("/users/profile/:email", verifyToken, async (req, res) => {
    try {
      const { email } = req.params;
      if (req.decoded.email !== email) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized" });
      }
      const userProfile = await userCollection.findOne({ email });
      res.send({ success: true, data: userProfile });
    } catch (error) {
      res.status(500).send({ success: false });
    }
  });

  // ==========================================
  // PASSWORD CHANGE - OTP ROUTES
  // ==========================================

  app.post("/send-password-otp", verifyToken, async (req, res) => {
    try {
      const { email } = req.body;

      if (req.decoded.email !== email) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await otpCollection.updateOne(
        { email },
        {
          $set: {
            otp,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🔒 Security Verification Code",
        html: `
  <div style="background-color: #f9fafb; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
      
      <div style="background-color: #10b981; height: 6px;"></div>
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #ecfdf5; width: 60px; height: 60px; border-radius: 18px; line-height: 60px; display: inline-block; text-align: center;">
            <span style="font-size: 24px;">🔐</span>
          </div>
          <h2 style="color: #064e3b; margin-top: 20px; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Authorization</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Use the code below to secure your account.</p>
        </div>
        <div style="background-color: #f0fdf4; border: 1px dashed #10b981; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px;">
          <span style="display: block; color: #065f46; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your One-Time Password</span>
          <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #047857; font-family: monospace; font-weight: 900;">${otp}</h1>
        </div>
        <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 25px;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            This verification code is valid for <b style="color: #10b981;">5 minutes</b>. 
            For your security, do not share this code with anyone.
          </p>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        <p style="margin: 5px 0 0; font-size: 11px; font-weight: bold; color: #10b981; text-transform: uppercase;">
          Powered by Aura Design Dashboard
        </p>
      </div>
    </div>
  </div>
`,
      };

      await transporter.sendMail(mailOptions);
      res.send({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("OTP Error:", error);
      res.status(500).send({ success: false, message: "Failed to send OTP" });
    }
  });

  app.post("/verify-password-otp", verifyToken, async (req, res) => {
    try {
      const { email, otp } = req.body;
      const record = await otpCollection.findOne({ email });

      if (!record) {
        return res
          .status(400)
          .send({ success: false, message: "OTP not found. Resend again." });
      }

      if (record.otp !== otp) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid OTP code" });
      }

      const now = new Date();
      const diffInMinutes = (now - new Date(record.createdAt)) / 1000 / 60;

      if (diffInMinutes > 5) {
        await otpCollection.deleteOne({ email });
        return res
          .status(400)
          .send({ success: false, message: "OTP expired. Please try again." });
      }

      await otpCollection.deleteOne({ email });

      res.send({ success: true, message: "OTP Verified" });
    } catch (error) {
      res.status(500).send({ success: false, message: "Verification failed" });
    }
  });
};

export default Settings;
