const router = require('express').Router();
const verifiy = require('./verifyToken');

router.get('/', verifiy, (req, res) => {
    res.send(req.user);
});


module.exports = router;
