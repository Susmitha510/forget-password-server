const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');
    }catch(err){
        console.log(err);
    }
};

module.exports = connectDB;



//UZwkG86yqBD7kVI6

//mongodb+srv://susmi1005_db_user:UZwkG86yqBD7kVI6@cluster0.8nmrndk.mongodb.net/?appName=Cluster0