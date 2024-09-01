const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
//const router = require('./routes/localhost_Router');
const router = require('./routes/fbgClub_Router');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/uploads/images', express.static(path.join(__dirname, './uploads/images')));
app.use('/uploads/document', express.static(path.join(__dirname, './uploads/docs')));

app.use(router);

app.listen(port,()=> {
    console.log(`**** listening on ${port} ****`)
});