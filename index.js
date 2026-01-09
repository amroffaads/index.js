const express = require('express');
const app = express();
app.use(express.json());

let lastCommand = { username: "System", message: "none", time: Date.now() };

// استقبال الأمر من القائد
app.post('/update', (req, res) => {
    lastCommand = {
        username: req.body.username,
        message: req.body.message,
        time: Date.now()
    };
    res.send("Command Sent");
});

// البوتات تسحب الأمر من هنا
app.get('/data', (req, res) => {
    res.json(lastCommand);
});

app.listen(3000, () => console.log('🚀 Commands Bridge Active'));
