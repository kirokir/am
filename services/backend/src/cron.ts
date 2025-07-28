import cron from 'node-cron';
import { supabaseAdmin } from './lib/supabase';
import { generateNudgeForCouple } from './nudge_engine';
import { Server } from 'socket.io';

export function startNudgeCronJob(io: Server) {
    // Run every 2 hours
    console.log('[Cron] Nudge Engine cron job scheduled.');
    cron.schedule('0 */2 * * *', async () => {
        console.log('[Cron] Running scheduled Nudge Engine analysis...');
        
        const { data: distinctCouples, error } = await supabaseAdmin
            .from('chats')
            .select('couple_id', { count: 'exact', head: false })
            .neq('couple_id', null);

        if (error) {
            console.error('[Cron] Error fetching distinct couples:', error);
            return;
        }

        if (distinctCouples) {
            for (const { couple_id } of distinctCouples) {
                if (couple_id) {
                    await generateNudgeForCouple(couple_id, io);
                }
            }
        }
        console.log('[Cron] Scheduled Nudge Engine analysis complete.');
    });
}