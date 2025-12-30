const express = require('express');
const app = express();
app.use(express.json());

// مصفوفة لتخزين آخر الرسائل
let chatData = {
    username: "System",
    message: "بدء المحادثة...",
    time: ""
};

// استقبال الرسالة الجديدة من أي لاعب
app.post('/update', (req, res) => {
    if(req.body.message) {
        chatData = {
            username: req.body.username || "Unknown",
            message: req.body.message,
            time: new Date().toLocaleTimeString()
        };
        console.log(`[${chatData.time}] ${chatData.username}: ${chatData.message}`);
    }
    res.send("Sent");
});

// جلب آخر رسالة مخزنة
app.get('/data', (req, res) => {
    res.json(chatData);
});

app.listen(3000);
