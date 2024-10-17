const bgData = require('../models/boardGame.model');
const { cloudUpload, cloudDelete } = require('../services/googleCloud.service')

exports.getBoardGames = async(req, res) => {
    try {
        const boardgames = await bgData.find({});
        res.status(200).json({ message:' get boardgames data succuss', boardgames })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBoardGame = async(req, res) => {
    try {
        const id = req.params.id;
        const boardGame = await bgData.findOne({gid: id});
        if( boardGame === null ){
            return res.status(404).json({ message:`${id} not found`})
        }
        res.status(200).json({message:`found ${id}`, boardGame })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBoardGame = async(req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: 'Game name is required' });
        }
        const newId = `${new Date().getTime()/100|2}`
        const tagArray = req.body.tags ? req.body.tags.split(',').map(tag => ({ tag: tag.trim() })) : []
        const logo = req.files?.logo?.[0]
        const boxes = req.files?.boxes?.[0]
        const banner = req.files?.banner?.[0]
        const docFiles = req.files?.docFiles || []

        const newGame = new bgData({
            gid: newId,
            title: req.body.title || 'Untitled',
            community: req.body.community || '',
            playingTime: req.body.playingTime || 0,
            tags: tagArray,
            price: req.body.price || 0,
            content: req.body.content || '',
            videoLink: req.body.videoLink || '',
            logo: logo? await cloudUpload(logo, 'images') : '',
            boxes: boxes? await cloudUpload(boxes, 'images') : '',
            banner: banner? await cloudUpload(banner, 'images') : '',
            docFiles: docFiles.length > 0? await Promise.all(
               docFiles.map( async(doc) => {
                const url = await cloudUpload(doc, 'docs')
                return { doc: url }
               }) 
            ) : [],
        })
        const addGame = await newGame.save()
        res.status(201).json({ message:`${newId} created success`, addGame})
        console.log(newGame)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editBoardGame = async(req, res) => {
    try {
        const id = req.params.id
        const game = await bgData.findOne({ gid:id })

        const tagArray = req.body.tags ? req.body.tags.split(',').map(tag => ({ tag: tag.trim() })) : []
        const logo = req.files?.logo?.[0]
        const boxes = req.files?.boxes?.[0]
        const banner = req.files?.banner?.[0]
        const docFiles = req.files?.docFiles || []

        const update = {
            title: req.body.title || game.title,
            community: req.body.community || game.community,
            playingTime: req.body.playingTime || game.playingTime,
            tags: tagArray,
            price: req.body.price || game.price,
            content: req.body.content || game.content,
            videoLink: req.body.videoLink || game.videoLink,
            logo: logo? await cloudUpload(logo, 'images') : game.logo,
            boxes: boxes? await cloudUpload(boxes, 'images') : game.boxes,
            banner: banner? await cloudUpload(banner, 'images') : game.banner,
            docFiles: docFiles? await Promise.all(
                docFiles.map( async(doc) => {
                    const url = await cloudUpload( doc, 'docs')
                    return { doc: url }
                })
            ) : game.docFiles,
        }

        if(logo){
            const oldFile = game.logo? game.logo.split(`/`).pop() : null;
            await cloudDelete(oldFile, 'images')
        }
        if(boxes){
            const oldFile = game.boxes? game.boxes.split(`/`).pop() : null;
            await cloudDelete(oldFile, 'images')
        }
        if(banner){
            const oldFile = game.banner? game.banner.split(`/`).pop() : null;
            await cloudDelete(oldFile, 'images')
        }
        for(const doc of game.docFiles){
            if(doc){
                const oldFile = doc.doc? doc.doc.split(`/`).pop() : null;
                await cloudDelete(oldFile, 'docs')
            }
        }

        const updateGame = await bgData.findOneAndUpdate( {gid:id },update, {new: true, upsert: false} )
        if(!updateGame){
            res.status(404).json({ message:'game not found' })
        }else{
        res.status(200).json({ message:`${id} update success`, updateGame })
        console.log(`${id} was update`)
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBoardGame = async(req, res) => {
    try {
        const id = req.params.id
        const game = await bgData.findOne({ gid:id })
        if(!id){
            return res.status(404).json({message:'game not found'})
        }

        const delGid = await bgData.findOneAndDelete({ gid:id })
        res.status(200).json({message:`Game ${id} Deleted at ${new Date()}`, delGid })
        console.log(`Game ${id.logo} Deleted at ${new Date()}`)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};