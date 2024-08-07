const mongoose = require('mongoose')

const {Schema} =mongoose;

const SentSchema= new Schema({
    userEmail:{
        type:String,
        required: true
    },
    requestData:{
        type:Array,
        required: true
    }
});

module.exports = mongoose.model('SentRequest',SentSchema);