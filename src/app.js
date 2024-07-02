require('dotenv').config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Register = require("../src/models/registers");
const auth = require("./middleware/auth");
require("./db/conn");

const app = express();
const port = process.env.PORT || 3000;

// Paths for static files, templates, and partials
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware to set authentication status
// res.locals is an object in Express.js that provides a way to pass data from middleware to the view layer (templates) in your application. It exists throughout the lifecycle of the request-response cycle, making it a convenient place to store and access response-local variables.
const setAuthStatus = (req, res, next) => {
  res.locals.isAuthenticated = req.cookies.jwt ? true : false;
  next();
};

app.use(setAuthStatus);

// Routes
app.get("/", (req, res) => {
  res.render("index.hbs");
});

app.get("/secret", auth, (req, res) => {
  res.render("secret.hbs", { isAuthenticated: true });
});

app.get("/login", (req, res) => {
  res.render("login.hbs", { isAuthenticated: false });
});

app.get("/register", (req, res) => {
  res.render("register.hbs", { isAuthenticated: false });
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, gender, phone, age, password, confirmpassword } = req.body;

    if (password === confirmpassword) {
      const registerEmployee = new Register({
        firstname,
        lastname,
        email,
        gender,
        phone,
        age,
        password,
        confirmpassword
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000),
        httpOnly: true
      });

      await registerEmployee.save();
      res.status(201).render("index.hbs", { isAuthenticated: true });
    } else {
      res.send("Passwords do not match");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});
// app.post("/register", async (req, res) => {
//     try {
//       const password = req.body.password;
//       const cpassword = req.body.confirmpassword;
  
//       if (password === cpassword) {
//         const registerEmployee = new Register({
//           firstname: req.body.firstname,
//           lastname: req.body.lastname,
//           email: req.body.email,
//           gender: req.body.gender,
//           phone: req.body.phone,
//           age: req.body.age,
//           password: password,
//           confirmpassword: cpassword
//         });
  
//         const token = await registerEmployee.generateAuthToken();
  
//         res.cookie("jwt", token, {
//           expires: new Date(Date.now() + 30000),
//           httpOnly: true
//         });
  
//         console.log(`this is cookie ${req.cookies.jwt}`);
        
//         const registered = await registerEmployee.save();
//         res.status(201).render("index.hbs", { isAuthenticated: true });
//       } else {
//         res.send("Passwords do not match");
//       }
//     } catch (e) {
//       res.status(400).send(e);
//     }
//   });
  

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userEmail = await Register.findOne({ email });

    if (userEmail && await bcrypt.compare(password, userEmail.password)) {
      const token = await userEmail.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 60000),
        httpOnly: true
      });

      res.status(201).render("index.hbs", { isAuthenticated: true });
    } else {
      res.send("Invalid email or password");
    }
  } catch (err) {
    res.status(400).send("Invalid login details");
  }
});

app.get("/logout", auth, async (req, res) => {
    try {
      // Filter out the current token from req.user.tokens
    //   just for the current device.
    //   req.user.tokens = req.user.tokens.filter((currentToken) => {
    //     return currentToken.token !== req.token;
    //   });

    //   logging out for multiplae devices
      req.user.tokens = [];
  
      // Clear JWT cookie
      res.clearCookie("jwt");
      console.log("Logout successful");
  
      // Save the modified req.user object to the database
    //   await req.user.save();
      if (req.user && typeof req.user.save === 'function') {
        await req.user.save();
      }
  
      // Render the login view with isAuthenticated set to false
      res.render("login.hbs", { isAuthenticated: false });
    } catch (err) {
      // Handle any errors that occur during logout
      res.status(500).send(err);
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
