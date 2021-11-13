const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cmkkz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// app.use(bodyParser.urlencoded({ extended: true }));


client.connect((err) => {
  const productsCollection = client.db("toyHeaven").collection("product");
  const ordersCollection = client.db("toyHeaven").collection("orders");
  const usersCollection = client.db("toyHeaven").collection("users");
  const reviewsCollection = client.db("toyHeaven").collection("reviews");

  //  make route and get data
  app.get("/products", (req, res) => {
    productsCollection.find({}).toArray((err, results) => {
      res.send(results);
    });
  });


  //  user review data
  app.get("/add-review", (req, res) => {
    reviewsCollection.find({}).toArray((err, results) => {
      res.send(results);
    });
  });

  // get single product

  app.get("/singleProduct/:id", (req, res) => {
    console.log(req.params.id);
    productsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, results) => {
        res.send(results[0]);
      });
  });

  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
})

  // Add a Product

  app.post("/add-product", (req, res) => {
    console.log(req.body);
    productsCollection.insertOne(req.body).then((documents) => {
      res.send(documents.insertedId);
    });
  });

  // Add a Review

  app.post("/add-review", (req, res) => {
    console.log(req.body);
    reviewsCollection.insertOne(req.body).then((documents) => {
      res.send(documents.insertedId);
    });
  });

  //delete order from the database
  app.delete("/deleteOrder/:id", async (req, res) => {
    console.log(req.params.id);

    ordersCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result);
      });
  });


  //delete product from the database
  app.delete("/deleteProduct/:id", async (req, res) => {
    console.log(req.params.id);

    productsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result);
      });
  });


  //add order in database

  app.post("/add-orders", (req, res) => {
    ordersCollection.insertOne(req.body).then((result) => {
      res.send(result);
    });
  });

  // add user  
  app.post('/users', (req, res) => {
              usersCollection.insertOne(req.body).then((result) => {
                res.send(result);
              });
          });

  app.put('/users', async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
});

  app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
          
      // }
      // else {
      //     res.status(403).json({ message: 'you do not have access to make admin' })
      // }

  });

  // Email based data
  app.get("/login-orders", (req, res) => {
    ordersCollection.find({}).toArray((err, results) => {
    res.send(results);
    });
  });

  // get all order by email query
  app.get("/my-orders/:email", (req, res) => {
    console.log(req.params);
    ordersCollection
      .find({ email: req.params.email })
      .toArray((err, results) => {
        res.send(results);
      });
  });
});

// status update
  app.put("/statusUpdate/:id", async (req, res) => {
    const filter = { _id: ObjectId(req.params.id) };
    console.log(req.params.id);
    const result = await ordersCollection.updateOne(filter, {
      $set: {
        status: req.body.status,
      },
    });
    res.send(result);
    console.log(result);
  });

app.get("/", (req, res) => {
  res.send("Hello!!!");
});

app.listen(process.env.PORT || port);