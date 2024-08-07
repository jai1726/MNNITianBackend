const express = require('express')
const router = express.Router()
const User=require("../models/User")
const { body, validationResult} = require('express-validator');
const Experience=require("../models/Experience");
const SkillsOfUser=require("../models/Skills");
const Sent=require("../models/Sent")
const Recieved=require("../models/Recieved")
const Grade=require("../models/Grade")
const bcrypt=require('bcrypt');
const saltNumber=10;
var jwt = require('jsonwebtoken')
const jwtSecret = "HaHa"
const sendEmail = require("../sendEmail");
const { default: mongoose } = require('mongoose');
require('dotenv').config()

const decode_token=(authToken)=>{
    if (authToken.slice(-4) === ".com") return authToken;
    let decoded = jwt.decode(authToken, {complete: true}) ;
    return decoded.payload.email;
}
router.post("/createuser",[
    body('email').isEmail(),
    body('name').isLength({ min: 5 }),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({success:false,message:"Enter valid credentials"});
    const salt=await bcrypt.genSalt(saltNumber)
    let securedPassword=await bcrypt.hash(req.body.password,salt);
    let email=req.body.email
    let fool=await User.findOne({'email':email})
    if (fool!=null) return res.json({success:false,message:"email allready exist"});
    try{
        const data = {
            email: email,
            name: req.body.name
        }
        const authToken = jwt.sign(data, jwtSecret);
        User.create({
            name: req.body.name,
            branch:req.body.branch,
            email:req.body.email,
            contact:req.body.contact,
            hostel:req.body.hostel,
            password:securedPassword
        })
		const url = `${process.env.BASE_URL}users/verify/${authToken}`;
		await sendEmail(email, "Verify Email", url);
        res.json({success:false,message:"An Email sent to your account please verify",data:authToken});
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})

router.post("/EditUserData",[
    body('email').isEmail(),
    body('name').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let email=req.body.email;
    try {
        await User.findOneAndUpdate({'email':email},
            { $set:{
                'name': req.body.name,
                'branch':req.body.branch,
                'email':req.body.email,
                'contact':req.body.contact,
                'hostel':req.body.hostel,
            } }).then(() => {
                res.json({ success: true,message:"updated successfully" })
            })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false,message:"somthing went wrong try later" })
    }

})

router.post("/loginuser",[
    body('email').isEmail(),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ success:false,message: "Enter valid credentials" });
    let email=req.body.email;
    try{
        let userData=await User.findOne({'email':email});
        if(!userData)return res.json({ success:false,message: "Enter valid Emial" });
        const bcryptPassword=await bcrypt.compare(req.body.password,userData.password);
        if(!bcryptPassword) return res.json({ success:false,message: "Enter valid Password" });
        const data = {
            email: email,
            name: userData.name
        }
        const authToken = jwt.sign(data, jwtSecret);
        if (!userData.verified) {
            const url = `${process.env.BASE_URL}users/verify/${authToken}`;
            await sendEmail(userData.email, "Verify Email", url);
			return res.json({success:false,message:"An Email sent to your account please verify",data:authToken});
		}
        return res.json({success:true,data:authToken})
    }

    catch(error){
        console.log(error)
        res.json({success:false,message:"Somthing went wrong try again later"});
    }
})

router.post('/Experience',[
    body('name').isLength({ min: 3 }),
    body('experience').isLength({ min: 5 }),
    ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let data = req.body.Experience_data;
    await data.splice(0,0,{Order_date:req.body.order_date})
    let email=req.body.email;
    let eId = await Experience.findOne({ 'email':email })    
    if (eId===null) {
        try {
            await Experience.create({
                email:email,
                experience:[data]
            }).then(() => {
                res.json({ success: true })
            })
        } catch (error) {
            res.json({ success: false })

        }
    }

    else {
        try {
            await Experience.findOneAndUpdate({'email':email},
                { $push:{experience: data} }).then(() => {
                    res.json({ success: true })
                })
        } catch (error) {
            res.json({ success: false })
        }
    }
})

