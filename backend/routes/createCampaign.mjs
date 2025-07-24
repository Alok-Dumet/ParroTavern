import mongoose from 'mongoose';
import express from 'express';
import { fileURLToPath } from 'url';
import multer from 'multer';
import '../db.mjs';


import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

//getting directory app.mjs is in
const __dirname = path.dirname(__filename);

//allows multipart file reading
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

//default image
const defaultImage = {
  data: fs.readFileSync(path.join(__dirname, '../images/thumbnail.png')),
  contentType: 'image/png'
};

//my models
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');
const CampaignElement = mongoose.model('CampaignElement');

//Router
const router = express.Router();

//Prevents people without access to a campaign from retrieving information
function allowed(campaign){
    if(!campaign.players.includes(req.user._id) && campaign.privacy===true && !campaign.dungeonMaster === req.user._id){
        return res.redirect("/");
    }
}

//Route handler for displaying all users campaigns
router.get("/myCampaigns", async (req, res)=>{
    try{
        let campaigns = await Campaign.find({ dungeonMaster: req.user._id}).populate('dungeonMaster', 'userName');
        res.json({campaigns: campaigns});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
    }
})

//Router handler for displaying all public campaigns
router.get("/publicCampaigns", async (req, res)=>{
    try{
        const campaigns = await Campaign.find({privacy: false}).populate('dungeonMaster', 'userName');
        res.json({campaigns: campaigns});
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
    }
})

//Router handler for getting all the data for a particular campaign
router.get("/elements/:userName/:campaignName", async (req, res) => {
    try{
        const campaignName = req.params.campaignName;
        const dungeonMaster = await User.findOne({userName: req.params.userName});

        const campaign = await Campaign.findOne({
        dungeonMaster: dungeonMaster._id,
        campaignName: campaignName
        }).populate("campaignElements");

        allowed(campaign);
        return res.json({ elements: campaign.campaignElements })
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
    }
  });

//Router handler for making a new Campaign
router.post('/newCampaign', upload.single('image'), async (req, res) => {
    try{
        const image = req.file;
        const {campaignName, description, isPrivate} = req.body;

        const newCampaign = new Campaign({
            thumbNail: image ? {
                data: image.buffer,
                contentType: image.mimetype
            } : defaultImage,
            campaignName: campaignName,
            description: description,
            privacy: (isPrivate === "true"),
            dungeonMaster: req.user._id,
        });
        await newCampaign.save();

        const user = await User.findOne({_id: req.user._id});
        user.campaigns.push(newCampaign._id);
        await user.save();
        res.json({});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
    }
});

//Router handler for deleting a campaign
router.delete("/deleteCampaign", async (req, res)=>{
    try{
        let campaignName = req.body.campaignName;
        let dungeonMaster = req.user._id;
        await Campaign.deleteOne({campaignName: campaignName, dungeonMaster: dungeonMaster});
        res.json({});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({ error: 'Something went wrong. It was probably your fault lol' });
    }
})


export {
    router
}