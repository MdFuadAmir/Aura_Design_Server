import { ObjectId } from "mongodb";

const Projects = (app, projectsCollection, verifyToken) => {
  app.post("/projects", verifyToken, async (req, res) => {
    const project = req.body;
    const result = await projectsCollection.insertOne(project);
    res.send(result);
  });

  app.get("/projects", async (req, res) => {
    const { category, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const result = await projectsCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.send({ projects: result, total: result.length });
  });

  app.get("/projects/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await projectsCollection.findOne(query);
    res.send(result);
  });

  app.delete("/projects/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await projectsCollection.deleteOne(query);
    res.send(result);
  });

  app.patch("/projects/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { status: status },
    };
    const result = await projectsCollection.updateOne(filter, updateDoc);
    res.send(result);
  });
};

export default Projects;
