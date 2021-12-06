const router = require('express').Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { myQuery } = require ("../db");

// get details
router.get("/shopinfo", async (req,res)=> {
    try{
        const products = (await myQuery ("SELECT COUNT(*) AS allProducts FROM products"))[0].allProducts
        const orders = (await myQuery ("SELECT COUNT(*) AS allOrders FROM orders"))[0].allOrders
        return res.send({products,orders})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

router.post("/login", async (req, res) => {

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Username or password are missing")
    }
    try{
        const user = await myQuery(`SELECT * FROM users WHERE username = "${username}"`)
        console.log("user is "+JSON.stringify(user))
        if (user.length === 0) {
            return res.status(400).send({msg:"User does not exist"})
        }
        const result = await bcrypt.compare(password, user[0].password)
        // console.log("result of pass checking:",result)
        if (!result) {
          return res.status(400).send({msg:"Password incorrect"});
      }
      const token = jwt.sign(
        {
          id: user[0].id,
          username: user[0].username,
          fname: user[0].fname,
          lname: user[0].lname,
          admin: user[0].admin,
          city: user[0].city,
          street: user[0].street,
        },
        process.env.TOKEN_SECRET,
        {
          expiresIn:"1d"
        }
      )
      const userData = {
        id: user[0].id,
        fname: user[0].fname,
        lname: user[0].lname,
        admin: user[0].admin,
        city: user[0].city,
        street: user[0].street
      }
        // בודק אם יש עגלה קיימת למשתמש
      let cart = []
      let cartDate = ""
      let userStatus = 0
      if (userData.admin) {
        userStatus = 3 
        return res.status(200).send({token,userData,userStatus})
      }
      // user already has an open cart
      const allOrders = await myQuery(`SELECT * FROM orders WHERE user_id = ${user[0].id}`)
      if (allOrders.length > 0) {
        // המשתמש הזמין אי פעם משהו

        const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${user[0].id}`)
        const cartId = allCarts[allCarts.length-1].id
        const orderedCartExists = await myQuery (`SELECT * FROM orders WHERE cart_id = ${cartId}`)
        if (orderedCartExists.length === 0 ) {
          cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
          if (cart.length > 0) {
            userStatus = 2
            cartDate = allCarts[allCarts.length-1].created

            return res.status(200).send({token,cart,cartDate,userData,userStatus})
          } 
        } 
          userStatus = 1
          const lastOrder = allOrders[allOrders.length-1]
          const lastCart = await myQuery(`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${lastOrder.cart_id}`)
          return res.status(200).send({token,cart,lastOrder,lastCart,userData,userStatus})
      } else {
            userStatus = 0
            return res.status(200).send({token,cart,userData,userStatus})
        }   
      
    } catch (err) {
        console.log(err)
        return res.status(500).send(err); 
        } 
  })

  router.get("/ifidexists", async (req,res)=> {
    try{
        const {id} = req.headers
        let ids = await myQuery (`SELECT * FROM users WHERE id = ${id}`)
        return res.status(200).send(ids.length > 0)
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

  router.get("/ifusernameexists", async (req,res)=> {
    try{
        const {username} = req.headers
        let usernames = await myQuery (`SELECT * FROM users WHERE username = "${username}"`)
        return res.status(200).send(usernames.length > 0)
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

router.post("/reg", async (req,res)=> {
    try{
        const {id, fname, lname, username, password, city, street} = req.body
        if (!id || !fname || !lname || !username || !password || !city || !street) {
            return res.status(400).send({msg:"Data from user is missing."})
        }

        const encPass = await bcrypt.hash(password, 10)
        await myQuery (`INSERT INTO users (id, fname, lname, username, password, city, street, admin) VALUES (${id}, "${fname}", "${lname}", "${username}", "${encPass}", "${city}", "${street}", false)`)
        return res.status(201).send("Registration complete")
        
    }  catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
})


module.exports = router