router.post('/AddSkills', async (req, res) => {
    let data = req.body.Skill_data;
    let email=req.body.email;
    let eId = await SkillsOfUser.findOne({ 'email':email })    
    if (eId===null) {
        try { 
            await SkillsOfUser.create({
                email:email,
                SkillData:data
            }).then(() => {
                res.json({ status: true })
            })
        } catch (error) {
            res.json({status:false});
        }
    }

    else {
        try {
            await SkillsOfUser.findOneAndUpdate({'email':email},
            { $set:{'SkillData':data} }).then(() => {
                    res.json({ status: true })
                })
        } catch (error) {
            res.json({ status: false })
        }
    }
})



router.post('/AddGrades', async (req, res) => {
    let spi = req.body.spi;
    let cpi=req.body.cpi;
    let email=req.body.email;
    let eId = await Grade.findOne({ 'email':email });
    if (eId===null) {
        try { 
            await Grade.create({
                email:email,
                cpi:cpi,
                spi:spi
            }).then(() => {
                res.json({ status: true })
            })
        } catch (error) {
            res.json({status:false});
        }
    } else {
        try {
            await Grade.findOneAndUpdate({'email':email},
            { $set:{'cpi':cpi,'spi':spi} }).then(() => {
                    res.json({ status: true })
                })
        } catch (error) {
            res.json({ status: false })
        }
    }
});

router.post("/sentRequests",async(req,res)=>{
    let email=decode_token(req.body.authToken);
    let fool=await Sent.findOne({'userEmail':email});
    res.json({success:true,data: fool});
});

router.post("/receivedRequests", async (req, res) => {
    try {
      let email = decode_token(req.body.authToken);
      let fool = await Recieved.findOne({ 'userEmail': email });
      if (!fool) {
        return res.status(404).json({ success: false, message: 'No requests found for this user' });
      }
      res.json({ success: true, data: fool });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/Requests', async (req, res) => {
    let data = [{RequestedEmail:req.body.RequestedEmail,message:req.body.message,accepted:false}];
    let email=req.body.userEmail;
    let fool=await Sent.findOne({'userEmail':email,'requestData.RequestedEmail':req.body.RequestedEmail});
    if(fool!==null) {return res.json({ success: false });}
    let eId = await Sent.findOne({ 'userEmail':email });
    if (eId===null) {
        try { 
            await Sent.create({
                userEmail:email,
                requestData:data
            })
        } catch (error) {
            res.json({success:false});
        }
    } else {
            try {
                await Sent.findOneAndUpdate({'userEmail':email},
                    { $push:{requestData: data[0]} })
            } catch (error) {
                res.json({ success: false })
            }
        }
    data = [{recievedEmail:req.body.userEmail,message:req.body.message,accepted:false}];
    email=req.body.RequestedEmail;
    eId = await Recieved.findOne({ 'userEmail':email });
    if (eId===null) {
        try { 
            await Recieved.create({
                userEmail:email,
                recievedData:data
            }).then(() => {
                res.json({ success: true })
            })
        } catch (error) {
            res.json({success:false});
        }
    } else {
            try {
                await Recieved.findOneAndUpdate({'userEmail':email},
                    { $push:{recievedData: data[0]} }).then(() => {
                        res.json({ success: true })
                    })
            } catch (error) {
                res.json({ success: false })
            }
        }
    });

router.post('/updateRequest',async (req, res) => {
    let userEmail = req.body.userEmail;
    let recievedEmail = req.body.recievedEmail;
    try {
        await Sent.updateOne({'userEmail':recievedEmail,'requestData.RequestedEmail':userEmail},
            { $set:{'requestData.$.accepted':true} });
            await Recieved.updateOne({'userEmail':userEmail,'recievedData.recievedEmail':recievedEmail},
            { $set:{'recievedData.$.accepted':true} });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
}});

router.post('/updateEndRequest',async (req, res) => {
    let userEmail = req.body.userEmail;
    let recievedEmail = req.body.recievedEmail;
    try {
        await Sent.updateOne({'userEmail':recievedEmail,'requestData.RequestedEmail':userEmail},
            { $set:{'requestData.$.accepted':false} });
            await Recieved.updateOne({'userEmail':userEmail,'recievedData.recievedEmail':recievedEmail},
            { $set:{'recievedData.$.accepted':false} });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
}});

router.get("/getSkills",async(req,res)=>{
    try{
        res.send(global.Skills);
    } catch(error){
        res.send("Server Error");
    }
});

router.post("/verification", async(req,res)=> {
    let email=req.body.email;
    try {
		const user = await User.findOne({email:email});
		if (!user) return res.json({success:false,message:"Invalid Link"});
		await User.updateOne({ 'email':email}, {$set:{verified:true}});
        res.json({success:true,message:"Email verified successfully"});
	} catch (error) {
		res.json({ success:false,message: "Internal Server Error" });
	}
});


router.post("/forgotPassword",[
    body('email').isEmail()], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success:false,message:"Enter valid credentials"});
    }
    let email=req.body.email;
    let fool=await User.findOne({'email':email});
    if (fool==null) return res.json({success:false,message:"email not exist"});
    try{
        const data = {email: email};
        const authToken = jwt.sign(data, jwtSecret);
		const url = `${process.env.BASE_URL}users/reset/${authToken}`;
		await sendEmail(email, "resetPssword", url);
        res.json({success:true,message:"An Email sent to your account to resetPassword",data:authToken});
    }
    catch(error){
        res.json({success:false,message:"Something went wrong try again later"});
    }
});

