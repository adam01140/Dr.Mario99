const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "https://dr-mario99.onrender.com" },
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS
app.use(cors({
    origin: 'https://dr-mario99.onrender.com'
}));

// Function to generate random virus positions
function generateVirusPositions() {
    const positions = [];
    for (let i = 0; i < 10; i++) { // Generate 4 virus positions
        positions.push({
            x: Math.floor(Math.random() * 1), // Assuming width is 8
            y: Math.floor(Math.random() * 1) // Assuming max height is 10
        });
    }
    return positions;
}

const virusPositions = generateVirusPositions();

const playersInLobby = { count: 0 };
const activeRooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', (roomCode) => {
        if (!activeRooms[roomCode]) {
            activeRooms[roomCode] = { players: [socket.id] }; // Store creator's socket ID
            socket.join(roomCode); // Socket joins the room
        }
    });

    socket.on('joinRoom', (roomCode) => {
        if (activeRooms[roomCode]) {
            activeRooms[roomCode].players.push(socket.id); // Add player 2's socket ID
            socket.join(roomCode);
            io.to(roomCode).emit('roomJoined', roomCode); // Notify both players in the room
        } else {
            socket.emit('error', 'Room does not exist.'); // Notify player 2 if room code is invalid
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
