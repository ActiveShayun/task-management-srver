require('dotenv').config()
const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors([
    {
        origin: [
            'https://taskauth-93fc6.web.app/',
        ],
        credentials: true
    }
]))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlnwpku.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const usersCollection = client.db('taskDB').collection('users')
        const taskCollection = client.db('taskDB').collection('allTask')

        app.post('/users', async (req, res) => {
            const user = req.body;
            const userEmail = user.email;
            const query = { email: userEmail };
            const userExit = await usersCollection.findOne(query);

            if (userExit) {
                return res.send({ message: 'User already exists' })
            }

            // UTC টাইমস্ট্যাম্প সংরক্ষণ করা হচ্ছে
            const newUser = {
                ...user,
                createdAt: new Date().toISOString() //  ISO 8601 UTC ফরম্যাট
            };
            const result = await usersCollection.insertOne(newUser);
            res.send(result)
        })

        app.post('/addTask', async (req, res) => {
            const task = req.body;
            const newTask = {
                ...task,
                createdAt: new Date().toISOString() //  ISO 8601 UTC ফরম্যাট
            };
            const result = await taskCollection.insertOne(newTask);
            res.send(result)
        })

        app.get('/allTask/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/taskDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/updateCategory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    taskCategory: 'inprogress'
                }
            }
            const result = await taskCollection.updateOne(query, updateDoc);
            res.send(result)
        })

        app.patch('/updateDone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    taskCategory: 'done'
                }
            }
            const result = await taskCollection.updateOne(query, updateDoc);
            res.send(result)
        })

        app.put('/editTask/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const task = req.body
            console.log(task);
            const updateDoc = {
                $set: {
                    email: task.email,
                    taskTitle: task.taskTitle,
                    tasDescription: task.tasDescription,
                    taskCategory: task.taskCategory,
                    createdAt: new Date().toISOString()
                }
            }
            const result = await taskCollection.updateOne(query, updateDoc);
            res.send(result)
        })

        app.get('/singleTask/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.findOne(query)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('task server is running')
})

app.listen(port, () => {
    console.log(`task server ins running on port ${port}`);
})