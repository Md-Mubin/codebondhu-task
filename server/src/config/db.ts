import mongoose from 'mongoose';

const connectDB = () => {
        mongoose.connect(process.env.MONGO_URI as any)
                .then(() => console.log("Database Connected"))
                .catch((err) => console.log("Database Connection Error: ", err));
};

export default connectDB;
