
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // UUID from localstorage (legacy support)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: {
        type: String,
        enum: ['customer', 'super_user'],
        default: 'customer'
    },
    mobile: String,
    address: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
