
// const mongoose = require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/link2builder").then(async () => {
//     const db = mongoose.connection.db;
//     const prop = await db.collection("properties").findOne({ "title": { $regex: /Push/i }});
//     console.log(JSON.stringify(prop, null, 2));
//     process.exit(0);
// }).catch(console.error);

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://kartiklathiyan455_db_user:ozAHRgqOJnAI5het@real-state.n6xi8jy.mongodb.net/?appName=real-state").then(async () => {
    const db = mongoose.connection.db;
    const prop = await db.collection("properties").findOne({ "title": { $regex: /Push/i } });
    console.log(JSON.stringify(prop, null, 2));
    process.exit(0);
}).catch(console.error);
