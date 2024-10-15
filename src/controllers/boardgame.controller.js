const bgData = require('../models/boardgame.model');

exports.getBoardGames = async(req, res) => {
    try {
        const boardgames = await bgData.find({});
        res.status(200).json({ message:' get boardgames data succuss', boardgames })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};