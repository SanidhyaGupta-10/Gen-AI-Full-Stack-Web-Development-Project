import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, "Name is required"],
        unique: [ true, "Name already exists"],
    },
    email: {
        type: String,
        required: [ true, "Email is required"],
        unique: [ true, "Email already exists"],
    },
    password: {
        type: String,
        required: [ true, "Password is required"],
    },
});

const User = mongoose.model("User", userSchema);

export default User;
