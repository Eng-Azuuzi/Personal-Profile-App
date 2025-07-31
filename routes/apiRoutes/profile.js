const express = require('express');
const router = express.Router();
const profilesController = require('../../controller/ProfileController');
const verify = require('../../middleware/verifyToken'); 
router
    .route('/')
    .get(profilesController.getAllProfiles)
    .post(verify,profilesController.createOrUpdateProfile)//private access
    .delete(verify, profilesController.deleteUserProfile);//private access
router
    .route('/me')
    .get(verify, profilesController.getUserProfile);//private access

router
    .route('/experience')
    .put(verify, profilesController.registerExperience);


router
    .route('/education')
    .put(verify, profilesController.registerEducation);

router
    .route('/user/:id')
    .get(verify, profilesController.getProfileById);

router
    .route('/experience/:exp_id')
    .delete(verify, profilesController.deleteExperience);


router
    .route('/education/:edu_id')
    .delete(verify, profilesController.deleteEducation);

router
    .route('/github/:username')
    .get(profilesController.getGithubRepos);

    
module.exports = router;
