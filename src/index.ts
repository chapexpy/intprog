import * as express from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import * as axios from 'axios'

// require('dotenv').config();
const method: axios.Method = 'GET'
const options = {
  method,
  url: 'https://fixer-fixer-currency-v1.p.rapidapi.com/latest',
  params: { base: 'USD', symbols: 'GBP,JPY,EUR' },
  headers: {
    'x-rapidapi-host': 'fixer-fixer-currency-v1.p.rapidapi.com',
    'x-rapidapi-key': '673d338e87msh89fc3788b48c076p12ec3djsnbac8f4d30272'
  }
};

(() => {
  const app = express()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer)

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
  })

  io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('clicked', () => {
      axios.default.request(options).then((response) => {
        socket.emit('update', (response.data))
        console.log(response.data)
      }).catch((error) => {
        console.error(error)
      })
    })
    // Whenever someone disconnects this piece of code executed
    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  httpServer.listen(80, () => {
    console.log('listening on *:80')
  })
})()
