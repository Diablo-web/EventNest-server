var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var Customer = require('./models/customer');
var Organizer = require('./models/organizer');

passport.use('cust-local', new LocalStrategy(Customer.authenticate()));
passport.use('org-local', new LocalStrategy(Organizer.authenticate()));

passport.use('cust-face', new FacebookStrategy({
        clientID: process.env.FB_KEY,
        clientSecret: process.env.FB_SECRET,
        callbackURL: process.env.SERVER_URL + "/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    function(accessToken, refreshToken, profile, done) {
        //check Customer table for anyone with a facebook ID of profile.id
        Customer.findOne({
            'facebookId': profile.id
        }, function(err, customer) {
            if (err) {
                return done(err);
            }
            //No Customer was found... so create a new Customer with values from Facebook (all the profile. stuff)
            if (!customer) {
                customer = new Customer({
                    facebookId: profile.id,
                    username: profile.id,
                    display_name: profile.displayName,
                    email: profile.email,
                    imageUrl: profile.photos[0].value //needs testing
                });
                customer.save(function(err) {
                    return done(err, customer);
                });
            } else {
                //found Customer. Return
                return done(err, customer);
            }
        });
    }
));

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use('cust-google', new GoogleStrategy({
        clientID: process.env.GOOGLE_KEY,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: process.env.SERVER_URL + "/auth/google/callback"
    },
    function(token, tokenSecret, profile, done) {
        //check Customer table for anyone with a google ID of profile.id
        Customer.findOne({
            'googleId': profile.id
        }, function(err, customer) {
            if (err) {
                return done(err);
            }
            //No Customer was found... so create a new Customer with values from google (all the profile. stuff)
            if (!customer) {
                customer = new Customer({
                    googleId: profile.id,
                    username: profile.id,
                    display_name: profile.displayName,
                    email: profile.email,
                    imageUrl: profile.photos[0].value //needs testing
                });
                customer.save(function(err) {
                    return done(err, customer);
                });
            } else {
                //found Customer. Return
                return done(err, customer);
            }
        });
    }
));

passport.use('cust-twitter', new TwitterStrategy({
        consumerKey: process.env.TWITTER_KEY,
        consumerSecret: process.env.TWITTER_SECRET,
        callbackURL: process.env.SERVER_URL + "/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        //check Customer table for anyone with a twitter ID of profile.id
        Customer.findOne({
            'twitterId': profile.id
        }, function(err, customer) {
            if (err) {
                return done(err);
            }
            //No Customer was found... so create a new Customer with values from twitter (all the profile. stuff)
            if (!customer) {
                customer = new Customer({
                    twitterId: profile.id,
                    username: profile.id,
                    display_name: profile.displayName,
                    email: profile.email,
                    imageUrl: profile.photos[0].value //needs testing
                });
                customer.save(function(err) {
                    return done(err, customer);
                });
            } else {
                //found Customer. Return
                return done(err, customer);
            }
        });
    }
));

function SessionConstructor(userId, userGroup) {
    this.userId = userId;
    this.userGroup = userGroup;
}

passport.serializeUser(function(userObject, done) {
    let userGroup = "cust";

    let userPrototype = Object.getPrototypeOf(userObject);
    if (userPrototype === Customer.prototype) {
        userGroup = "cust";
    } else if (userPrototype === Organizer.prototype) {
        userGroup = "org";
    }
    let sessionConstructor = new SessionConstructor(userObject.id, userGroup);
    done(null, sessionConstructor);
});
passport.deserializeUser(function(sessionConstructor, done) {
    if (sessionConstructor.userGroup == 'cust') {
        Customer.findOne({ _id: sessionConstructor.userId }, function(err, user) {
            done(err, user);
        });
    } else if (sessionConstructor.userGroup == 'org') {
        Organizer.findOne({ _id: sessionConstructor.userId }, function(err, user) {
            done(err, user);
        });
    }
});