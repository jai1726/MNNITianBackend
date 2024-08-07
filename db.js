const mongoose = require('mongoose');
require('dotenv').config()
const dbURL=process.env.dbURL;

const connectDB = async () => {
    mongoose.connect(dbURL,{useNewUrlParser:true},async(err,res) =>{
        if(err){console.log("Error",err);return;}
        
        console.log('Mongo connected');
        let fetched_data = await mongoose.connection.db.collection("experiences");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else global.experience=data;
        })
        fetched_data = await mongoose.connection.db.collection("Skills");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else global.Skills=data[0].Skills;
        })

        fetched_data = await mongoose.connection.db.collection("userskills");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else global.userSkills=data;
                
        })
        fetched_data = await mongoose.connection.db.collection("sentrequests");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else global.sentRequests=data;
        })
        fetched_data = await mongoose.connection.db.collection("recievedrequests");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else global.recievedRequests=data;
        })
    });
}

module.exports = connectDB;


