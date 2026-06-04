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
        return res.status(200).json({ status: "ok" });
    }
    
    res.status(200).send("Bot & API Aktif");
};
