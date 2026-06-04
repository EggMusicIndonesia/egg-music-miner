const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Penanganan Bot
bot.start((ctx) => ctx.reply("Selamat datang di Egg Music Miner!", {
    reply_markup: { inline_keyboard: [[{ text: "▶️ MULAI MINING", web_app: { url: 'https://project-g1fby.vercel.app' } }]] }
}));

bot.command('tugas', async (ctx) => {
    const { data } = await supabase.from('user_progress').select('points').eq('telegram_id', ctx.from.id).single();
    ctx.reply(`📊 Saldo Anda: ${data ? data.points : 0} Egg Points`);
});

// Penanganan API
module.exports = async (req, res) => {
    if (req.body && req.body.update_id) {
        return bot.handleUpdate(req.body, res);
    }
    
    // Logic dasar untuk menerima klik dari Web App
    if (req.method === 'POST') {
        // Ambil ID video dari tabel 'music_tasks' dengan id = 1
        const { data } = await supabase.from('music_tasks').select('stream_link').eq('id', 1).single();
        return res.status(200).json({ stream_link: data ? data.stream_link : "dQw4w9WgXcQ" });
}
