const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.start(async (ctx) => {
    await ctx.reply("Selamat datang di Egg Music Miner!", {
        reply_markup: { inline_keyboard: [[{ text: "▶️ MULAI MINING", web_app: { url: 'https://project-g1fby.vercel.app' } }]] }
    });
});

module.exports = async (req, res) => {
    if (req.body && req.body.update_id) {
        await bot.handleUpdate(req.body, res);
        return;
    }

    if (req.method === 'POST') {
        const { telegram_id, task_id } = req.body;
        
        // 1. Ambil info lagu
        const { data: task } = await supabase.from('music_tasks').select('stream_link, title').eq('id', task_id).single();

        // 2. Catat log tugas
        await supabase.from('worker_logs').insert([{ telegram_id, task_id, status: 'mining' }]);

        // 3. Tambah Poin (Update saldo di user_progress)
        const { data: user } = await supabase.from('user_progress').select('points').eq('telegram_id', telegram_id).single();
        
        if (user) {
            await supabase.from('user_progress').update({ points: user.points + 10 }).eq('telegram_id', telegram_id);
        } else {
            await supabase.from('user_progress').insert([{ telegram_id, points: 10 }]);
        }

        return res.status(200).json(task);
    }
};
