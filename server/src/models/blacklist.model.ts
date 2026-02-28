import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const tokenBlacklist = mongoose.model("Blacklist", blacklistSchema);

export default tokenBlacklist;