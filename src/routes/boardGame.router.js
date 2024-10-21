const express = require('express');
const router = express.Router();

const { upload, multiUpload } = require('../middlewares/multer')
const gameController = require('../controllers/boardGame.controller')

router.get('/boardgames', gameController.list);
router.get('/boardgame/:id', gameController.game);
router.post('/boardgame/create', multiUpload, gameController.create);
router.put('/boardgame/edit/:id', multiUpload, gameController.edit);
router.delete('/boardgame/delete/:id', gameController.delete);

module.exports = router;