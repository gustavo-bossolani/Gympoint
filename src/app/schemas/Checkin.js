import mongoose from 'mongoose';

const CheckinSchema = new mongoose.Schema(
    {
        student: {
            type: Number,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Checkin', CheckinSchema);
