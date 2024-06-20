require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const authRoute = require("./routes/auth")


const app = express();
app.use(express.json());
app.use(cors());


app.use("/auth",authRoute)


app.get("/", (req,res)=>{
    res.send("Home page")
})


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("DB connected");
})
.catch((error)=>{
    console.log(`Failed to connect to database at ${process.env.PORT}`,error);
})

app.listen(process.env.PORT || 5001, ()=>{
    console.log(`Backend server listending at ${process.env.PORT}`);
})