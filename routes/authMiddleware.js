const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Organizers = require('../models/organizer');

module.exports.isAuth = (req, res, next) => {
    //console.log(req)
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            msg: 'You are not authorized to view this resource',
        });
    }
};

module.exports.isOrg = (req, res, next) => {
    //console.log(req)
    if (req.isAuthenticated()) {
        let userPrototype = Object.getPrototypeOf(req.user);
        if (userPrototype === Organizers.prototype) next();
        else {
            res.status(401).json({
                msg: 'You are not authorized to view this resource',
            });
        }
    } else {
        res.status(401).json({
            msg: 'You are not authorized to view this resource',
        });
    }

};


// module.exports.isAdmin = (req, res, next) => {
//     if (req.isAuthenticated() && req.user.admin) {
//         next();
//     } else {
//         res.status(401).json({
//             msg: 'You are not authorized to view this resource because you are not an admin.',
//         });
//     }
// };