const router = require('express').Router()
const { verify } = require ("../verify");
const { myQuery } = require ("../db");

// get details
router.post("/add", verify, async (req,res)=> {
    if (!req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {title,categ,price,pic} = req.body
        if (!title || !categ || !price || !pic) {
            return res.status(400).send("Info from admin is missing.")
          }
        await myQuery (`INSERT INTO products (title,categ_id,price,pic) VALUES ("${title}", ${categ}, ${price}, "${pic}")`)
        const products = await myQuery ("SELECT * FROM products")
        return res.status(200).send({products})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

router.put("/edit", verify, async (req,res)=> {
    if (!req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const {productId,title,categ,price,pic} = req.body
        if (!productId || !title || !categ || !price || !pic) {
            console.log(!!productId, !!title, !!categ, !!price, !!pic)
            return res.status(400).send("Info from admin is missing.")
          }
        await myQuery (`UPDATE products SET title = "${title}", categ_id = ${categ}, price = ${price}, pic = "${pic}" WHERE id = ${productId}`)
        const products = await myQuery ("SELECT * FROM products")
        return res.status(200).send({products})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});

module.exports = router