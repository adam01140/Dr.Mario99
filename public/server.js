const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", },
});

// New line: Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));





//all heroku baby


function generateRandomList() {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 3));
}


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



const randomList = generateRandomList();
console.log(randomList);







const playersInLobby = { count: 0 };


const activeRooms = {};

io.on('connection', (socket) => {
	
	
	socket.on('createRoom', (roomCode) => {
        // Create room only if it doesn't already exist
        if (!activeRooms[roomCode]) {
            activeRooms[roomCode] = { players: [socket.id] }; // Store creator's socket ID
            socket.join(roomCode); // Socket joins the room
            // Wait for player 2 to join...
        }
    });

    socket.on('joinRoom', (roomCode) => {
        // Check if room exists
        if (activeRooms[roomCode]) {
            activeRooms[roomCode].players.push(socket.id); // Add player 2's socket ID
            socket.join(roomCode);
            io.to(roomCode).emit('roomJoined', roomCode); // Notify both players in the room
        } else {
            socket.emit('error', 'Room does not exist.'); // Notify player 2 if room code is invalid
        }
    });

	
	socket.on('updatePoints1', (data) => {
        //console.log(`Received points from player 2: ${data.player2points}`);
        io.emit('p1damage', { p1damage: data.player2points });
    });
	
	socket.on('updatePoints2', (data) => {
        console.log(`Received points from player 1: ${data.player1points}`);
        io.emit('p2damage', { p2damage: data.player1points });
    });
	
	
    console.log('A user connected');
	

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

console.log(`ello`);