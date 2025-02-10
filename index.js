const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 3000;


app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bumjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,

    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const submitAssignmentCollection = client.db('Online-Assignment').collection('Assignment')
const createAssignmentCollection = client.db('Online-Assignment').collection('create_assignment')

app.get('/submitAssignment',async (req , res)=> {
  const cursor =  submitAssignmentCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
app.post('/create-assignment', async (req,res) => {

    const application = req.body;
 const result = await createAssignmentCollection.insertOne(application)
res.send(result)
})

app.put("/updateAssignment/:id", async (req, res) => {
  const { id } = req.params;
  const { obtainedMarks, feedback, status } = req.body;

  try {
    await Assignment.findByIdAndUpdate(id, { obtainedMarks, feedback, status });
    res.json({ message: "Assignment updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error updating assignment" });
  }
});


app.listen(port, () => {

    console.log(`job is waiting at:${port}`);
    
})