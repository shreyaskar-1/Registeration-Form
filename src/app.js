const express = require("express");
const app = express();
const Register = require("../src/models/registers");
const path = require("path");
require("./db/conn");
const hbs = require('hbs');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index.hbs");
});

app.get("/register", (req, res) => {
    res.render("register.hbs");
});

// create new user
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        // Debugging logs
        console.log(`Password: ${password}`);
        console.log(`Confirm Password: ${cpassword}`);

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            });
            const registered = await registerEmployee.save();
            res.status(201).render("index.hbs");
        } else {
            res.send("Passwords do not match");
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get("/login", (req, res) => {
    res.render("login.hbs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
