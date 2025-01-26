const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from any origin
        methods: ["GET", "POST"],
    },
});

app.use(cors()); // Enable CORS for Express
app.use(express.static(__dirname)); // Serve static files from the current directory

let players = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle availability toggle
    socket.on('toggleAvailability', (data) => {
        const { displayName, isAvailable } = data;

        if (isAvailable) {
            players.push({ id: socket.id, displayName });
        } else {
            players = players.filter(player => player.id !== socket.id);
        }

        io.emit('updatePlayerList', players); // Broadcast updated player list
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
        console.log("Message received:", data); // Log the received message
        const { displayName, message } = data;

        const timestamp = new Date().toLocaleTimeString();

        io.emit('receiveMessage', { displayName, message, timestamp }); // Broadcast the message to all clients
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        io.emit('updatePlayerList', players);
        console.log('A user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
