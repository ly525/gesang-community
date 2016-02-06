var router = require('express').Router();

router.get('/links', function (req, res) {
    res.render('links', {
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
})

module.exports = router;