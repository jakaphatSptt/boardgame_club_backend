const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { ctData, bgData, pData, adminData } = require('../modules/bgDataLocalhost'); //mongoDB localhost database
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        let dir;
        if (file.fieldname === 'logo' || file.fieldname === 'boxes' || file.fieldname === 'banner') {
            dir = path.join(__dirname, '../../upload/images/');
        } else if (file.fieldname === 'docFiles') {
            dir = path.join(__dirname, '../../upload/document');
        }
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb){
        if (file.fieldname === 'logo' || file.fieldname === 'boxes' || file.fieldname === 'banner'){
            cb(null, file.fieldname+Math.round(Date.now()/1000)+path.extname(file.originalname))
        } else if (file.fieldname === 'docFiles'){
            cb(null,file.originalname)
        }
    }
})

const upload = multer({ storage: storage})
const multiUpload = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'boxes', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'docFiles', maxCount: 5 },
])

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
        const tagArray = req.body.tags ? req.body.tags.split(',').map(tag => ({ tag: tag.trim() })) : [];
        const newId = `${new Date().getTime()/100|2}`
        const addGame = new bgData({
            gid: newId,
            title: req.body.title,
            community: req.body.community,
            playingTime: req.body.playingTime,
            tags: tagArray,
            price: req.body.price,
            content: req.body.content,
            videoLink: req.body.videoLink,
            logo: req.files['logo'] ? req.files['logo'][0].filename : null,
            boxes: req.files['boxes'] ? req.files['boxes'][0].filename : null,
            banner: req.files['banner'] ? req.files['banner'][0].filename :null,
            docFiles: req.files['docFiles'] ? req.files['docFiles'].map(file => ({ doc: file.filename})) : [],
        })
        await addGame.save()
        res.status(201).json({ message:`${newId} created success`, addGame})
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
        const startDate = await ctData.findOneAndUpdate( {_id:id}, setup )
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
        const clearDate = await ctData.findOneAndUpdate( {_id:id}, setup )
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

        const tagArray = req.body.tags ? req.body.tags.split(',').map(tag => ({ tag: tag.trim() })) : undefined ;
        const update = {
            title: req.body.title,
            community: req.body.community,
            playingTime: req.body.playingTime,
            tags: tagArray,
            price: req.body.price,
            content: req.body.content,
            videoLink: req.body.videoLink,
            logo: req.files['logo'] ? req.files['logo'][0].filename : undefined,
            boxes: req.files['boxes'] ? req.files['boxes'][0].filename : undefined,
            banner: req.files['banner'] ? req.files['banner'][0].filename : undefined,
            docFiles: req.files['docFiles'] ? req.files['docFiles'].map(file => ({ doc: file.filename})) : undefined,
        }
        const delImg = ['logo','boxes','banner']
        delImg.forEach(fk=>{
            if( game[fk] && update[fk] && game[fk] !== update[fk] ){
                const filePath = path.join(__dirname, '../../upload/images/',game[fk]);
                fs.unlink(filePath, (err)=>{
                    console.error(`Failed to delete file: ${filePath}`, err)
                })
            }
        })
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