const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { ctData, bgData, pData, adminData } = require('../modules/fbgClubData') //mongoDB web database 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { multiUpload, uploadsToGCS, delFromGCS } = require('../modules/cloudUploadConfig')

// **** api ของ customers ****
// api ข้อมูลของลูกค้าทั้งหมด
router.get("/api/customers", async(req,res) =>{
    try {
        res.json( await ctData.find({}) )
    } catch (error) {
        console.error(error)
    }
});

// api ของข้อมูลลูกค้าตามเลข cid
router.get("/api/customer/:id", async(req,res) =>{
    try {
        res.json( await ctData.findOne({cid:req.params.id}))
    } catch (error) {
        console.error(error)
    }
})

// api ของราคาค่าบริการ
router.get("/api/prices", async(req,res) =>{
    try {
        res.json( await pData.find({}))
    } catch (error) {
        console.error(error)
    }
})

// **** api ของ boardgames ****
// api ข้อมูลของบอร์ดเกมทั้งหมด
router.get("/api/boardgames", async(req,res) =>{
    try {
        res.json( await bgData.find({}) )   
    } catch (error) {
        console.error(error)
    }
});

// api ของบอร์ดเกมตาม gid
router.get("/api/boardgame/:id", async(req,res) =>{
    try {
        res.json( await bgData.find({gid:req.params.id}) )   
    } catch (error) {
        console.error(error)
    }
});

// **** api สร้างข้อมูลใหม่ลงใน collection customers, boardgames ใน mangoDB ****
router.post('/api/create/new-customer', async(req,res) => {
    try {
        const doc = await ctData.find({})
        const id = doc.length+1
        const pad = (num) => String(num).padStart(3,'0')
        const newId = `c${pad(id)}`
        let addCid = new ctData({
            cid: newId,
            date: null,
            dateB: 0,
            startTime: "--:--",
            startMDY: "---/--/----"
        })
        const result = await addCid.save()
        res.status(201).send(result)
        console.log(`added ${newId} to customers`)
    } catch (error) {
        console.error(error)
    }
})

router.post('/api/create/new-game', multiUpload, async(req,res) => {
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
            logo: logo? await uploadsToGCS(logo, 'images') : '',
            boxes: boxes? await uploadsToGCS(boxes, 'images') : '',
            banner: banner? await uploadsToGCS(banner, 'images') : '',
            docFiles: docFiles.length > 0? await Promise.all(
               docFiles.map( async(doc) => {
                const url = await uploadsToGCS(doc, 'docs')
                return { doc: url }
               }) 
            ) : [],
        })
        const addGame = await newGame.save()
        res.status(201).json({ message:`${newId} created success`, addGame})
        console.log(newGame)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
})

