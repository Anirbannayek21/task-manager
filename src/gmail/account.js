const sgmail = require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)

const userWelcomemail=(email,name)=>{
    sgmail.send({
        to:email,
        from:'anirbannayek2@gmail.com',
        subject:'welcome here',
        text:`Hello ${name} , welcome the task manger app..`
    })
}

const goodBye = ( email, name )=>{
    sgmail.send({
        to:email,
        from:'anirbannayek2@gmail.com',
        subject:'good bye email',
        text:`good bye ${name}. I hope you enjoy while using this app .`
    })
}

module.exports = {
    userWelcomemail ,
    goodBye
}