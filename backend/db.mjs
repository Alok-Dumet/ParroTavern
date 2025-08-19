import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
import passportLocalMongoose from 'passport-local-mongoose';

//lets me use slugs
mongoose.plugin(slug);

//Users that can create an account with general requirements like username, password, email, and optionally a cash App and references to campaigns they may or may not make
const UserSchema = mongoose.Schema({
  verified:{
    type: Boolean,
  },
  verificationToken:{
    type: String
  },
  expireAt: {
    type: Date,
    index: { expires: 0 }
  },
  userName: {
    type: String,
    unique: [true, "this username is already taken"],
    validate: {
      validator: function(userInput) {
                    return (/^[a-zA-Z0-9_]+$/.test(userInput)) && (userInput.length > 1) && (userInput.length < 33);
                  },
      message: userInput => `${userInput.value} is not a valid username! Usernames must be 2-32 characters long and contain only letters, numbers, and underscores.`
    },
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    unique: [true, "An account is already registered with this email"],
    validate: {
      validator: function(userInput) {
                    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInput)) && (userInput.length > 4) && (userInput.length < 255);
                  },
      message: userInput => `${userInput.value} is not a valid email! Email must be 5-254 characters long and contain only an @ and a period.`
    },
    required: [true, 'Email is required'],
  },
  campaigns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'DO NOT ADD AN EMPTY CAMPAIGN'],
    },
  ],
  slug: {
    type: String,
    slug: 'userName',
    unique: true,
    slugPaddingSize: 10,
  },
});

//Campaign that has a name, renown (an upvote mechanic), password, and creator
const CampaignSchema = mongoose.Schema({
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required'],
    default: "/images/default.png", // adjust path based on your setup
  },
  campaignName: {
    type: String,
    maxLength: [50, 'Name cannot be greater than 50 characters'],
    required: [true, 'Campaign Name is required'],
  },
  dungeonMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Error Occured Assigning Dungeon Master. There Should Be A Dungeon Master'],
  },
  privacy: {
    type: Boolean,
    required: [true, "Must state if private or public"],
  },
  description: {
    type: String,
    maxLength: [400, 'Description cannot be greater than 400 characters'],
  },
  mainStory: {
    type: String,
  },
  // tags: [{
  //   type: String,
  //   maxLength: [20, "Tag cannot be greater than 20 characters"]
  // }],
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'DO NOT ADD AN EMPTY USER'],
    },
  ],
  campaignElements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignElement',
      required: [true, 'DO NOT ADD AN EMPTY CAMPAIGNELEMENT'],
    },
  ],
  slug: {
    type: String,
    slug: 'campaignName',
    unique: true,
    slugPaddingSize: 10,
  },
});

//Every campaign made by a specific person has to have a unique name
CampaignSchema.index({ dungeonMaster: 1, campaignName: 1 }, { unique: true });

//An element must be declared a type (for convenience)
//The creator may or may not want to reveal an element or allow edit access to an element.
//By default all elements are viewable and non-modificable. People in the canSee and canEdit list can bypass the default
//An element may have text and images
const CampaignElementSchema = mongoose.Schema({
  elementText: {
    type: String,
  },
  elementImage: {
    type: String,
  },
  elementOrder: {
    type: Number,
    required: [true, 'Box must have an order value'],
  },
  // elementType: {
  //   type: String,
  //   enum: ["item", "location", "character", "enemy", "player"],
  //   required: true
  // },
  // private:{
  //   type: Boolean,
  //   default: false,
  //   required: [true, "You must determine if the element is default viewable to all"]
  // },
  // canSee: [{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: [true, "DO NOT ADD AN EMPTY USER"]
  // }],
  // canEdit: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: [true, "DO NOT ADD AN EMPTY USER"]
  // }],
  // elementText: {
  //   type: String,
  //   default: false
  // },
  // images: [{
  //   type: String,
  //   required: [true, "DO NOT ADD AN EMPTY LINK"]
  // }]
});

//Extends my User model to have methods from passportLocalMongoose. These include User.authenticate/serialize/deserialize/register
//specify my username field as userName (I'm just making things inconvenient for myself because I like camelCase)
UserSchema.plugin(passportLocalMongoose, { usernameField: 'userName' });

//my models
mongoose.model('User', UserSchema);
mongoose.model('Campaign', CampaignSchema);
mongoose.model('CampaignElement', CampaignElementSchema);

//my connection string
mongoose
  .connect(process.env.DSN ?? 'mongodb://127.0.0.1:27017/LocalParroTavern')
  .then(() => {
    console.log('Connected to Mongo server');
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
