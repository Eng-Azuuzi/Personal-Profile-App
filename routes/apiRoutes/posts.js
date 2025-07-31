const express = require('express');
const router = express.Router();
const PostsController = require('../../controller/PostsController');
const verify = require('../../middleware/verifyToken')

router
    .route('/')
    .get(PostsController.getAllPosts)
    .post(verify,PostsController.createPost);

router
    .route('/myposts')
    .get(verify, PostsController.getAllPosts);

router
    .route('/like/:id')
    .put(verify, PostsController.likePost)
    .delete(verify, PostsController.unlikePost);

router
    .route('/comment/:id')
    .put(verify, PostsController.createComent);

router
    .route('/comment/:id/:commentId')
    .delete(verify, PostsController.deleteComment);

router
    .route('/:id')
    .get(verify,PostsController.getPostById)
    .delete(verify,PostsController.deletePost);

module.exports = router;
