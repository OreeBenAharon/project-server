const router = require('express').Router()
const fs = require("fs").promises;
const { verify } = require ("../verify");
const { myQuery } = require ("../db");

router.post("/", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {id,fname,lname} = req.user
        const {city, street, date, card} = req.body
        console.log(req.body)
        console.log("got",id,fname,lname,city, street, date, card)
        if (req.user.admin == true) {
            return res.status(403).send("Wrong identity")

        }
        const allCarts = await myQuery (`SELECT * FROM carts WHERE user_id = ${id}`)
        const cartId = allCarts[allCarts.length-1].id

        const cart = await myQuery (`SELECT * FROM cart_products INNER JOIN carts ON carts.id = cart_products.cart_id INNER JOIN products ON cart_products.product_id = products.id WHERE user_id = ${id} AND carts.id = ${cartId}`)

        if (cart.length === 0) {
            return res.status(400).send("Cart is empty")
          }
        console.log("cart got is",cart)
        console.log(cartId)        
        console.log("got 2", !!id, !!fname, !!lname, !!city, !!street, !!date, !!card)
        if (!id || !fname || !lname || !city || !street || !date || !card ) {
            return res.status(400).send("Info from user is missing.")
          }
        let orderedAt = new Date 
        orderedAt = orderedAt.toISOString().slice(0, 19).replace('T', ' ')
        console.log("ordered at",orderedAt)
        const totalRes = await myQuery (`SELECT SUM (price * amount) AS result FROM cart_products INNER JOIN products ON cart_products.product_id = products.id WHERE cart_id = ${cartId}`)
        const total = totalRes[0].result
        console.log("total is",total)
        await myQuery (`INSERT INTO orders (user_id, cart_id, total, city, street, date, ordered_at, credit_card) VALUES (${id}, ${cartId}, ${total}, "${city}", "${street}", "${date}", "${orderedAt}", ${card})`)
        const order = await myQuery (`SELECT * FROM orders WHERE user_id = ${id}`)
        const orderId = order[order.length-1].id
        console.log("order got is",order,"and id is",orderId)
                      
        await fs.writeFile(  `../server/receptions/order${orderId}.txt`, 
                        `Recept For ${fname} ${lname}:\r\n Ordered at ${order[order.length-1].ordered_at.toLocaleString()} to ${order[order.length-1].city},${order[order.length-1].street}\r\n\r\n`,
                        (err) => {if (err) return console.log(err)}
                        );
        console.log("cart length is ",cart.length)
        for (const prod of cart) {
            await fs.appendFile(  `../server/receptions/order${orderId}.txt`, `${prod.title}: ${prod.price} x ${prod.amount} = ${prod.price * prod.amount}₪\r\n`,
            (err)=> {if (err) {console.log(err)}
            })
        }       
        await fs.appendFile(  `../server/receptions/order${orderId}.txt`, `total: ${total}₪`,
            (err)=> {if (err) {console.log(err)}
            })
                                           
        const filename = `order${orderId}.txt`
        return res.status(201).send({filename})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

router.get("/checkday", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {date} = req.query
        console.log(date)
        if (!date) {
            return res.status(400).send("Info from user is missing.")
          }
        const result = (await myQuery (`SELECT COUNT(date) AS result FROM orders WHERE date = "${date}"`))[0].result
        console.log(result)
        return res.status(200).send(result < 3)
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

module.exports = router