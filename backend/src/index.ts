import dotenv from "dotenv";
dotenv.config()

import express from "express";
import cors from "cors";
import pollRoutes from "./routes/poll.routes";
import authRoutes from "./routes/auth.routes";
import voteRoutes from "./routes/vote.routes";
import { createServer } from "http";
import { setupWebSocketServer } from "./ws/wsServer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/v1/polls", pollRoutes);
app.use("/api/v1/votes", voteRoutes);

const server = createServer(app)
setupWebSocketServer(server)

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
