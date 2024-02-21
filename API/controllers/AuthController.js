const express = require('express');
const { userExist, userIsLogged, createUser, login } = require('../model/data/queries/AuthorizedUserQueries');
const router = express.Router();

router.get('/check', async (req, res) => {
    try {
        const exist = await userExist();

        if (!exist) {
            res.status(404).send({ data: 'No user found' });
        } else {
            // get token from header 
            if (req.headers.authorization) {
                let token = req.headers.authorization.split('Bearer ')[1];
                if (token && token !== "null") {
                    res.status(200).send({ logged: await userIsLogged(token) });
                } else { 
                    res.status(200).send({ logged: false });
                }
            } else {
                res.status(200).send({ logged: false });
            }
        }
    } catch (error) {
        res.status(500).send({ data: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const result = await login(req.body); 
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ data: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        await createUser(req.body);
        const token = await login(req.body);
 
        res.status(201).send({ token });
    } catch (error) {
        res.status(500).send({ data: error.message }); 
    }
});

module.exports = router;
