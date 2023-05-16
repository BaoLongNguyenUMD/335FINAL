const http = require('http');
const path = require('path');
const express = require('express');

const { MongoClient, ServerApiVersion } = require('mongodb');
const { table } = require('console');

const uri = 'mongodb+srv://nbibby01:hz7cGwWUgY6BwapT@cluster0.bquacre.mongodb.net/?retryWrites=true&w=majority';
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
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const db = client.db("Project0")
const coll = db.collection("Cluster0")

let app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, '/')));
app.set("views", path.join(__dirname, '/'));

const portNumber = 8000
const httpSuccessStatus = 200
const webServer = http.createServer(app).listen(portNumber)

console.log(`Web server is running at http://localhost:${portNumber}`);

app.get("/", async (request, response) => {

    let res = await fetch('https://api.weatherapi.com/v1/current.json?q=20742&lang=en&key=440090572db74e3e99c194417231605')
    const weatherResponse = await res.json()

    weather = {
        text: await weatherResponse.current.condition.text,
        icon: await weatherResponse.current.condition.icon.substring(2),
        temp: `${await weatherResponse.current.temp_f}°F`,
        feelsLike: `${await weatherResponse.current.feelslike_f}°F` 
    }

    let taskArr
    try {
        await client.connect();
        taskArr = await coll.find()
        
    } finally {
        tasks = await taskArr.toArray();
    }
    let table = ""
    tasks.forEach(task => {
        table += `<tr><td>${task.name}</td><td>${task.date}</td><td>${task.notes}</td></tr>`
    })

    vars = {
        tasks: table,
        weather: weather
    }

    response.render('tasks.ejs', vars)
})

app.get("/createTask/", (request, response) => {

    response.sendFile(path.join(__dirname, 'taskForm.html'))
})

app.post("/processTask", (request, response) => {
    let task = {
        name: request.body.taskName, 
        date: request.body.taskDate,
        notes: request.body.taskNotes
    }
    coll.insertOne(task)
    response.sendFile(path.join(__dirname, 'taskForm.html'))
})

app.get("/deleteAllTasks/", (request, response) => {
    coll.deleteMany()

    response.redirect("/")
})