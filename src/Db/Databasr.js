// src/DB/Database.js
const getCollections = (client) => {
  const db = client.db("Aura_Design");

  return {
    userCollection: db.collection("user"),
    otpCollection: db.collection("otp"),
    subscriberCollection: db.collection("subscriber"),
    testmonialCollection: db.collection("testmonial"),
    blogsCollection: db.collection("blogs"),
    projectsCollection: db.collection("projects"),
    prigingCollection: db.collection("pricing"),
    contactCollection: db.collection("contact"),
  };
};

export default getCollections;
