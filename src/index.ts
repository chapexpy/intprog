import * as express from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import * as axios from 'axios'
import * as bodyParser from 'body-parser'
// require('dotenv').config();
const method: axios.Method = 'GET'
const options = {
  method,
  url: 'https://covid-19-data.p.rapidapi.com/country/code',
  params: { code: 'it' },
  headers: {
    'x-rapidapi-host': 'covid-19-data.p.rapidapi.com',
    'x-rapidapi-key': '673d338e87msh89fc3788b48c076p12ec3djsnbac8f4d30272'
  }
};

(() => {
  const app = express()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer)
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
  })
  app.post('/contact-form', (req, res) => {
    console.log(req.body)
  })

  io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('getChartData', (values) => {
      console.log(values)
      const data = []

      values.forEach((element) => {
        axios.default.request({
          method,
          url: 'https://covid-19-data.p.rapidapi.com/country/code',
          params: { code: element },
          headers: {
            'x-rapidapi-host': 'covid-19-data.p.rapidapi.com',
            'x-rapidapi-key': '673d338e87msh89fc3788b48c076p12ec3djsnbac8f4d30272'
          }
        }).then((response) => {
          data.push(response.data.body)
        }).catch((error) => {
          console.error(error)
        })
        async function sleep () {
          await new Promise((r) => setTimeout(r, 10000))
        }
        sleep()
      })
      socket.emit('updateChartData', (data))
      console.log(data)
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
