import * as express from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import * as axios from 'axios'
import * as bodyParser from 'body-parser'
import * as r from 'rethinkdb'
import _, { map } from 'underscore'
// require('dotenv').config();

(() => {
  // Express server ayağa kaldırılması ve Socket bind -Enes Şen
  const method: axios.Method = 'GET'
  // Rapid API host - key
  const xRapidApiHost = 'covid-19-data.p.rapidapi.com'
  const xRapidApiKey = '673d338e87msh89fc3788b48c076p12ec3djsnbac8f4d30272'
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

  app.post('/contact-form', async (req, res) => {
    try {
      const { body } = req
      const connection = await r.connect({ host: 'localhost', port: 28015 })
      if (!_.isNull('contact_forms') && _.isString('contact_forms') && !_.isNull(connection)) {
        r.tableList().run(connection).then((tableNames) => {
          if (_.includes(tableNames, 'contact_forms')) {
            return r.tableCreate('contact_forms').run(connection)
          }
          return null
        })
      }
      const table = await r.db('test').table('contact_forms').insert(body).run(connection)
      res.status(200).json('Form submitted.')
    } catch (error) {
      console.log(error)
      res.status(500).json('Internal Server Error.')
    }
  })

  io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('getChartData', (values) => {
      console.log(values)
      const data = []

      values.forEach((element) => {
        // RapidAPI'ya atılacak isteğin oluşturulması -Şule Fidanol
        axios.default.request({
          method,
          url: 'https://covid-19-data.p.rapidapi.com/country/code',
          params: { code: element },
          headers: {
            'x-rapidapi-host': xRapidApiHost,
            'x-rapidapi-key': xRapidApiKey
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
