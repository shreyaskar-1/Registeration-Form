const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken") 

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    }
});

// Use Of Jwt tokens
employeeSchema.add.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        return token;
        }catch(err){
            res.send("the error part"+ err);
            console.log("the error part"+ err);
            }
}

// conversion of password into hash
employeeSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        console.log(`The current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`The new password is ${this.password}`);
        this.confirmpassword = undefined;
    }
    next();
});

// Creating collection
const Register = mongoose.model("Register", employeeSchema);
module.exports = Register;

