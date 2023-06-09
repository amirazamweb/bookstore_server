const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to MOngoDB Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error to MngoDB: ${error}`.bgRed.white);
    }
}

module.exports = connectDB;