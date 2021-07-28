const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    imageUrl: String,
    display_name: {
        type: String,
        trim: true,
    },
    email: String,
    purchases: [{
        event: {
            type: Schema.Types.ObjectId,
            ref: 'event',
        },
        tickets: Number,
        transactionid: {
            type: String
        },
        transactionamount: {
            type: String
        }
    }],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'event',
    }],
    facebookId: {
        type: String,
    },
    googleId: {
        type: String,
    },
    twitterId: {
        type: String,
    }
}, { timestamps: true });

customerSchema.plugin(passportLocalMongoose);

const Customers = mongoose.model('Customer', customerSchema);

module.exports = Customers;