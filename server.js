const app = require('src/app.js');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🌱 Connected to MongoDB successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server startup error:', error.message);
        process.exit(1);
    }
};

start();