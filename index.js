import express from "express"
import {Server} from "socket.io";
import http from "http";
import cors from "cors"

const app = express()
app.use(cors({
    origin: "*",
}))

app.get("/", (req, res) => {
    return res.send("Hello world")
})

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let users = []

io.on('connection', (socket ) => {
    console.log('A user connected');

    socket.on('message',  (message) => {
        switch (message.type) {
            case "connection": {
                if(!users.find(user => user.socket.id === socket.id && user.id === message.data)){
                    users.push({socket, id: message.data})
                }
                break;
            }
            case "all": {
                io.emit('message', message.data);
                break
            }
            case "specific": {
                users.forEach(({socket, id}) => {
                    if(message.ids.includes(id)) {
                        socket.emit("message", message)
                    }
                })
                // io.sockets.fetchSockets().then(sockets => {
                //     const clients = [];
                //     sockets.forEach(client => {
                //         if(clients.find(c => c.id === client.id)) return;
                //         clients.push(client)
                //         console.log(clients.map(c => c.id))
                //         const user = users.find(user => {
                //             return user.socket === client.id
                //         })
                //         if(user && message.ids.includes(user.id)) {
                //             client.emit("message", message)
                //         }
                //     })
                //     console.log(clients.length)
                // })
                break;
            }
            case "join-room": {
                const room = message.room
                socket.join(room)
                break
            }
            case "leave-room": {
                const room = message.room
                socket.leave(room)
                console.log("leave room")
                break
            }
            case "room-message": {
                const room = message.room
                io.in(room).emit("room-message", message)
                break
            }

    }});

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        users = users.filter(user => user.socket !== socket.id)
    });
});

const port = process.env.PORT || 3001

server.listen(port, () => {
    console.log('server listening on port ' + port);
});