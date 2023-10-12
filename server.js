const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDatabase } = require('./database');


const jwt = require('jsonwebtoken');
const secretKey = 'asdfghjkl';
//------------dummyToken--------------
const dummyUser = { id: 1, username: 'user', password: 'password' };
const dummyToken = jwt.sign(dummyUser, secretKey);
//------------------------------------------------

const authentication = (req, res, next) => {

    if (!dummyToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(dummyToken, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    });     
};


app.use(bodyParser.json());
app.use(cors());


//--------------------------- list of books-----------------------------
let books = [
    {id:1, title:"Animal Farm", author:"George Orwell", publishedDate:"1945-08-17"},
    {id:2, title:"Julius Caesar", author:"William Shakespeare", publishedDate:"1599-09-05"},
    {id:3, title:"The Trial", author:"Franz Kafka", publishedDate:"1925-04-26"}
];

//--------------------------routes---------------------------

app.get('/', function (req, res) {
  res.send('Hello Welcome to CodeVigor')
  })


app.get('/books',authentication, async (req, res) => {
  try {
    const collection = await connectToDatabase();
    const books = await collection.find().toArray();
    res.json(books);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
  });

  app.get('/books/:id', authentication, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await connectToDatabase(); // Connect to the database
      const book = await collection.findOne({ id }); // Find the book by its ID
  
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: 'This Book does not exist' });
      }
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/books', authentication, async (req, res) => {
    try {
      const addBook = req.body;
      const collection = await connectToDatabase(); // Connect to the database
  
      // Generate a new book ID (assuming the IDs are auto-incremented)
      const lastBook = await collection.find().sort({ id: -1 }).limit(1).next();
      const newId = lastBook ? lastBook.id + 1 : 1;
  
      addBook.id = newId;
  
      // Insert the new book into the database
      const result = await collection.insertOne(addBook);
  
      if (result.insertedCount === 1) {
        res.status(201).json(addBook);
      } else {
        res.status(500).json({ message: 'Failed to add a new book' });
      }
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });
  

  app.put('/books/:id', authentication, async (req, res) => {
    try {
      const id = parseInt(req.params.id); // ID of the book to update
      const updatedBook = req.body; // Body info from the frontend
      const collection = await connectToDatabase(); // Connect to the database
  
      const filter = { id }; // Filter by the book's ID
      const update = { $set: updatedBook }; // Set the updated book data
  
      // Find the book with the specified ID and update it
      const result = await collection.updateOne(filter, update);
  
      if (result.modifiedCount === 1) {
        res.json(updatedBook);
      } else {
        res.status(404).json({ message: 'Failed to update book' });
      }
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });
  

  app.delete('/books/:id', authentication, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await connectToDatabase(); // Connect to the database
  
      const filter = { id }; // Filter by the book's ID
  
      // Find the book with the specified ID and delete it
      const result = await collection.deleteOne(filter);
  
      if (result.deletedCount === 1) {
        res.json({ message: 'Book deleted' });
      } else {
        res.status(404).json({ message: 'Book not found' });
      }
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });
  

//-----------------------------------------------------------------------

app.listen(3000)
