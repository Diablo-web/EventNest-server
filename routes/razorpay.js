const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const { isAuth } = require('./authMiddleware');
// Razer Pay stuff
const shortid = require('shortid');
const Razorpay = require('razorpay');
const Customers = require('../models/customer');
const Events = require('../models/events');
const razorpay = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET
});

const payRouter = express.Router();
payRouter.use(bodyParser.json());

payRouter
    .route('/')
    .post(async(req, res, next) => {
        const payment_capture = 1;
        const amount = req.body.amount || 0;
        const tickets = req.body.tickets || 1;
        const currency = 'INR';

        const options = {
            amount: amount * 100 * tickets,
            currency,
            receipt: shortid.generate(),
            payment_capture
        };

        try {
            const response = await razorpay.orders.create(options);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
                id: response.id,
                currency: response.currency,
                amount: response.amount
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    });

payRouter
    .route('/payment')
    .post(isAuth, (req, res, next) => {
        const generated_signature = crypto.createHmac('sha256', process.env.RAZOR_SECRET) // key secret
        generated_signature.update(req.body.razorpay_order_id + "|" + req.body.transactionid)
        if (generated_signature.digest('hex') === req.body.razorpay_signature) {
            let purchase = {
                transactionid: req.body.transactionid,
                transactionamount: req.body.transactionamount,
                tickets: req.body.tickets || 1,
                event: req.body.eventId ? mongoose.Types.ObjectId(req.body.eventId) : undefined,
            }
            Customers.findByIdAndUpdate(req.user.id, { $push: { purchases: purchase } })
                .then(user => {
                    console.log(user)
                    Events.findById(req.body.eventId)
                        .then(events => {
                                let tickets = req.body.tickets ? req.body.tickets : 1
                                events.attendees = events.attendees + tickets;
                                events.save();
                            },
                            (err) => next(err))
                        .then(resp => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({ user: user });
                            },
                            (err) => next(err))
                        .catch((err) => next(err));
                })
                // req.user.purchases.push(purchase);
                // req.user.save(function(err, user) {
                //     if (err) {
                //         console.log(err);
                //         return res.status(500).send("Some Problem Occured");
                //     }
                //     Events.findById(req.body.eventId)
                //         .then(events => {
                //                 let tickets = req.body.tickets ? req.body.tickets : 1
                //                 events.attendees = events.attendees + tickets;
                //                 events.save();
                //             },
                //             (err) => next(err))
                //         .then(resp => {
                //                 res.statusCode = 200;
                //                 res.setHeader('Content-Type', 'application/json');
                //                 res.json({ user: user });
                //             },
                //             (err) => next(err))
                //         .catch((err) => next(err));
                // });
        } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.json({ msg: "failed" });
        }
    })

module.exports = payRouter;