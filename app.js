require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { port } = require('./src/config/server.config')

const customerRouter = require('./src/routes/customer.router');
const boardGameRouter = require('./src/routes/boardGame.router');
const priceRouter = require('./src/routes/price.router');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/uploads/images', express.static(path.join(__dirname, './uploads/images')));
app.use('/uploads/docs', express.static(path.join(__dirname, './uploads/docs')));

app.use(customerRouter);
app.use(boardGameRouter);
app.use(priceRouter);

app.listen(port,()=> {
    console.log(`**** listening on ${port} ****`)
});