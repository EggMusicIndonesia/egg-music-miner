const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.start((ctx) => ctx.reply("Selamat datang di Egg Music Miner!", {
    reply_markup: { inline_keyboard: [[{ text: "▶️ MULAI MINING", web_app: { url: 'https://project-g1fby.vercel.app' } }]] }
}));

bot.command('tugas', async (ctx) => {
    const { data } = await supabase.from('user_progress').select('points').eq('telegram_id', ctx.from.id).single();
    ctx.reply(`📊 Saldo Anda: ${data ? data.points : 0} Egg Points`);
});

module.exports = async (req, res) => {
    if (req.body && req.body.update_id) return bot.handleUpdate(req.body, res);

    if (req.method === 'POST') {
        const { telegram_id } = req.body;
        
        // Cek user, jika ada update poin, jika belum ada insert baru
        const { data: user } = await supabase.from('user_progress').select('points').eq('telegram_id', telegram_id).single();
        if (user) {
            await supabase.from('user_progress').update({ points: user.points + 10 }).eq('telegram_id', telegram_id);
        } else {
            await supabase.from('user_progress').insert([{ telegram_id, points: 10 }]);
        }

        return res.status(200).json({ status: "success", points_added: 10 });
    }
    res.status(200).send("Bot & API Aktif");
};
