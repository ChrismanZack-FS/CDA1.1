require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
// Configure CORS for cross-platform access
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3000", // Web development
			"http://localhost:19006", // Expo web
			"http://192.168.1.251:3001", // Expo mobile (adjust IP)
		],
		methods: ["GET", "POST"],
		credentials: true,
	},
	// Enable polling fallback for problematic networks
	transports: ["websocket", "polling"],
});
// Middleware
app.use(cors());
app.use(express.json());
// Basic HTTP endpoints
app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		connections: io.engine.clientsCount,
	});
});
// Socket.io connection handling
io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Send connection confirmation
	socket.emit("connection_confirmed", {
		socketId: socket.id,
		timestamp: new Date().toISOString(),
	});
	// Handle disconnection
	socket.on("disconnect", (reason) => {
		console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
	});
	// Basic ping/pong for connection testing
	socket.on("ping", (data) => {
		socket.emit("pong", {
			...data,
			serverTimestamp: new Date().toISOString(),
		});
	});
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Socket.io ready for connections`);
});
