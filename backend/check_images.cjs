
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://kartiklathiyan455_db_user:ozAHRgqOJnAI5het@real-state.n6xi8jy.mongodb.net/?appName=real-state").then(async () => {
    const db = mongoose.connection.db;
    const resProps = await db.collection("properties").find({ "residential.amenityImages": { $exists: true, $not: { $size: 0 } } }).toArray();
    const comProps = await db.collection("properties").find({ "commercial.amenityImages": { $exists: true, $not: { $size: 0 } } }).toArray();
    console.log("Residential with images:", resProps.length);
    console.log("Commercial with images:", comProps.length);
    if (resProps.length > 0) console.log("Example Res Image:", resProps[0].residential.amenityImages[0]);
    if (comProps.length > 0) console.log("Example Com Image:", comProps[0].commercial.amenityImages[0]);
    process.exit(0);
}).catch(console.error);
