import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { MongoClient, ServerApiVersion } from "mongodb";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import Users from "./src/Routes/Users.js";
import getCollections from "./src/Db/Databasr.js";
import verifyToken from "./src/Middleware/VerifyToken.js";
import Settings from "./src/Routes/Settings.js";
import Subscriber from "./src/Routes/Subscriber.js";
import Testmonials from "./src/Routes/Testmonials.js";
import Blogs from "./src/Routes/Blogs.js";
import Projects from "./src/Routes/Projects.js";
import Pricing from "./src/Routes/Pricing.js";
import Contact from "./src/Routes/Contact.js";
import Stats from "./src/Routes/Stats.js";
// ===================== middleware ==================== //
const app = express();
// const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173","https://aura-design-tan.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

// ===================== MongoDB connection setup ==================== //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sldyvva.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const {
      userCollection,
      otpCollection,
      subscriberCollection,
      testmonialCollection,
      blogsCollection,
      projectsCollection,
      prigingCollection,
      contactCollection,
    } = getCollections(client);
    const collections = getCollections(client);

    // ===================== API Routes ==================== //
    Users(app, userCollection, verifyToken);
    Settings(app, userCollection, otpCollection, verifyToken);
    Subscriber(app, subscriberCollection, verifyToken);
    Testmonials(app, testmonialCollection, verifyToken);
    Blogs(app, blogsCollection, verifyToken);
    Projects(app, projectsCollection, verifyToken);
    Pricing(app, prigingCollection, verifyToken);
    Contact(app, contactCollection, verifyToken);
    Stats(app, collections, verifyToken);
    // ===================== MongoDB connection test ================= //
    // await client.connect();
  } catch (error) {
  }
}
run().catch(console.dir);

// ========================= Routes ======================== //
app.get("/", (req, res) => {
  res.send("Aura Design server is running");
});

app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

export default app;
