const express = require('express');
const app = express();
app.use(express.json());

let sharedPlayer = "لا يوجد بيانات";

app.post('/update', (req, res) => {
    sharedPlayer = req.body.username;
    res.send("Updated");
});

app.get('/data', (req, res) => {
    res.send(sharedPlayer);
});

app.listen(3000);
