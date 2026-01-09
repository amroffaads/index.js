const express = require('express');
const app = express();
app.use(express.json());

// تخزين بيانات الأوامر
let chatData = {
    username: "System",
    message: "No Command",
    time: Date.now() // نستخدم الوقت بصيغة الأرقام لضمان الدقة
};

// استقبال الأوامر من القائد
app.post('/update', (req, res) => {
    if(req.body.message) {
        chatData = {
            username: req.body.username || "Unknown",
            message: req.body.message,
            time: Date.now()
        };
        console.log(`[${new Date(chatData.time).toLocaleTimeString()}] New Command: ${chatData.message}`);
    }
    res.send("Command Received");
});

// جلب الأمر الأخير (البوتات تطلب هذا الرابط)
app.get('/data', (req, res) => {
    res.json(chatData);
});

app.listen(3000, () => {
    console.log('✅ Bridge Server is running on port 3000');
});
