const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust as per your client-side setup
    },
});

const rooms = {};


// Function to generate random virus positions
function generateVirusPositions() {
    const positions = [];
    for (let i = 0; i < 4; i++) { // Generate 4 virus positions
        positions.push({
            x: Math.floor(Math.random() * 8), // Assuming width is 8
            y: Math.floor(Math.random() * 10) // Assuming max height is 10
        });
    }
    return positions;
}

const virusPositions = generateVirusPositions();

io.on('connection', (socket) => {
	
	
	
	

		socket.on('join room', (roomId) => {
		console.log(roomId);
		
        if (rooms[roomId] && rooms[roomId].length < 2) {
            rooms[roomId].push(socket.id);
            socket.join(roomId);
            socket.emit('joined room', roomId);
			socket.emit('joinedRoomSuccessfully');
            if (rooms[roomId].length === 2) {
                io.to(roomId).emit('start game');
            }
        } else {
			
            socket.emit('roomDoesNotExist');
        }
    });
	
	
	
	
	
	
	socket.on('create room', () => {
        const roomId = Math.floor(Math.random() * 10) + 1;
        rooms[roomId] = [socket.id];
        socket.join(roomId);
        socket.emit('room created', roomId);
		//console.log(roomId);
    });
	
	
	
	
	
	
    console.log('A user connected');

    // Send the pre-generated virus positions to the connected client
    socket.emit('virusPositions', virusPositions);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