router.post("/updatePassword",[
    body('email').isEmail(),
    body('password').isLength({ min: 5 })], async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({success:false,message:"Enter valid credentials"});
    const salt=await bcrypt.genSalt(saltNumber)
    let securedPassword=await bcrypt.hash(req.body.password,salt);
    let email=req.body.email
    try{
        await User.updateOne({ 'email':email}, {$set:{password:securedPassword}});
        res.json({success:true,message:"password updated successfully"});
    }
    catch(error){
        res.json({success:false,message:"Something went wrong try again later"});
    }
});

router.post("/checkToken",async(req,res)=>{
    try {
        let authToken=req.body.authToken
        let decoded = jwt.decode(authToken, {complete: true});
        let payload = decoded.payload;
        let fool=await User.findOne({'email':payload.email})
        if(fool!=null && fool.verified) return res.json({ success: true})
        return res.json({ success: false})
    } catch (error) {
        return res.json({success:false,message:"something went wrong try again later"})
    }
});

router.post("/getUserDetails",async(req,res)=>{
    try {
        let email=decode_token(req.body.authToken);
        let userData=await User.findOne({email:email})
        return res.json({ success: true,data:userData})
    } catch (error) {
        return res.json({success:false,message:"something went wrong try again later"})
    }
});

router.get("/getExperiences",async(req,res)=>{
    try{
        let fetched_data = mongoose.connection.db.collection("experiences");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else res.send(data)
        })
    } catch(error){
        res.send("Server Error")
    }
});

router.get("/getUsersSkills",async(req,res)=>{
    try{
        let fetched_data = mongoose.connection.db.collection("userskills");
        fetched_data.find({}).toArray(async function(err, data) {
            if(err) console.log(err);
            else res.send(data);
        })
    } catch(error){
        res.send("Server Error")
    }
});

router.get("/userExperiences/:authToken",async(req,res)=>{
    let email=decode_token(req.params.authToken);
    let fool=await Experience.findOne({'email':email})
    res.json(fool)
});

router.get("/getUserSkills/:authToken",async(req,res)=>{
    let email=decode_token(req.params.authToken);
    let fool=await SkillsOfUser.findOne({'email':email})
    res.json(fool)
});

router.get("/getGrades/:authToken",async(req,res)=>{
    let email=decode_token(req.params.authToken);
    let fool=await Grade.findOne({'email':email})
    res.json(fool)
});

module.exports = router;
