import { WebSocket } from "ws";
import { pollSubscribers } from "./wsServer";

export const handleMessage = (ws: WebSocket, message: any) => {
    console.log(message);
    
    if (message.type === "subscribe") {
        console.log('inside')
        const { pollId } = message;

        if (!pollId) {
            ws.send(JSON.stringify({ error: "PollId required" }))
            return
        }

        if (!pollSubscribers.has(pollId)) {
            pollSubscribers.set(pollId, new Set())
        }

        pollSubscribers.get(pollId)!.add(ws)

        console.log(pollSubscribers);

        ws.send(JSON.stringify({ type: "subscribed", pollId }))
    }
}
