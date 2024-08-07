const mongoose = require('mongoose')

const {Schema} =mongoose;

const SkillSchema= new Schema({
    email:{
        type:String,
        required: true
    },
    SkillData:{
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('UserSkill',SkillSchema);