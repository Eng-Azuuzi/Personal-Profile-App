const User = require("../models/User");
const Profile = require("../models/Profile");
const { check, validationResult } = require("express-validator");
const config = require('config');
const axios = require('axios');

//Get all profiles
//access public
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      return res.status(400).json({ msg: "There is no profile found!" });
    }

    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//Get spacific profiles
//access private
const getUserProfile = async (req, res) => {
  try {
    // get profile
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error!");
  }
};

// Get UserProfile By Id 
const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};


//Create or Update Profile
//access private
const createOrUpdateProfile = [
  check("status", "Status is required").not().isEmpty(),
  check("skills", "Skills is required").not().isEmpty(),

  //Controller Function
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      githubUsername,
      bio,
      youtube,
      instagram,
      linkedin,
      facebook,
      twitter,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubUsername) profileFields.githubUsername = githubUsername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json({ msg: "Updated Successfully", profile });
      }
      // create
      profile = await new Profile(profileFields);
      await profile.save();
      return res.status(200).json({ msg: "Registered Successfully", profile });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];

//Delete Profile user,posts
//access private
const deleteUserProfile = async (req, res) => {
  try {
    //delete posts

    //delete profile
    const profile = await Profile.findOneAndDelete({ user: req.user.id });
    //delete user
    const user = await User.findByIdAndDelete({ _id: req.user.id });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.status(200).send("User deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//Register  Experience
//access private
const registerExperience = [
  //validation
  check("title", "Title is required").not().isEmpty(),
  check("company", "Company is required").not().isEmpty(),
  check("from", "From field is required").not().isEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, description, current, to, from, location } =
      req.body;
    const newExp = {
      title,
      company,
      description,
      current,
      to,
      from,
      location,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: "User profile not found" });
      }

      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];

// Delete Experience
//access private
const deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //Get romove index
    const removeIndex = profile.experience.map(item => item.id)
      .indexOf(req.params.exp_id);
    
      if (removeIndex === -1) {
      return res.status(404).json({ msg: "Experience not found" });
    }

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


//Register Education
//access private
const registerEducation = [
  //validation
  check("school", "School is required").not().isEmpty(),
  check("degree", "Degree is required").not().isEmpty(),
  check("from", "From is required").not().isEmpty(),
  check("fieldOfStudy", "Field Of Study is required").not().isEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldOfStudy, to, from, description, current } = req.body;
    const education = {
      school, degree, fieldOfStudy, to, from, description, current
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: "User profile not found" });
      }

      profile.education.unshift(education);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];

//Delete Education
//access private
const deleteEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //Get romove index
    const removeIndex = profile.education.map(item => item.id)
      .indexOf(req.params.edu_id);
    
      if (removeIndex === -1) {
      return res.status(404).json({ msg: "Education not found" });
    }


    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//Get GitHub Repos
const getGithubRepos = async (req, res) => {
   try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
}


module.exports = {
  getAllProfiles,
  getUserProfile,
  createOrUpdateProfile,
  deleteUserProfile,
  registerExperience,
  registerEducation,
  deleteEducation,
  deleteExperience,
  getGithubRepos,
  getProfileById
};
