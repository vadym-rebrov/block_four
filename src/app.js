const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());


app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;