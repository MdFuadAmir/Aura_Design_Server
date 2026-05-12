import admin from "firebase-admin";

const verifyToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.decoded = decodedToken;
    next();
  } catch (error) {
    console.error("Token Error:", error);
    return res.status(403).send({ message: "forbidden access" });
  }
};

export default verifyToken;
