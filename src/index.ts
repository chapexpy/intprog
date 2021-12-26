import * as express from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io';

// import router from './router'

// require('dotenv').config();

(() => {
  const app = express()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer)
  // app.use(router)

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
  })

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('clicked', (msg) => {
      console.log(`button clicked: ${msg.body}`)
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
