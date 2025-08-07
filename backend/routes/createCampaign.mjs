import mongoose from 'mongoose';
import express from 'express';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';
import multer from 'multer';
import '../db.mjs';


import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const thumbnailPath = path.join(__dirname, '../nonStatic/thumbnails');

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, thumbnailPath);
  },
  filename: (req, file, cb)=>{
    cb(null, Date.now() + '-' + file.originalname);
  }
});

//allows multipart file reading
const upload = multer({storage});

//my models
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');
const CampaignElement = mongoose.model('CampaignElement');

//Router
const router = express.Router();

//Prevents people without access to a campaign from retrieving information from API
function allowed(req, res, campaign){
    if(!campaign){
        res.status(404).json({ error: 'Campaign not found.' });
        return false;
    }
    if(campaign.privacy === true){
        if(!campaign.players.includes(req.user._id) && !(campaign.dungeonMaster === req.user._id)){
            res.status(403).json({ error: 'You do not have permission to access this campaign.' });
            return false
        }
    }
    return true;
}

//Route handler for getting Campaigns, either owned by the user or public
router.get("/campaigns", async (req, res)=>{
    try{
        const owned = (req.query.owned === 'true');
        if(owned){
            let campaigns = await Campaign.find({ dungeonMaster: req.user._id}).populate('dungeonMaster', 'userName');
            return res.json({campaigns: campaigns});
        }else{
            let campaigns = await Campaign.find({privacy: false}).populate('dungeonMaster', 'userName');
            return res.json({campaigns: campaigns});
        }
    }
    catch(err){
        console.log(err.message);
        return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
    }
});

//Router handler for getting all the data for a particular Campaign
router.get("/campaigns/:campaignId/elements", async (req, res) => {
    try{
        const campaignId = req.params.campaignId;
        const campaign = await Campaign.findOne({ _id: campaignId}).populate("campaignElements");

        if(!allowed(req, res, campaign)) return;
        return res.json({ elements: campaign.campaignElements });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
    }
});

//Router handler for making a new Campaign
router.post('/campaigns', upload.single('image'), async (req, res) => {
    try{
        const {campaignName, description, isPrivate} = req.body;
        const file = req.file;
        let thumbnailUrl = null;

        if (file) {
        thumbnailUrl = `/thumbnails/${file.filename}`;
        } else {
        thumbnailUrl = '/images/default.png'; // adjust path based on your setup
        }

        const newCampaign = new Campaign({
            thumbnail: thumbnailUrl,
            campaignName: campaignName,
            description: description,
            privacy: (isPrivate === "true"),
            dungeonMaster: req.user._id,
        });
        await newCampaign.save();

        req.user.campaigns.push(newCampaign._id);
        await req.user.save();
        return res.json({});
    }
    catch(err){
        console.log(err.message);
        return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
    }
});

//Router handler for deleting a Campaign
router.delete("/campaigns/:campaignId", async (req, res)=>{
    try{
        const campaignId = req.params.campaignId;
        const campaign = await Campaign.findOne({ _id: campaignId });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found or Owned' });

        const thumbnailPath = path.join(__dirname, '..', 'nonStatic', campaign.thumbnail);
        if (campaign.thumbnail !== '/images/default.png') fs.unlinkSync(thumbnailPath);
        await Campaign.deleteOne({ _id: campaignId });

        return res.json({});
    }
    catch(err){
        console.log(err.message);
        return res.status(500).json({ error: 'Something went wrong on the Server. We apologize' });
    }
})


export {
    router
}