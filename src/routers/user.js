const express = require('express')
const User = require('../models/User')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {userWelcomemail , goodBye} = require('../gmail/account')


router.post('/users',async(req,res)=>{
    const user = new User(req.body)

    try {
        await user.save()
        userWelcomemail(user.email,user.name)
        const token = await user.generateAuthorToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
    
})

router.post('/users/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthorToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj)=>{
            return tokenObj.token != req.token;
        })
        await req.user.save()
        res.send('logout successfully')
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logout/all',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("logout from all device")
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth ,async(req,res)=>{
    res.send(req.user)
})

router.patch('/users/me',auth,async(req,res)=>{

    const update = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation= update.every((updates)=>allowedUpdates.includes(updates))

    if(!isValidOperation){
        return res.status(400).send({error:'invalid update'})
    }

    try {
        update.forEach((updates)=>req.user[updates]=req.body[updates])

        await req.user.save()

        // const user = await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove()
        goodBye(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload =  multer({
    limits:{
        fileSize:10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpge|png)$/)){
            return cb(new Error ('please upload only images'))
        }

        cb(undefined,true)
    }
})

router.post('/users/me/avter',auth,upload.single('Avter'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250}).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/delete',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send("successfully deleted");
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user= await User.findById(req.params.id)
        if(!user || !user.avatar)
        {
            throw new Error('img or user not found')
        }

        res.set('content-Type','image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router