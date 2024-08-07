const mongoose = require('mongoose')

const {Schema} =mongoose;

const ExperienceSchema= new Schema({
    email:{
        type:String,
        required: true
    },
    experience:{
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('experience',ExperienceSchema);