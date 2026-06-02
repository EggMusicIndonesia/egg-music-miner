const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Mengambil variabel dari Environment Variables di Vercel
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('tugas', async (ctx) => {
    try {
        // Mengambil data dari tabel 'tasks' di Supabase
        const { data: tasks, error } = await supabase.from('tasks').select('*');
        
        if (error) throw error;
        if (!tasks || tasks.length === 0) return ctx.reply("Belum ada tugas tersedia.");
        
        let message = "🎵 *Daftar Tugas Listen to Earn:*\n\n";
        tasks.forEach(t => { 
            message += `✅ *${t.title}*\nPlatform: ${t.platform}\nPoin: ${t.points}\n👉 ${t.url}\n\n`; 
        });
        
        ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (e) {
        console.error(e);
        ctx.reply("Gagal mengambil data tugas.");
    }
});

// Handler utama untuk Vercel
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }
        return res.status(200).send('Bot is running');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
