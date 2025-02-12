const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bumjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const submitAssignmentCollection = client.db('Online-Assignment').collection('Assignment');
const createAssignmentCollection = client.db('Online-Assignment').collection('create_assignment');

// GET all assignments
app.get("/assignments", async (req, res) => {
  try {
    const assignments = await createAssignmentCollection.find().toArray();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching assignments" });
  }
});

// GET a single assignment by ID
app.get("/assignments/:id", async (req, res) => {
  const assignmentId = req.params.id;
  if (!ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ success: false, message: "Invalid assignment ID" });
  }
  try {
    const assignment = await createAssignmentCollection.findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ success: false, message: "Error fetching assignment", error });
  }
});

// POST to create an assignment
app.post('/create-assignment', async (req, res) => {
  const application = req.body;
  try {
    const result = await createAssignmentCollection.insertOne(application);
    res.status(201).json({ success: true, assignmentId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating assignment", error });
  }
});

// DELETE an assignment
app.delete("/assignments/:id", async (req, res) => {
  const assignmentId = req.params.id;
  const userEmail = req.query.email;
  try {
    const assignment = await createAssignmentCollection.findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    if (assignment.createdBy.email !== userEmail) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own assignments" });
    }
    await createAssignmentCollection.deleteOne({ _id: new ObjectId(assignmentId) });
    res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

// PUT to update an assignment
app.put("/updateAssignment/:id", async (req, res) => {
  const { id } = req.params;
  const { title, marks, thumbnail, difficulty } = req.body;
  const userEmail = req.query.email;
  try {
    const assignment = await createAssignmentCollection.findOne({ _id: new ObjectId(id) });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    if (assignment.createdBy.email !== userEmail) {
      return res.status(403).json({ success: false, message: "You can only update your own assignments" });
    }
    await createAssignmentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, marks, thumbnail, difficulty } }
    );
    res.status(200).json({ success: true, message: "Assignment updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating assignment", error });
  }
});

// POST Method for submitting an assignment (submission)
app.post("/submit-assignment", async (req, res) => {
  const submissionData = req.body;

  // Validate required fields
  if (!submissionData.assignmentId || !submissionData.docsLink || !submissionData.submittedBy?.email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Set default status if not provided
  submissionData.status = "pending";

  try {
    // Create or use a separate collection for submissions
    const submissionsCollection = client.db('Online-Assignment').collection('assignment_submissions');
    const result = await submissionsCollection.insertOne(submissionData);
    res.status(201).json({ success: true, submissionId: result.insertedId });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ success: false, message: "Error submitting assignment", error });
  }
});


    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Optionally close the connection if desired
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
