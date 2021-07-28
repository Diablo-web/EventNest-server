const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const organizerSchema = new Schema({
    imageUrl: String,
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'event',
    }],
    email: String,
    // add more details
});

organizerSchema.plugin(passportLocalMongoose);

const Organizers = mongoose.model('Organizer', organizerSchema);

module.exports = Organizers;