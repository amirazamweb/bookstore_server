const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashedPassword = (password) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt)
    } catch (error) {
        console.log(error);
    }
}

const comparePassword = (password, hashedPassword) => {
    try {
        return bcrypt.compareSync(password, hashedPassword);
    } catch (error) {
        console.log(error);
    }
}

const createToken = (id) => {
    try {
        return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '2d' })
    } catch (error) {
        console.log(error);
    }
}

module.exports = { hashedPassword, comparePassword, createToken };