// ********** 
//
// build a custom recommendation engine, how??
// 
// **********

const mongoose = require('mongoose');

const Organizer = require('./organizer');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'organizer',
        required: true
    },
    orgName: {
        type: String
    },
    title: {
        type: String,
        index: true,
    },
    category: {
        type: String,
    },
    city: {
        type: String,
    },
    venue_addr: {
        type: String,
    },
    image_url: {
        type: String,
    },
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    facebook_page: {
        type: String,
    },
    attendees: {
        type: Number,
        default: 0,
    },
    max_attendees: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

eventSchema.post('save', function(next) {
    var event = this;
    event.model('Organizer')
        .findByIdAndUpdate(event.organizer, { $push: { events: event._id } })
        .then(next)
        .catch(err => next(err))
})


const events = mongoose.model('event', eventSchema);

module.exports = events;