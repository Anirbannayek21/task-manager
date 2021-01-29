const express = require('express')
const auth = require('../middleware/auth')
const Tasks = require('../models/Task')
const router = new express.Router()

router.post('/tasks',auth,async(req,res)=>{
    const task = new Tasks({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// filtering => GET /tasks?completed=true
// pagination => GET /tasks?limit=2&skip=0 
// sorting => GET / tasks?sortBy=createdAt:desc use to return the data desc order by time of creation
// sorting => GET / tasks?sortBy=completed:desc use to return the data desc order by completed=true of false
router.get('/tasks',auth,async(req,res)=>{
    const match = {}
    const sort = {}

    if(req.query.sortBy)
    {
        const part = req.query.sortBy.split(':')
        sort[part[0]] = part[1]==='desc'? -1:1
    }

    if(req.query.completed)
    {
        if(req.query.completed==='true')
        match.completed = true
        else
        match.completed = false
    }

    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                // limit =2 means it how 2 element at a time
                limit:parseInt(req.query.limit),
                // skip=1 means it skip the first element of array 
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id

    try {
        const task = await Tasks.findOne({_id,author:req.user._id})
        if(!task){
            return res.status(404).send('task not found')
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id

    const update = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation= update.every((updates)=>allowedUpdates.includes(updates))

    if(!isValidOperation){
        return res.status(400).send({error:'invalid update'})
    }

    try {
        const task = await Tasks.findOne({_id,author:req.user._id})

        update.forEach((updates)=>task[updates] = req.body[updates])

        await task.save()
        // const task = await Tasks.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})

        if(!task){
            res.status(404).send("task not found")
        }
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id

    try {
        const task = await Tasks.findOneAndDelete({_id,author:req.user._id})

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})


module.exports = router