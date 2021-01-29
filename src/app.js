const express = require('express')
require('./db/mongoose')
const User = require('./models/User')
const Tasks = require('./models/Task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('sever run in port'+port)
})

