import mongoose from 'mongoose';
import './db.mjs';

const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');

const demoAccounts = [
  {
    userName: 'tavernkeeper',
    email: 'tavernkeeper@example.com',
    password: 'tavernkeeper-demo',
    campaignName: 'The Missing Cask',
    description: 'A mysterious cask vanished from the Parro Tavern cellar.',
  },
  {
    userName: 'storyteller',
    email: 'storyteller@example.com',
    password: 'storyteller-demo',
    campaignName: 'Lanterns at Dusk',
    description: 'A quiet village hides an old secret beneath its lantern festival.',
  },
];

async function findOrCreateUser({ userName, email, password }) {
  let user = await User.findOne({ $or: [{ userName }, { email }] });
  if (user) return user;

  user = new User({ userName, email, verified: true });
  await User.register(user, password);
  console.log(`Created demo user: ${userName}`);
  return user;
}

async function findOrCreateCampaign(user, { campaignName, description }) {
  let campaign = await Campaign.findOne({ dungeonMaster: user._id, campaignName });

  if (!campaign) {
    campaign = await Campaign.create({
      thumbnail: '/images/default.png',
      campaignName,
      description,
      privacy: false,
      dungeonMaster: user._id,
    });
    console.log(`Created demo campaign: ${campaignName}`);
  }

  if (!user.campaigns.some((campaignId) => campaignId.equals(campaign._id))) {
    user.campaigns.push(campaign._id);
    await user.save();
  }
}

try {
  await mongoose.connection.asPromise();

  for (const account of demoAccounts) {
    const user = await findOrCreateUser(account);
    await findOrCreateCampaign(user, account);
  }

  console.log('Demo data is ready.');
} finally {
  await mongoose.disconnect();
}
