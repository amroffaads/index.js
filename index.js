const express = require('express');
const app = express();
app.use(express.json());

let chatData = { username: "System", message: "No Command", time: Date.now() };
let onlineBots = {}; // تخزين أسماء اللاعبين المتصلين

// استقبال الأوامر من القائد
app.post('/update', (req, res) => {
    if(req.body.message) {
        chatData = {
            username: req.body.username || "Unknown",
            message: req.body.message,
            time: Date.now()
        };
    }
    res.send("Sent");
});

// تسجيل وجود البوت (Ping)
app.post('/ping', (req, res) => {
    if(req.body.botName) {
        onlineBots[req.body.botName] = Date.now();
    }
    res.send("OK");
});

// جلب البيانات والقائمة
app.get('/data', (req, res) => {
    const now = Date.now();
    // حذف اللاعبين الذين غادروا (أكثر من 20 ثانية خمول)
    for (let bot in onlineBots) {
        if (now - onlineBots[bot] > 20000) delete onlineBots[bot];
    }
    res.json({ chatData, bots: Object.keys(onlineBots) });
});

app.listen(3000, () => console.log('✅ Bridge Server Active'));
