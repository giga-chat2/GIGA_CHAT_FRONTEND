import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name:{
      type:String,
      required:false
    },
    username:{
      type:String,
      required:false
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    phoneno:{
      type:String,
      required:false,
    }
  },
  { timestamps: true }
);



export const User = mongoose.model("User", userSchema,'user_credentials')


// export default mongoose.models.User || mongoose.model("User", userSchema);