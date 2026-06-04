const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
    // 1. Tangani Webhook Bot
    if (req.body && req.body.update_id) {
        return bot.handleUpdate(req.body, res);
    }

    // 2. Tangani Mining dari Web App
    if (req.method === 'POST') {
        const { telegram_id, task_id } = req.body;
        
        // Ambil data lagu
        const { data: task } = await supabase.from('music_tasks').select('stream_link, title').eq('id', task_id).single();
        
        // Update saldo & Log
        await supabase.from('user_progress').upsert({ telegram_id, points: 10 }, { onConflict: 'telegram_id' });
        await supabase.from('worker_logs').insert([{ telegram_id, task_id, status: 'completed' }]);
        
        return res.status(200).json(task || { stream_link: "dQw4w9WgXcQ", title: "Default Music" });
    }
};
