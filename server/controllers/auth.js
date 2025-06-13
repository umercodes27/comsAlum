import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import validator from 'validator';
import { sendWelcomeEmail } from '../utils/email.js';


// Register User
export const register = async (req, res) => {
    try {
        console.log("🖼️ File:", req.file);
        console.log("📦 Body:", req.body);

        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            friends, 
            location,
            occupation
        } = req.body;

        // Validate required fields
        const requiredFields = { firstName, lastName, email, password };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "Missing required fields",
                missingFields 
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email }).select('_id');
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Handle file upload
        const picturePath = req.file 
            ? req.file.filename 
            // : req.file.path // Adjust this if your file upload middleware saves the file differently
            : "default-profile.jpeg";

        // Create new user (password will be hashed by pre-save hook)
        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password, // Will be hashed automatically by pre-save hook
            picturePath,
            friends: friends || [],
            location: location?.trim() || "",
            occupation: occupation?.trim() || "",
            viewedProfile: Math.floor(Math.random() * 100),
            impressions: Math.floor(Math.random() * 100),
        });

        const savedUser = await newUser.save();
        //alert("User registered successfully");

        // Email notification
        try {
            await sendWelcomeEmail(email, firstName);
        } catch (emailErr) {
            console.warn("⚠️ Email send failed:", emailErr.message);
        }
        
        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        // Create token
        const token = jwt.sign(
            { id: savedUser._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.status(201).json({ 
            user: userResponse, 
            token,
            message: "Registration successful" 
        });

    } catch (error) {
        console.error("Registration error:", error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation failed",
                errors 
            });
        }

        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ 
                message: "Email already in use" 
            });
        }

        res.status(500).json({ 
            message: "An unexpected error occurred",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login User
export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log("Login attempt:", email); // Debugging
  
      // Ensure password is included in the query result
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        console.log("User not found");
        return res.status(400).json({ message: "User does not exist." });
      }
  
      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password does not match");
        return res.status(400).json({ message: "Invalid credentials." });
      }
  
      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
      });
  
      // Remove password from returned user object
      const userObj = user.toObject();
      delete userObj.password;
  
      console.log("Login successful");
      res.status(200).json({ token, user: userObj });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

