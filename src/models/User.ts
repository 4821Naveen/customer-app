
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // UUID from localstorage
    name: String,
    email: String,
    mobile: String,
    address: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
