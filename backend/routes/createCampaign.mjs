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


const defaultImage = {
  data: fs.readFileSync(path.join(__dirname, '../images/thumbnail.png')),
  contentType: 'image/png'
};

const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');
const CampaignElement = mongoose.model('CampaignElement');

//router
const router = express.Router();

//Router for displaying all users campaigns
router.get("/myCampaigns", async (req, res)=>{
    // console.log(req.user.password);
    const campaigns = await Campaign.find({ dungeonMaster: req.user._id});
    res.json({campaigns: campaigns});
})

//Router for displaying all public campaigns
router.get("/publicCampaigns", async (req, res)=>{
    const campaigns = await Campaign.find({}).populate('dungeonMaster', 'userName');
    res.json({campaigns: campaigns});
})

//Router for getting campaignElements of a specific campaign
router.get("/elements/:userName/:campaignName", async (req, res) => {
    const campaignName = req.params.campaignName;
    let dungeonMaster = await User.findOne({userName: req.params.userName});
    const campaign = await Campaign.findOne({
    dungeonMaster: dungeonMaster._id,
    campaignName: campaignName
    }).populate("campaignElements");

    if (!campaign) {
    return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ elements: campaign.campaignElements });
  
  });

//Router for making a new Campaign
router.post('/newCampaign', upload.single('image'), async (req, res) => {
    try{
        console.log(req.file, req.body)
        const image = req.file;
        const {campaignName, description, isPrivate} = req.body;

        const newCampaign = new Campaign({
            thumbNail: image ? {
                data: req.file.buffer,
                contentType: req.file.mimetype
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
        console.log("worked"); 
        res.json({});
    }
    catch(err){
        console.log(err.message);
        res.json({ error: "Your Campaign Name is too long or it already exists" });
    }
});

router.delete("/deleteCampaign", async (req, res)=>{
    let campaignName = req.body.campaignName;
    let dungeonMaster = req.user._id;

    try{
        await Campaign.deleteOne({campaignName: campaignName, dungeonMaster: dungeonMaster});
        res.json({});
    }
    catch(err){
        res.json({error: err.message});
    }
})

router.post("/save", async(req, res)=>{
    let userName = req.body.userName;
    if(req.user.userName !== userName){
        console.log("Not allowed");
        req.json({error: "Not the right user"})
    }

    let campaignElements = req.body.campaignElements;
    let campaignName = req.body.campaignName;
    let campaign = await Campaign.findOne({dungeonMaster: req.user._id, campaignName: campaignName})
    campaign.campaignElements = [];

    for (const elem of campaignElements) {
        const newCampaignElement = new CampaignElement({
          elementText: elem.elementText,
          elementImage: elem.elementImage,
          elementOrder: elem.elementOrder
        });
  
        await newCampaignElement.save();
        campaign.campaignElements.push(newCampaignElement._id);
    }

    await campaign.save();
    res.json({});

});


export {
    router
}