// **** api ระบบจับเวลา ของ customer ****
router.put('/api/getDate/:id', async(req,res) => {
    try {
        const id = req.params.id
        const getDate = new Date()
        const dateB = getDate.getTime()
        const mm = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        const [mo,d,y] = [getDate.getMonth(), getDate.getDate(), getDate.getFullYear()]
        const mdy = `${mm[mo]}-${d}-${y}`
        const [h,m] = [ `${getDate.getHours()}`, `${getDate.getMinutes()}` ]
        const hm = `${(h<10?'0':'')+h}:${(m<10?'0':'')+m}`
        const setup = {
            date: getDate,
            dateB: dateB,
            startMDY: mdy,
            startTime: hm,
        }
        const startDate = await ctData.findOneAndUpdate( {_id:id}, setup, {new: true, upsert: false}  )
        res.status(201).json({ message:`start playing`, startDate })
        console.log(`${id} start playing at ${hm} ${mdy}`)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
})

router.put('/api/clearDate/:id', async(req,res) => {
    try {
        const id = req.params.id
        const setup = {
            date: null,
            dateB: 0,
            startTime: "--:--",
            startMDY: "---/--/----"
        }
        const clearDate = await ctData.findOneAndUpdate( {_id:id}, setup, {new: true, upsert: false}  )
        res.status(201).json({ message:`stop playing`, clearDate})
        console.log(`${id} was stop playing`)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
})

router.put("/api/prices/update", async(req,res) => {
    try {
        const id = '66bba6ef85f2c67ba7fb46f8'
        const updatePrice = {
            hrs1: req.body.hrs1,
            hrs2: req.body.hrs2,
            hrs3: req.body.hrs3,
            hrs4: req.body.hrs4,
            hrs5: req.body.hrs5
        }
        const result = await pData.findByIdAndUpdate(id, updatePrice, {new: true, upsert:true})
        res.status(200).send(result)
    } catch (error) {
        console.error('error', error)
    }
})
router.patch('/api/game/:id/update', multiUpload, async(req,res)=>{
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
            logo: logo? await uploadsToGCS(logo, 'images') : game.logo,
            boxes: boxes? await uploadsToGCS(boxes, 'images') : game.boxes,
            banner: banner? await uploadsToGCS(banner, 'images') : game.banner,
            docFiles: docFiles? await Promise.all(
                docFiles.map( async(doc) => {
                    const url = await uploadsToGCS( doc, 'docs')
                    return { doc: url }
                })
            ) : game.docFiles,
        }

        if(logo){
            const oldFile = game.logo? game.logo.split(`/`).pop() : null;
            await delFromGCS(oldFile, 'images')
        }
        if(boxes){
            const oldFile = game.boxes? game.boxes.split(`/`).pop() : null;
            await delFromGCS(oldFile, 'images')
        }
        if(banner){
            const oldFile = game.banner? game.banner.split(`/`).pop() : null;
            await delFromGCS(oldFile, 'images')
        }
        for(const doc of game.docFiles){
            if(doc){
                const oldFile = doc.doc? doc.doc.split(`/`).pop() : null;
                await delFromGCS(oldFile, 'docs')
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
        console.error(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
})

// **** api ลบข้อมูล customer, boardgames ออกจาก mangaoDB ****
router.delete('/api/delete/last-customer', async(req,res) => {
    try {
        const doc = await ctData.find({})  
        const lastId = doc[doc.length-1]  //ค้นหา array ตัวสุดท้ายใน collection customers

        await ctData.findOneAndDelete({cid:lastId.cid})
        res.status(204).send(lastId.cid)
        console.log(`${lastId.cid} was deleted`)
    } catch (error) {
        console.error(error)
    }
})

router.delete('/api/game/delete/:id',async(req,res) => {
    try {
        const id = req.params.id
        const game = await bgData.findOne({ gid:id })
        if(!id){
            return res.status(404).json({message:'game not found'})
        }
        const delImages = ['logo','boxes','banner']
        delImages.forEach(fk=>{
            if( game[fk]){
                const filePath = path.join(__dirname, '../../upload/images/', game[fk]);
                fs.unlink(filePath, (err)=>{
                    console.error(`Failed to delete file: ${filePath}`, err)
                })
            }
        })

        const delGid = await bgData.findOneAndDelete({ gid:id })
        res.status(200).json({message:`Game ${id} Deleted at ${new Date()}`, delGid })
        console.log(`Game ${id.logo} Deleted at ${new Date()}`)
    } catch (error) {
        res.status(500).json({message:'error'})
        console.error(error)
    }
})

router.post('/api/register', async(req,res)=>{
    try {
        const { username, password } = req.body
        const hashPassword = await bcrypt.hash( password, 10)
        const newAdmin = new adminData({ 
            username: username, 
            password: hashPassword 
        })
        await newAdmin.save()
        res.status(201).send('admin registered')
        console.log('Account create')
    } catch (error) {
        console.error('error', error)
    }
})

router.post('/api/login', async (req,res)=>{
    try {
        const { username, password } = req.body
        const user = await adminData.findOne({ username })
        if(!username || !password){
            return res.status(400).json({ message:'Missing username or password'})
        }
        if(!user){
            return res.status(401).json({ message:'User not found'})
        }
            
        const isMath = await bcrypt.compare(password, user.password)    
        if(!isMath){
            return res.status(401).json({ message:'Incorrect password'})
        }

        const token = jwt.sign({ userId: user._id }, 'SECRET', { expiresIn: '8h' })
        res.json({ token })
        
    } catch (error) {
        console.error('login error:', error)
        res.status(500).json({ message:'error 2'})
    }
})

module.exports = router