const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://jordan:3brFA49FEnRKj58Y@cluster0.0au5gei.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'codevigor';
const collectionName = 'books';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    console.log("Connected to the database.");
    return collection;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

module.exports = { connectToDatabase };
