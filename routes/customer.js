const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const Customers = require('../models/customer');
const Events = require('../models/events');

const { isAuth } = require('./authMiddleware');

const customerRouter = express.Router();

customerRouter.use(bodyParser.json());

customerRouter
    .route('/')
    .get((req, res, next) => {
        Customers.find(req.query)
            .then(
                (customers) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(customers);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Customers.register(
            new Customers({ username: req.body.username }),
            req.body.password,
            (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                } else {
                    if (req.body.email) user.email = req.body.email;
                    if (req.body.display_name) user.display_name = req.body.display_name;
                    user.save()
                        .then(() => {
                            passport.authenticate('cust-local')(req, res, () => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(req.user);
                            });
                        }, err => next(err));
                }
            }
        );
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /customers');
    })
    .delete((req, res, next) => {
        Customers.deleteMany({})
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });

customerRouter
    .route('/login')
    .post(passport.authenticate('cust-local'), (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.user);
    });

customerRouter
    .route('/wishlist')
    .get(isAuth, (req, res, next) => {
        Customers.findById(req.user.id)
            .populate('wishlist')
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user.wishlist);
            })
    });

customerRouter
    .route('/purchases')
    .get(isAuth, (req, res, next) => {
        Customers.findById(req.user.id)
            .populate('purchases.event')
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user.purchases);
            })
    });

customerRouter
    .route('/:customerId')
    .get((req, res, next) => {
        Customers.findById(req.params.customerId)
            .then(
                (customer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(customer);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end(
            'POST operation not supported on /customers/' + req.params.customerId
        );
    })
    .put((req, res, next) => {
        Customers.findByIdAndUpdate(
                req.params.customerId, {
                    $set: req.body,
                }, { new: true }
            )
            .then(
                (customer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(customer);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Customers.findByIdAndDelete(req.params.customerId)
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });


customerRouter
    .route('/:customerId/purchase')
    .post((req, res, next) => {
        Customers.findByIdAndUpdate(req.params.customerId, { $push: { purcahses: req.body } })
            .then(cust => {
                    Events.findById(req.body.event)
                        .then(events => {
                                events.attendees = events.attendees + req.body.tickets;
                                events.save();
                            },
                            (err) => next(err))
                        .then(resp => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({ 'successful': true });
                            },
                            (err) => next(err))
                        .catch((err) => next(err));
                },
                (err) => next(err))
            .catch((err) => next(err));
    })

customerRouter
    .route('/:customerId/wishlist/:event_id')
    .post((req, res, next) => {
        Customers.findByIdAndUpdate(req.params.customerId, { $addToSet: { wishlist: req.params.event_id } })
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Customers.findByIdAndUpdate(req.params.customerId, { $pull: { wishlist: req.params.event_id } })
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });


module.exports = customerRouter;