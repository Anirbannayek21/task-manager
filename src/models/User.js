const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./Task')


const userShema = mongoose.Schema({
    name:{
        type : String
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error('invalid email')
        }
    },
    password: {
        type : String,
        trim : true,
        required : true,
        minLength : 7,
        validate(value){
            if(value.toLowerCase().includes('password'))
            throw new Error('Password can not contain "password')
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userShema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'author'
})

userShema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userShema.methods.generateAuthorToken = async function(){
    const user = this

    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// check log in
userShema.statics.findByCredentials = async(email,password) =>{
    const user = await User.findOne({ email })

    if(!user){
        throw new Error("email or password is incorrect!")
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error("email or password is incorrect!")
    }

    return user
}
// remove tasks when user deleted
userShema.pre('remove',async function (next){
    const user = this

    await Tasks.deleteMany({author:user._id})
    next()
})
// change password to hash code
userShema.pre('save',async function(next){

    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
const User = mongoose.model('User',userShema)

module.exports = User