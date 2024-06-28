const express = require("express");
const app = express();
const Register = require("../src/models/registers");
const path = require("path");
require("./db/conn");
const hbs = require('hbs');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


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
        const { firstname, lastname, email, gender, phone, age, password, confirmpassword } = req.body;

        // Check if passwords match
        if (password !== confirmpassword) {
            return res.status(400).send("Passwords do not match");
        }

        // Check if user with the same email already exists
        const existingUser = await Register.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists with this email");
        }

        // Create new user instance
        const newUser = new Register({
            firstname,
            lastname,
            email,
            gender,
            phone,
            age,
            password
        });

        // Generate auth token
        const token = await newUser.generateAuthToken();

        // Save user to database
        await newUser.save();

        res.status(201).render("index.hbs");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(400).send(error.message);
    }
});


app.get("/login", (req, res) => {
    res.render("login.hbs");
});

// sign in user
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await Register.findOne({ email });

        const isMatch = await bcrypt.compare(password, userEmail.password);

        if (isMatch) {
            res.status(201).render("index");
        } else {
            res.send("Invalid Password");
        }
    } catch (err) {
        res.status(400).send("Invalid login details");
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
