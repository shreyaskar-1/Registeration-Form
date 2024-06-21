const express = require("express");
const app = express();
const path = require("path");
require("./db/conn")
const hbs = require('hbs');


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views")
const partials_path = path.join(__dirname,"../templates/partials")

app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path)
hbs.registerPartials(partials_path)

app.use(express.json());


app.get("/",(req,res)=>{
    res.render("index.hbs");
})
app.get("/register",(req,res)=>{
    res.render("register.hbs");
})
app.get("/login",(req,res)=>{
    res.render("login.hbs");
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
});