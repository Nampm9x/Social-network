import express from "express";
import connectDatabase from "./configs/database";
import routes from "./routes/index.route";
import { errorMiddleware } from "./utils/error";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { onConnection } from "./socket";
import cookieParser from "cookie-parser";

connectDatabase();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use("/api", routes);
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Error Handling
app.use(errorMiddleware);

// Socket.io Setup
const io = new Server(server, {
  cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
  }
})

app.set("socketio", io);
io.on("connection", (socket) => onConnection(socket, io));

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
