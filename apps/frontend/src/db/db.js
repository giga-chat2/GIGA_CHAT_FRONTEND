import mongoose from "mongoose";

const connect =  () => {
  if (mongoose.connections[0].readyState) return;

  try {
     mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName:'GIGA-CHAT'
    });
    console.log("Mongo Connection successfully established.");
  } catch (error) {
    throw new Error("Error connecting to Mongoose");
  }
};

export default connect;
