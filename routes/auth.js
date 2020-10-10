const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerValidation} = require('../validation');
const {loginValidation} = require('../validation');


router.post('/register', async (req, res) => {
    // Validate data
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) {
        return res.status(400).send('Email alredy exists');
    }

    // Hash passwordUnresolved function or method genSalt()
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
    try {
        const savedUser = await user.save();
        res.json({user: user.id});
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/login', async (req, res) => {
    // Validate data
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('Email not found');
    }
    // Pasword is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Password is incorrect');
    }

    // JSON WEB TOKEN
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;



