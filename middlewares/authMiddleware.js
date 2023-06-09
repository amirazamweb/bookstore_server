const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const isLogin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.id = data.id;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error occured while checking logined user'
        })
    }
}

const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.id).select({ profileImg: 0, passord: 0 });
        if (!user.role) {
            return res.status(200).send({
                success: false,
                message: 'Unauthorized user'
            })
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error occured while checking admin'
        })
    }
}

module.exports = { isLogin, isAdmin };