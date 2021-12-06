const express = require('express')
const path = require('path');

const { verify } = require ("./verify");

const app = express()
app.use(express.json())
app.use(require("cors")())

require("./db")
require('dotenv').config()


app.use('/login', require('./routes/login'))
app.use('/store', require('./routes/store'))
app.use('/cart', require('./routes/cart'))
app.use('/order', require('./routes/order'))
app.use('/admin', require('./routes/admin'))


app.get('/receptions/:file', verify, (req, res) => {

    // res.download(path.join(__dirname + `/receptions/${req.params.file}`), "123.txt")
    // res.download(req.params.file)
    var options = {
        root: path.join(__dirname, `/receptions/`),
        headers: {'filename':"123.txt"}
    }
    
    // console.log(req.params.file)
    // res.sendFile( req.params.file, options)
    res.download(__dirname + `/receptions/${req.params.file}`, "123.txt")
    console.log(res)
    // res.sendFile(path.join(__dirname + `/receptions/${req.params.file}`),{ headers: { 'filename': "123.txt" } },(error) => {console.log(error)})
    


});

// app.get("/receptions/:file", verify, function(req, res) {
//     res.attachment(__dirname + `/receptions/${req.params.file}`);
//     res.end('Downloaded', 'UTF-8')
//  });

// router.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname + '../receptions/reception6.txt'));
//     // res.sendFile(path.join(__dirname + '../../static/api/api.html'));

// });


app.listen(1001, ()=>console.log("listening to 1001"))