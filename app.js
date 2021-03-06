const express     = require('express');
const morgan      = require('morgan');
const bodyParser  = require('body-parser');
const mongoose    = require("mongoose");
const app = express();

const productRoutes = require('./api/routes/products');

const dbUrl = "mongodb://admin-node-js:" + process.env.MONGO_ATLAS_PW +"@node-product-api-shard-00-00-mou3b.mongodb.net:27017,node-product-api-shard-00-01-mou3b.mongodb.net:27017,node-product-api-shard-00-02-mou3b.mongodb.net:27017/test?ssl=true&replicaSet=node-product-api-shard-0&authSource=admin&retryWrites=true"

mongoose.connect(dbUrl).then(
  () => {
    console.log("Database connection established!");
  },
  err => {
    console.log("Error connecting Database instance due to: ", err);
  }
);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

//Routes for Product
app.use('/products', productRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
