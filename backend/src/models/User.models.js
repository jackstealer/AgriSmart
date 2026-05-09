import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    role:{
        type: String,
        enum: ['farmer', 'buyer'],
        required: true
    },
    profileImage:{
        type: String,
        default: "",
    },
    phone: {
        type: String
    },
 location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
},
    farmDetails:{
        sizeAcres: Number,
        address: String,
        soilType: String,
        cropsGrown: [String]
    },
    preferences: [String],
},{timestamps: true})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return 
    this.password = await bcrypt.hash(this.password, 12);
})

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
} 

export const User = mongoose.model('User', userSchema);