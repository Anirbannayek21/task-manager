const mongoose = require('mongoose')
const validator = require('validator')


mongoose.connect(process.env.MONGOODB_URL,{ 
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:false
})


