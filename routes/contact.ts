
// routes/contact.ts

import express from "express";
import Contact from "../models/contactModel";

const router = express.Router();

router.post('/form', async function (req, res, next) {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.json({ status: 'error', message: 'Missing name, email or message parameters.' });
    }
    try {
        const contact = await Contact.create({ name, email, message });
        res.json({ status: 'success', message: 'Contact saved successfully', contact });
    } catch (err) {
        next(err);

    }
});

export default router;