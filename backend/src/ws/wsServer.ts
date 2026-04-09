import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { handleMessage } from "./wsHandler";

export const pollSubscribers = new Map<string, Set<WebSocket>>();

export const setupWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
        console.log('Client connected');

        ws.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleMessage(ws, message)
            }
            catch {
                ws.send(JSON.stringify({ error: "Invalid message format" }))
            }
        })

        ws.on("close", () => {
            //  remove subscriber from all polls
            pollSubscribers.forEach((subscribers) => {
                subscribers.delete(ws)
            })
            console.log("Client disconnected");
        })
    })

    return wss;
}