// كود السيرفر المحدث لضمان استقرار القائمة
const express = require('express');
const app = express();
app.use(express.json());

let chatData = { username: "System", message: "No Command", time: Date.now() };
let onlineBots = {};

app.post('/update', (req, res) => {
    chatData = { username: req.body.username, message: req.body.message, time: Date.now() };
    res.send("Sent");
});

app.post('/ping', (req, res) => {
    if(req.body.botName) onlineBots[req.body.botName] = Date.now();
    res.send("OK");
});

app.get('/data', (req, res) => {
    const now = Date.now();
    // زيادة مدة المسح إلى 60 ثانية لمنع الوميض والاختفاء
    for (let bot in onlineBots) {
        if (now - onlineBots[bot] > 60000) delete onlineBots[bot];
    }
    res.json({ chatData, bots: Object.keys(onlineBots) });
});

app.listen(3000, () => console.log('✅ Server Active'));
