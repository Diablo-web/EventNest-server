const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const Organizers = require('../models/organizer');
const Events = require('../models/events');

//**** to do check authentication, needs testing with facebook
const { isAuth } = require('./authMiddleware');

const organizerRouter = express.Router();

organizerRouter.use(bodyParser.json());

organizerRouter
    .route('/')
    .get((req, res, next) => {
        Organizers.find(req.query)
            .then(
                (Organizers) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Organizers);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Organizers.register(
            new Organizers({ username: req.body.username }),
            req.body.password,
            (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                } else {
                    if (req.body.email) user.email = req.body.email;
                    user.save()
                        .then(() => {
                            passport.authenticate('org-local')(req, res, () => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({
                                    success: true,
                                    user_id: user._id
                                });
                            });
                        }, err => next(err));
                }
            }
        );
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Organizers');
    })
    .delete((req, res, next) => {
        Organizers.deleteMany({})
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

organizerRouter
    .route('/login')
    .post(passport.authenticate('org-local'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.user);
    });

organizerRouter
    .route('/events')
    .get(isAuth, (req, res, next) => {
        Organizers.findById(req.user.id)
            .populate('events')
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user.events);
            })
    });

organizerRouter
    .route('/:organizerId')
    .get((req, res, next) => {
        Organizers.findById(req.params.organizerId)
            .then(
                (organizer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(organizer);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end(
            'POST operation not supported on /Organizers/' + req.params.organizerId
        );
    })
    .put((req, res, next) => {
        Organizers.findByIdAndUpdate(
                req.params.organizerId, {
                    $set: req.body,
                }, { new: true }
            )
            .then(
                (organizer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(organizer);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Organizers.findByIdAndDelete(req.params.organizerId)
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


module.exports = organizerRouter;