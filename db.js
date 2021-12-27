const mysql = require("mysql")

const con = mysql.createPool({
    // connectionLimit : 10,
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host:"db-mysql-nyc3-46477-do-user-10481534-0.b.db.ondigitalocean.com",
    user:"doadmin",
    password:"SJXpXrc9zold99yh",
    // user:"someuser",
    // password:"a123456789",
    database:"defaultdb",
    timezone:"Z",
    port:25060
})

con.on('connection', function (connection) {
    console.log('DB Connection established');
    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
        });
    connection.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
        });
  });

// const con = mysql.createConnection({

//     host:"db-mysql-nyc3-46477-do-user-10481534-0.b.db.ondigitalocean.com",
//     user:"doadmin",
//     password:"SJXpXrc9zold99yh",
//     database:"defaultdb",
//     timezone:"Z"
// })

// const con = mysql.createConnection({

//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"project04",
//     timezone:"Z"
// })

// con.connect(err=>{
//     if (err) {
//         console.log(err)
//     } else {
//         console.log("connected to mysql")    
//         }
//     }
//     )




const myQuery = (q) =>{
    return new Promise ((resolve,reject)=>{
        con.query(q, (err, results)=>{
            if (err) {
                reject(err)
            } else {
                resolve(results)
    }
})
})}

module.exports = { myQuery };

