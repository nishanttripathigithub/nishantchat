const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room  = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room){
        return{
            error: 'Usernane and room are required'
        }
    }
    // check for duplicate user

    const existingUser = users.find((user) => {
        return user.room === room && user.name === username
    })

    if (existingUser){
        return{
            error: 'user Name is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=> user.id === id)
    
    if (index !== -1){
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room) =>{
       return users.filter((user)=> user.room === room )
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom   

}

// addUser({
//     id:11,
//     username:'User1',
//     room: 'room3'
// })

// addUser({
//     id:22,
//     username: 'User2',
//     room: 'room1'
// })

// addUser({
//     id:32,
//     username: 'User3',
//     room: 'room1'
// })


// addUser({
//     id:42,
//     username: 'User3',
//     room: 'room2'
// })


// console.log(users)
// const removedUsers = removeUser(22)
// const fetchedUser = getUser(42)
// console.log(fetchedUser)

// const userList = getUsersInRoom('room1')
// console.log(userList)
// console.log(users)


