const Pricing = (app, pricingCollection, verifyToken) => {
  app.get("/pricing", async (req, res) => {
    const result = await pricingCollection.find().toArray();
    res.send(result);
  });

  app.put("/pricing-manage", verifyToken, async (req, res) => {
    const updatedPlan = req.body;

    const filter = { planKey: updatedPlan.planKey };

    const updateDoc = {
      $set: {
        title: updatedPlan.title,
        price: updatedPlan.price,
        desc: updatedPlan.desc,
        features: updatedPlan.features,
        isPopular: updatedPlan.isPopular,
      },
    };

    const options = { upsert: true };
    const result = await pricingCollection.updateOne(
      filter,
      updateDoc,
      options,
    );
    res.send(result);
  });
};

export default Pricing;
