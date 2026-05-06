import cron from "node-cron";
import { prisma } from "../db";


export const startPollExpiryCron = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const result = await prisma.poll.updateMany({
                where: {
                    isActive: true,
                    expiresAt: { lt: new Date() }
                },
                data: { isActive: false }
            })
            if(result.count > 0){
                console.log(`[CRON] Closed ${result.count} expired poll(s)`);
            }
        }
        catch(err){
            console.error(`[CRON] Error closing expired polls: ${err instanceof Error ? err.message : err}`);
        }
    })

    console.log(`[CRON] Poll expiry job scheduled`);
}
