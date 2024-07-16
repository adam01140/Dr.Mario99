const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "localhost:3000" },
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS
app.use(cors({
    origin: 'localhost:3000'
}));

// Function to generate random virus positions
function generateVirusPositions() {
    const positions = [];
    for (let i = 0; i < 10; i++) {
        positions.push({
            x: Math.floor(Math.random() * 1),
            y: Math.floor(Math.random() * 1)
        });
    }
    return positions;
}

// Function to generate a random list
function generateRandomList() {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 3));
}

const virusPositions = generateVirusPositions();
const randomList = generateRandomList();

const playersInLobby = { count: 0 };
const activeRooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', (roomCode) => {
        if (!activeRooms[roomCode]) {
            activeRooms[roomCode] = { players: [socket.id] };
            socket.join(roomCode);
        }
    });

    socket.on('joinRoom', (roomCode) => {
        if (activeRooms[roomCode]) {
            activeRooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('roomJoined', roomCode);
        } else {
            socket.emit('error', 'Room does not exist.');
        }
    });

    socket.on('updatePoints1', (data) => {
        io.emit('p1damage', { p1damage: data.player2points });
    });

    socket.on('updatePoints2', (data) => {
        io.emit('p2damage', { p2damage: data.player1points });
    });

    socket.on('requestRandomList', () => {
        socket.emit('receiveRandomList', randomList);
    });

    socket.emit('virusPositions', virusPositions);

    playersInLobby.count += 1;
    const playerNumber = playersInLobby.count;
    socket.emit('assignPlayerNumber', playerNumber);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        playersInLobby.count -= 1;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
