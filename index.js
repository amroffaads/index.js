const express = require('express');
const app = express();
app.use(express.json());

// تخزين بيانات الدردشة والأوامر
let chatData = {
    username: "System",
    message: "بدء المحادثة...",
    time: ""
};

// استقبال الرسائل والأوامر
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

// جلب آخر بيانات
app.get('/data', (req, res) => {
    res.json(chatData);
});

app.listen(3000, () => {
    console.log('✅ الخادم يعمل على المنفذ 3000');
    console.log('📡 جاهز لاستقبال الأوامر والرسائل');
});
