const http = require('http')

const app = require('./app')

const server = http.createServer(app)


const serverListeningPort = server.listen(process.env.PORT||3000, () => {
    console.log('server listenning at port '+serverListeningPort.address().port)
})