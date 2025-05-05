import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        max: 200,
        required: true,
    },
    lastName: {
        type: String,
        max: 200,
        required: true,
    },
    likes: {
        type: Map,
        of: Boolean,
    },
    description: {
        type: String,
        max: 500,
    },
    picturePath: {
        type: String,
    },
    location: {
        type: String,
        max: 200,
    },
    userPicturePath: {
        type: String,
    },
    comments: {
        type: Array,
        default: [],
    },

}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
