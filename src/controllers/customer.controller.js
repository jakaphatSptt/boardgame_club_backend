const cData = require('../models/customer.model');

exports.list = async(req, res) => {
    try {
        const customers = await cData.find({});
        res.status(200).json({ message:'found customers', customers });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.personal = async(req, res) => {
    try {
        const id = req.params.id;
        const customer = await cData.findOne({ cid: id });

        if(customer===null) {
            return res.status(200).json({ message: `${id} not found`});
        }

        res.status(200).json({ message:`found customer ${id}`, customer });
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log(error)
    }
}

exports.create = async(req, res) => {
    try {
        const count = await cData.find({}).sort({ cid: 1 });
        const id = await cData.countDocuments()+1;
        const pad = (num) => String(num).padStart(3,'0');

        const checkId = () => {
            for(let i=1; i <= count.length; i++){
                const exId = `C-${pad(i)}`;
                if(count[i-1].cid !== exId){
                    return exId;
                }
            }
            return `C-${pad(id)}`;
        }

        const newId = checkId();
        const newCustomer = new cData({
            cid: newId,
            date: null,
            dateB: 0,
            startTime: "--:--",
            startMDY: "---/--/----"
        });
        const customer = await newCustomer.save();
        res.status(201).json({ message: `${newId} created`, customer })
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log(error)
    }
};

exports.start = async(req, res) => {
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
        const startDate = await cData.findOneAndUpdate( {cid:id}, setup, {new: true, upsert: false}  )
        res.status(200).json({ message:`start playing`, startDate })
        console.log(setup)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
};

exports.clear = async(req, res) => {
    try {
        const id = req.params.id
        const setup = {
            date: null,
            dateB: 0,
            startTime: "--:--",
            startMDY: "---/--/----"
        }
        const clearDate = await cData.findOneAndUpdate( {cid:id}, setup, {new: true, upsert: false}  )
        res.status(201).json({ message:`stop playing`, clearDate})
        console.log(`${id} was stop playing`)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'error na bro try again'})
    }
};

exports.delete = async(req, res) => {
    try {
        const id = req.params.id;
        const findId = await cData.findOne({ cid:id });
        if(findId === null){
            return res.status(404).json({ message:`${id} not found`})
        }
        const result = await cData.findOneAndDelete({ cid: id });
        res.status(204).json({ message: `${id} was deleted`, result });
    } catch (error) {
        
    }
};

exports.deleteLastId = async(req, res) => {
    try {
        const doc = await cData.find({})  
        const lastId = doc[doc.length-1]  //ค้นหา array ตัวสุดท้ายใน collection customers

        const result = await cData.findOneAndDelete({cid:lastId.cid})
        res.status(204).send(lastId.cid)
        console.log(`${lastId.cid} was deleted`)
    } catch (error) {
        res.status(500).json({ error: 'error na bro try again'})
        console.error(error)
    }
};