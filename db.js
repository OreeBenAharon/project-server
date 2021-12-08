const mysql = require("mysql")

const con = mysql.createConnection({

    host:"eu-cdbr-west-01.cleardb.com",
    user:"b70d4b44da7345",
    password:"723bba51",
    database:"heroku_a937d7843c7528a",
    timezone:"Z"
})

// const con = mysql.createConnection({

//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"project04",
//     timezone:"Z"
// })

con.connect(err=>{
    if (err) {
        console.log(err)
    } else {
        console.log("connected to mysql")    
        }
    }
    )

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
