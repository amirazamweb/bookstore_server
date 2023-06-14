const UserModel = require('../models/userModel');
const { hashedPassword, comparePassword, createToken } = require('../helpers/authHelper');
const fs = require('fs');
const { type } = require('os');

// sign up
const signupController = async (req, res) => {
    try {
        const { fname, lname, email, password } = req.fields;
        const { profileImg } = req.files;

        // existing user
        const existingUser = await UserModel.findOne({ email }).select({ profileImg: 0, password: 0 });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Email is already registered',
                existingUser
            })
        }
        // hashed password
        const hashedPW = hashedPassword(password);
        const user = new UserModel({ fname, lname, email, password: hashedPW })
        if (profileImg) {
            user.profileImg.data = fs.readFileSync(profileImg.path);
            user.profileImg.contentType = profileImg.type;
        }
        user.save();
        res.status(201).send({
            success: true,
            message: 'User registered successfully'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while registering user'
        })
    }
}

// login
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // checking valid user
        const user = await UserModel.findOne({ email }).select({ profileImg: 0 });

        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'Not a valid user'
            })
        }
        // matchig password
        const isPasswordMatch = comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(200).send({
                success: false,
                message: 'Not a valid credentials'
            })
        }
        // create token
        const token = createToken(user._id);
        res.status(200).send({
            success: true,
            message: 'Login successfully',
            user: { fname: user.fname, lname: user.lname, email: user.email, _id: user._id, role: user.role },
            token
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while login user'
        })
        console.log(error);
    }
}

// profile image
const profileImageController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.uID).select({ profileImg: 1 });
        if (user?.profileImg.data) {
            res.set('Content-type', user?.profileImg.contentType);
            res.status(200).send(user.profileImg.data)
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting profile image',
            error
        })
        console.log(error);
    }
}

// all users
const allUsersController = async (req, res) => {
    try {
        const users = await UserModel.find({ _id: { $nin: [req.params.id] } }).select({ password: 0, profileImg: 0 }).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'All users',
            users
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting all users',
            error
        })
        console.log(error);
    }
}

// update user
const updateUserController = async (req, res) => {
    const { role } = req.body;
    try {
        await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select({ covser: 0 });
        res.status(200).send({
            success: true,
            message: 'User updated successfully'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while updating users',
            error
        })
        console.log(error);
    }
}
module.exports = {
    signupController, loginController, profileImageController, allUsersController, updateUserController
}