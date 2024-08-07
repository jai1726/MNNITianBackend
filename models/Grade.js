const mongoose = require('mongoose')

const {Schema} =mongoose;

const GradeSchema= new Schema({
    email:{
        type:String,
        required: true
    },
    cpi:{
        type: Array,
        required: true
    },
    spi:{
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('grade',GradeSchema);