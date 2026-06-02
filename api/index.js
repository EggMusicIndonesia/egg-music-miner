const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Logic /tugas
bot.command('tugas', async (ctx) => {
    const { data: tasks, error } = await supabase.from('tasks').select('*');
    if (error) return ctx.reply("Gagal mengambil tugas.");
    
    let message = "🎵 Daftar Tugas:\n\n";
    tasks.forEach(t => {
        message += `✅ *${t.title}*\nPlatform: ${t.platform}\n👉 ${t.url}\n\n`;
    });
    ctx.reply(message, { parse_mode: 'Markdown' });
});

// Ini bagian krusial agar Vercel mendeteksi fungsi
module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body, res);
    } catch (err) {
        console.error(err);
    }
    return res.status(200).send('OK');
};
