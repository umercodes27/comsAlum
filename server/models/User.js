import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, 'Password must be at least 5 characters'],
        select: false // Never return password in queries
    },
    picturePath: {
        type: String,
        default: "default-profile.jpg"
    },
    friends: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    occupation: {
        type: String,
        trim: true,
        maxlength: [100, 'Occupation cannot exceed 100 characters']
    },
    viewedProfile: {
        type: Number,
        default: 0
    },
    impressions: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;