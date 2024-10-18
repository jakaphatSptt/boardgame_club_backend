const express = require('express');
const router = express.Router();

const { upload, multiUpload } = require('../middlewares/multer')
const { getBoardGames, getBoardGame, createBoardGame, editBoardGame, deleteBoardGame } = require('../controllers/boardGame.controller')

router.get('/boardgames', getBoardGames);
router.get('/boardgame/:id', getBoardGame);
router.post('/boardgame/create', multiUpload, createBoardGame);
router.put('/boardgame/edit/:id', multiUpload, editBoardGame);
router.delete('/boardame/delete/:id', deleteBoardGame);

module.exports = router;