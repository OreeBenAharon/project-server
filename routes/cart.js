const router = require('express').Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verify } = require ("../verify");
const { myQuery } = require ("../db");

// get details
router.get("/", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id} = req.user
        if (!id) {
            return res.status(400).send("User info is missing.")
          }
        if (req.user.status === 2) {
            const cartId = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
            const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId[0].id}`)
            console.log("wow",cart)
            return res.send({cart})
        } else {
            return res.send({cart:[]})
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send(err);

    }
});

router.post("/add", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id} = req.user
        const {productId,amount} = req.body
        if (!id || !amount) {
            return res.status(400).send("Info from user is missing.")
          }

        const existingCart = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
        const cartId = existingCart[existingCart.length-1].id
        console.log("existingCart",existingCart,"cartId",cartId)

        const orderedCart = await myQuery (`SELECT * FROM orders WHERE cart_id = ${cartId}`)
        console.log("ordered carts",orderedCart)
        console.log("result???",orderedCart.length)
        // user already has an open cart

        if (orderedCart.length === 0) {
            // // cart if still open

        //product already in user's cart?
            const product = await myQuery (`SELECT * FROM cart_products WHERE product_id = ${productId} AND cart_id = ${cartId}`)
            console.log("product exist?",product)
            if (product.length > 0) { // if it exists...
                await myQuery (`UPDATE cart_products SET amount = amount + ${amount} WHERE product_id = ${productId} AND cart_id = ${cartId};`)
                const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
                console.log("product added exists",cart)
                res.status(201).send({cart})
            } else { //if it doesn't exist...
                await myQuery (`INSERT INTO cart_products (product_id, amount, cart_id) VALUES (${productId}, ${amount}, ${cartId})`)
                const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
                console.log("product added not exists",cart)

                return res.status(201).send({cart})
                }
        } else { 

            //  User don't have a cart at all. Creates cart

            let createdAt = new Date
            createdAt = createdAt.toISOString().slice(0, 19).replace('T', ' ')
            await myQuery (`INSERT INTO carts (user_id,created) VALUES (${id}, "${createdAt}")`)
            const allUserCarts = await myQuery (`SELECT (id) FROM carts WHERE user_id = ${id}`)
            const cartId = allUserCarts[allUserCarts.length-1].id
            await myQuery (`INSERT INTO cart_products (product_id, amount, cart_id) VALUES (${productId}, ${amount}, ${cartId})`)
            const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
            console.log("product added cart not exist",cart)
            return res.status(201).send({cart})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);

    }
});

router.put("/changeamount", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id} = req.user
        const {productId,amount} = req.body
        const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
        const cartId = allCarts[allCarts.length-1].id
        console.log(cartId)
        if (!id || !cartId || !productId || !amount) {
            return res.status(400).send("Info from user is missing.")
          }
        // decrease comes as minus number. client checks if item != 1
        await myQuery (`UPDATE cart_products SET amount = amount + ${amount} WHERE product_id = ${productId} AND cart_id = ${cartId};`)
        const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
        return res.status(200).send({cart})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);

    }
});


router.delete("/delete", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id} = req.user
        const {productId} = req.body
        const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
        const cartId = allCarts[allCarts.length-1].id
        if (!productId || !cartId) {
            return res.status(400).send("Info from user is missing.")
          }
        await myQuery (`DELETE FROM cart_products WHERE product_id = ${productId} AND cart_id = ${cartId}`)
        const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
        res.status(200).send({cart})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);

    }
});

router.delete("/empty", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id} = req.user
        const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
        const cartId = allCarts[allCarts.length-1].id 
        if (!id || !cartId) {
            return res.status(400).send("Info from user is missing.")
          }
        await myQuery (`DELETE FROM cart_products WHERE cart_id = ${cartId}`)
        const cart = {}
        return res.status(200).send({cart})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

// router.get("/search", verify, async (req,res)=> {
//     if (req.user.admin) {
//         return res.status(403).send("Wrong identity")
//     }
//     try{
//         const {id} = req.user
//         const {query} = req.headers
//         if (!id || !query) {
//             return res.status(400).send("Info from user is missing.")
//         }
//         const cartId = (await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`))[0].id
//         const results = await myQuery (`SELECT * FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId} AND title LIKE '%${query}%'`)
//         return res.status(200).send(results)
//     } catch (err) {
//         console.log(err)
//         return res.status(500).send(err);

//     }
// });




module.exports = router