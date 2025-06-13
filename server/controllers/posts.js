import Post from '../models/Post.js';
import User from '../models/User.js';

// create post
export const createPost = async (req, res) => {
    // const newPost = new posts(req.body);
    try {
        const { userId, description } = req.body;
        const picturePath = req.file?.filename || req.body.picturePath || "";
        const user = await User.findById(userId);
        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            description,
            picturePath,
            location: user.location,
            userPicturePath: user.picturePath,
            likes: {},
            comments: [],
        })
        await newPost.save();
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(201).json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
}

//  Read
export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const post = await Post.find({ userId });
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Update
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(id);
        const isLiked = post.likes.get(userId);
        if (isLiked) {
            post.likes.delete(userId);
        }
        else {
            post.likes.set(userId, true);
        }

        // const updatedPost = await post.findByIdAndUpdate(
        //     id,
        //     { likes: post.likes }, 
        //     { new: true }
        // );

        await post.save();
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // assuming verifyToken adds user info to req.user

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the post owner can delete the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


