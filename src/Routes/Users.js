const Users = (app, userCollection, verifyToken) => {
  app.get("/users/admin/:email", verifyToken, async (req, res) => {
    const email = req.params.email;

    if (email !== req.decoded.email) {
      return res.status(403).send({ message: "forbidden access" });
    }

    const query = { email: email };
    const user = await userCollection.findOne(query);

    let admin = false;
    if (user) {
      admin = user?.role === "admin";
    }
    res.send({ admin });
  });

  app.put("/users", verifyToken, async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = {
      $set: {
        name: user.name,
        email: user.email,
        lastLogin: new Date(),
      },
    };
    const result = await userCollection.updateOne(filter, updateDoc, {
      upsert: true,
    });
    res.send(result);
  });

  app.get("/users", verifyToken, async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
  });
};
export default Users;
