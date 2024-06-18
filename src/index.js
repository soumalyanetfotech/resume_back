import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Harshit:dvBzKkzZfcfUQeBj@cluster0.lozcoah.mongodb.net/", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    });
}

connectDB();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password); // Compare hashed password
            if (isMatch) {
                res.send({ message: "Login Successfully", user });
            } else {
                res.send({ message: "Password didn't match" });
            }
        } else {
            res.send({ message: "User not registered" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("here");
            return res.status(400).json({ success: false,  message: "User already registered" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt
            const newUser = new User({ name, email, password: hashedPassword }); // Save hashed password
            await newUser.save();
            res.send({ message: "Successfully Registered, Please login now." });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.listen(9002, () => {
    console.log("BE started at port 9002");
});
