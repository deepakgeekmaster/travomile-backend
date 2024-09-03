const valuemiles = require('../../models/MilesValue');
const jwt = require('jsonwebtoken');

require('dotenv').config();


const MilesValue = async (req, res) => {
    try {
        const { Origin,Percabso,Value } = req.body;
        const mileValue = new valuemiles({ Origin: Origin, PerctangeAbso:Percabso, Value:Value});
        await mileValue.save();
        res.status(201).json({ message: 'Miles Value Added SuccessFully' });
    } catch (error) {
        res.status(400).json({ message: 'Error adding Miles', error });
    }
};


module.exports = { MilesValue };
