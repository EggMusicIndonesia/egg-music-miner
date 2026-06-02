const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('tugas', async (ctx) => {
    try {
        const { data: tasks, error } = await supabase.from('tasks').select('*');
        
        if (error) throw error;
        if (!tasks || tasks.length === 0) return ctx.reply("Data kosong.");
        
        let message = "🎵 *Daftar Tugas:*\n\n";
        tasks.forEach(t => { 
            // Menggunakan penanganan jika kolom tidak ditemukan
            message += `✅ *${t.title || 'No Title'}*\n`;
            message += `Platform: ${t.platform || '-'}\n`;
            message += `Poin: ${t.points || 0}\n`;
            message += `👉 ${t.url || '-'}\n\n`; 
        });
        
        ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (e) {
        // Ini akan memberitahu kita apa masalah sebenarnya di chat Telegram
        ctx.reply("Error: " + e.message);
    }
});

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
