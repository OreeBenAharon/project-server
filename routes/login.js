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
        const user = await myQuery(`SELECT * FROM users WHERE username = '${username}'`)
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
        // checks if there is already a cart
      let cart = []
      let cartDate = ""
      let userStatus = 0
      if (userData.admin) {
        userStatus = 3 
        return res.status(200).send({token,userData,userStatus})
      }
      // checks if user ever ordered anything
      const allOrders = await myQuery(`SELECT * FROM orders WHERE user_id = ${user[0].id}`)
      console.log("allorders:",allOrders)
      // gets all user's carts in order to know if user never used the system
      const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${user[0].id}`)
      console.log("allcarts:",allCarts)
      // if user's carts and orders are empty, user is brand new and status is 0
      if (allOrders.length === 0 && allCarts.length === 0) {
        userStatus = 0
        console.log("0, sends",token,cart,userData,userStatus)
        return res.status(200).send({token,cart,userData,userStatus})
      }

      // gets user's last cart id to check if it's still open or was already ordered.
      const cartId = allCarts[allCarts.length-1].id
      console.log("cartid:",cartId)
      // checks if was an order to last cart
      const orderedCartExists = await myQuery (`SELECT * FROM orders WHERE cart_id = ${cartId}`)
      console.log("orderedCartExists",orderedCartExists)
      // if last cart WASN'T ordered ....
      if (orderedCartExists.length === 0 ) {
        cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
      // if cart isn't empty, continue with it
        if (cart.length > 0) {
          userStatus = 2
          cartDate = allCarts[allCarts.length-1].created
          console.log("2, sends",token,cart,cartDate,userData,userStatus)
          return res.status(200).send({token,cart,cartDate,userData,userStatus})
        } 
        // if cart IS empty, get relative details
      }      userStatus = 1
      const lastOrder = allOrders[allOrders.length-1]
      const lastCart = await myQuery(`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${lastOrder.cart_id}`)
      console.log("1, sends",token,cart,lastOrder,lastCart,userData,userStatus)

      return res.status(200).send({token,cart,lastOrder,lastCart,userData,userStatus})
      // } else {
      //       // userStatus = 0
      //       // console.log("0, sends",token,cart,userData,userStatus)
      //       // return res.status(200).send({token,cart,userData,userStatus})
      // }        
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
        console.log(`SELECT * FROM users WHERE 'username' = '${username}'`)
        let usernames = await myQuery (`SELECT * FROM users WHERE 'username' = '${username}'`)
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
        await myQuery (`INSERT INTO users (id, fname, lname, username, password, city, street, admin) VALUES (${id}, '${fname}', '${lname}', '${username}', '${encPass}', '${city}', '${street}', false)`)
        return res.status(201).send("Registration complete")
        
    }  catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
})


module.exports = router