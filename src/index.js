const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const {generateMessage, generateLocationMessage} = require('./utils/messages')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

let count = 0
//let message = 'Welcome'



io.on('connection',(socket)=>{
    console.log('new websocket connection established')


    //socket.on('join',({username, room }, callback) => {
        socket.on('join',(options, callback) => {
        //const {error, user} = addUser({id: socket.id, username, room})
        const {error, user} = addUser({id: socket.id, ...options})

        if (error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('admin', `Welcome ${user.username}`))

        socket.broadcast.to(user.room).emit('message', user.username, `${user.username} has joined the room ${user.room}`)

        io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message, {username, room}, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)){
           socket.emit('message', generateMessage('admin', 'profanity not allowed'))
            return callback('profanity not allowed')

        }

        //io.to(user.room).emit('message',message) //- commented
        io.to(user.room).emit('message', generateMessage(username, message))
        callback('message Delivered')
    })

    socket.on('sendLocation',(position, callback) => {
       // io.emit('message', 'Lattitude --> ' +  position.latitude + 'longitude -->' +  position.longitude )
       const user = getUser(socket.id)
        
       io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
       callback()
    })
    

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if (user){
        io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        }
    })

})

server.listen(port,() => {
    console.log('server started on' + port)
})
