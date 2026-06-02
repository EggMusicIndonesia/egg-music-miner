const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('tugas', async (ctx) => {
    const { data: tasks, error } = await supabase.from('tasks').select('*');
    if (error) return ctx.reply("Gagal mengambil data.");
    let message = "🎵 *Daftar Tugas:*\n\n";
    tasks.forEach(t => { message += `✅ ${t.title}\n👉 ${t.url}\n\n`; });
    ctx.reply(message, { parse_mode: 'Markdown' });
});

// Ini bagian yang harus ada agar Vercel berjalan
module.exports = async (req, res) => {
    await bot.handleUpdate(req.body, res);
};
