const express = require('express');
const app = express();
app.use(express.json());

let chatData = {
    username: "System",
    message: "No Command",
    time: Date.now()
};

// مخزن للاعبين المتصلين
let activePlayers = {}; 

// [جديد] استقبال تحديث حالة اللاعب (Ping)
app.post('/ping', (req, res) => {
    const { username } = req.body;
    if (username) {
        activePlayers[username] = Date.now(); // حفظ اسم اللاعب ووقت اتصاله
    }
    res.send("Ping Received");
});

// [جديد] جلب قائمة اللاعبين المتصلين حالياً
app.get('/players', (req, res) => {
    const now = Date.now();
    // تصفية اللاعبين الذين لم يرسلوا إشارة منذ أكثر من 15 ثانية (اعتبارهم غادروا)
    const onlineList = Object.keys(activePlayers).filter(user => (now - activePlayers[user]) < 15000);
    res.json(onlineList);
});

app.post('/update', (req, res) => {
    if(req.body.message) {
        chatData = {
            username: req.body.username || "Unknown",
            message: req.body.message,
            time: Date.now()
        };
    }
    res.send("Command Received");
});

app.get('/data', (req, res) => {
    res.json(chatData);
});

app.listen(3000, () => {
    console.log('✅ Bridge Server is running on port 3000');
});
