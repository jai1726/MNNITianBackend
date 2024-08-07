const mongoose = require('mongoose')

const {Schema} =mongoose;

const RecievedSchema= new Schema({
    userEmail:{
        type:String,
        required: true
    },
    recievedData:{
        type:Array,
        required: true
    }
});

module.exports = mongoose.model('RecievedRequest',RecievedSchema);