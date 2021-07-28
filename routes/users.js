var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const Customers = require('../models/customer');
const Organizers = require('../models/organizer');
const Events = require('../models/events');

const { isAuth } = require('./authMiddleware');

router.use(bodyParser.json());

router
    .route('/')
    .get(isAuth, (req, res, next) => {
        try {
            let userPrototype = Object.getPrototypeOf(req.user);
            if (userPrototype === Customers.prototype) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ user: req.user, type: 'customer' });
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ user: req.user, type: 'organizer' });
            }
        } catch (err) {
            next(err)
        }
    });

// //auth for facebook
// // sharing will require app review from facebook
// // passport.authenticate('facebook', { authType: 'reauthenticate', scope: ['manage_pages', publish_video] }));  // to share on facebook
// authRouter
//     .route('/facebook')
//     .get((req, res, next) => {
//         passport.authenticate('cust-face');
//     });

// authRouter
// .route('/facebook')
// .get(passport.authenticate('cust-face', { failureRedirect: '/customers/login' }),(req, res, next) => {
//         // Successful authentication, redirect home.
//         res.redirect('/');
//     });



module.exports = router;