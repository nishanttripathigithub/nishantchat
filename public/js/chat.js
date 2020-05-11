const socket = io()
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageformButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages")

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML   
const locationMessageTemplate = document.querySelector('#location-message-tempelate').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll = () => {
    //new mwssage element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage) 
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // how far we have scrolled
    const scrolloffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffset){
        $messages.scrollTop = $messages.scrollHeight
    }


    console.log(newMessageStyles)
}

socket.on('message',(message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate,{
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
         username: message.username,
         url: message.url,
         createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room, users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformButton.setAttribute('disabled','disabled')

//    const message = document.querySelector('input').value

const message = e.target.elements.message.value

    socket.emit('sendMessage', message, { username, room}, (error) =>{
        $messageformButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if (error) {
            return console.log(error)
        }
        else {
            console.log('Message')
        }

    })
})

$sendLocationButton.addEventListener('click', ()=>{
//document.querySelector('#send-location').addEventListener('click', ()=>{
    
        console.log('send location clicked')
        if (!navigator.geolocation){
            return alert('Geolocation is not supported by your browser')
        }

        $sendLocationButton.setAttribute('disabled','disabled')

        navigator.geolocation.getCurrentPosition((position)=>{
            //console.log(position)
            socket.emit('sendLocation',{
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },() => {
                console.log('Location shared')
                $sendLocationButton.removeAttribute('disabled')
            })
        })

})

socket.emit('join',{ username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})


//  socket.on('countUpdated',(count) => {
//      console.log('the count has been updated', count)
//  })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })
