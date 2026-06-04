const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Penanganan Bot
bot.start(async (ctx) => {
    await ctx.reply("Selamat datang di Egg Music Miner!", {
        reply_markup: {
            inline_keyboard: [[{ text: "▶️ MULAI MINING", web_app: { url: 'https://project-g1fby.vercel.app' } }]]
        }
    });
});

// Penanganan API (Tombol Mining)
module.exports = async (req, res) => {
    // Jika ada update dari Telegram (Webhook)
    if (req.body && req.body.update_id) {
        await bot.handleUpdate(req.body, res);
        return;
    }

    // Jika ada request dari Web App
    if (req.method === 'POST') {
        const { telegram_id, task_id } = req.body;
        
        // Ambil lagu dari Supabase
        const { data: task } = await supabase
            .from('music_tasks')
            .select('stream_link, title')
            .eq('id', task_id)
            .single();

        // Catat aktivitas
        await supabase.from('worker_logs').insert([{ telegram_id, task_id, status: 'mining' }]);

        return res.status(200).json(task);
    }

    res.status(200).send('Bot & API Active');
};
