const Motorbike = require('../models/Motorbike');
const fs = require('fs');
const path = require('path');

exports.getMotorbikes = async (req, res) => {
    try {
        const motorbikes = await Motorbike.find();
        res.status(200).json(motorbikes);
    } catch (error) {
        console.error('Error fetching motorbikes:', error);
        res.status(500).json({ error: 'Error fetching motorbikes' });
    }
};

exports.getMotorbikeById = async (req, res) => {
    try {
        const motorbike = await Motorbike.findById(req.params.id);
        if (!motorbike) return res.status(404).json({ error: 'Motorbike not found' });
        res.status(200).json(motorbike);
    } catch (error) {
        console.error('Error fetching motorbike:', error);
        res.status(500).json({ error: 'Error fetching motorbike' });
    }
};

exports.createMotorbike = async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const { name, brand, cc, price, description } = req.body;

        const newBike = new Motorbike({
            name,
            brand,
            cc: cc ? Number(cc) : undefined,
            price: price ? Number(price) : undefined,
            description,
            imageUrl
        });

        await newBike.save();
        res.status(201).json(newBike);
    } catch (error) {
        console.error('Error creating motorbike:', error);
        res.status(500).json({ error: 'Error creating motorbike' });
    }
};

exports.updateMotorbike = async (req, res) => {
    try {
        const bike = await Motorbike.findById(req.params.id);
        if (!bike) return res.status(404).json({ error: 'Motorbike not found' });

        const { name, brand, cc, price, description } = req.body;
        if (name !== undefined) bike.name = name;
        if (brand !== undefined) bike.brand = brand;
        if (cc !== undefined) bike.cc = Number(cc);
        if (price !== undefined) bike.price = Number(price);
        if (description !== undefined) bike.description = description;

        if (req.file) {
            // xóa file ảnh cũ nếu có
            if (bike.imageUrl) {
                const oldPath = path.join(__dirname, '..', '..', 'public', bike.imageUrl.replace(/^\//, ''));
                fs.unlink(oldPath, (err) => { if (err) console.warn('Failed deleting old image:', err.message); });
            }
            bike.imageUrl = `/uploads/${req.file.filename}`;
        }

        await bike.save();
        res.status(200).json(bike);
    } catch (error) {
        console.error('Error updating motorbike:', error);
        res.status(500).json({ error: 'Error updating motorbike' });
    }
};

exports.deleteMotorbike = async (req, res) => {
    try {
        const bike = await Motorbike.findById(req.params.id);
        if (!bike) return res.status(404).json({ error: 'Motorbike not found' });

        // xóa file ảnh nếu có
        if (bike.imageUrl) {
            const filePath = path.join(__dirname, '..', '..', 'public', bike.imageUrl.replace(/^\//, ''));
            fs.unlink(filePath, (err) => { if (err) console.warn('Failed deleting image:', err.message); });
        }

        await Motorbike.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Motorbike deleted' });
    } catch (error) {
        console.error('Error deleting motorbike:', error);
        res.status(500).json({ error: 'Error deleting motorbike' });
    }
};