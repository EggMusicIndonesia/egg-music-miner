const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('tugas', async (ctx) => {
    try {
        // Menambahkan log ke console untuk melihat apakah request masuk
        console.log("Fetching from Supabase...");
        
        const { data, error } = await supabase.from('tasks').select('*');
        
        if (error) {
            console.error("Supabase Error:", error);
            return ctx.reply("Error Supabase: " + error.message);
        }
        
        if (!data || data.length === 0) return ctx.reply("Tabel kosong.");
        
        let message = "🎵 *Daftar Tugas:*\n\n";
        data.forEach(t => { 
            message += `✅ ${t.title || 'Tanpa Judul'}\n👉 ${t.url || '-'}\n\n`; 
        });
        
        ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (e) {
        ctx.reply("Error Sistem: " + e.message);
    }
});

module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        return res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error');
    }
};
