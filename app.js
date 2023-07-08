const { config } = require('dotenv');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*',cors());

//Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//Routers
const productRouters = require('./routers/products');
const categoriesRoutes = require('./routers/categories');
const userRoutes = require('./routers/users');
const orderRoutes = require('./routers/orders');

const api = process.env.API_URL;
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productRouters);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, orderRoutes);


//dont need this anymore
//const Product = require('./models/product');




mongoose.connect(process.env.CONNECTION_STRING,{ useNewUrlParser: true,useUnifiedTopology: true, dbName: 'Gratiiam'} )
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=>{
    console.log(err);
})

const PORT = process.env.PORT || 3000;
//Server
app.listen(PORT, ()=>{
    
    console.log('server is running http://localhost:3000');
})