const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    file: {
        //data: Buffer, 
        //contentType: String
        //required: true
        type: String
    },
    file_id: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
