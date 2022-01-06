const router = require('express').Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verify } = require ("../verify");
const { myQuery } = require ("../db");

router.get("/products", verify, async (req,res)=> {

    try{
        const products = await myQuery ("SELECT * FROM products")
        // console.log(details)
        res.send({products})
    } catch (err) {
        console.log(err)
        res.status(500).send(err);

    }
});

router.get("/categs", verify, async (req,res)=> {

    try{
        // console.log(req.params)
        const categs = await myQuery (`SELECT * FROM categories`)
        res.send({categs})
    } catch (err) {
        console.log(err)
        res.status(500).send(err);

    }
});

router.get("/products/categ/:categ", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        console.log(req.params)
        const products = await myQuery (`SELECT * FROM products WHERE categ_id = ${req.params.categ}`)
        res.send({products})
    } catch (err) {
        console.log(err)
        res.status(500).send(err);

    }
});

router.get("/products/title/:title", verify, async (req,res)=> {
    if (req.user.admin) {
        return res.status(403).send("Wrong identity")
    }
    try{
        const products = await myQuery (`SELECT * FROM products WHERE title LIKE '%${req.params.title}%'`)
        // console.log(details)
        res.send({products})
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});



module.exports = router