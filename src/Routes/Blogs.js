import { ObjectId } from "mongodb";
const Blogs = (app, blogsCollection, verifyToken) => {
  app.post("/blogs", verifyToken, async (req, res) => {
    try {
      const blogData = req.body;
      const finalBlog = {
        title: blogData.title,
        slug: blogData.slug,
        subtitle: blogData.subtitle,
        excerpt: blogData.excerpt,
        blogImage: blogData.blogImage,
        category: blogData.category,
        tags: blogData.tags,
        author: blogData.author,
        authorRole: blogData.authorRole,
        readTime: blogData.readTime,
        status: blogData.status || "published",
        content: blogData.content,
        createdAt: blogData.createdAt || new Date(),
      };

      const result = await blogsCollection.insertOne(finalBlog);
      res.status(201).send(result);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error", error: error.message });
    }
  });

  app.get("/blogs", async (req, res) => {
    try {
      const result = await blogsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Error fetching blogs" });
    }
  });

  app.get("/blogs/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);

      if (!result) {
        return res.status(404).send({ message: "Blog not found" });
      }
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Error fetching blog detail" });
    }
  });

  app.delete("/blogs/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Error deleting blog" });
    }
  });

  app.patch("/blogs/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: status },
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Error updating status" });
    }
  });
};

export default Blogs;
