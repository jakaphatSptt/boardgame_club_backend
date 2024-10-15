require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { port } = require('./src/config/server.config')

const router = require('./src/routes/Router');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/uploads/images', express.static(path.join(__dirname, './uploads/images')));
app.use('/uploads/docs', express.static(path.join(__dirname, './uploads/docs')));

app.use(router);

app.listen(port,()=> {
    console.log(`**** listening on ${port} ****`)
});