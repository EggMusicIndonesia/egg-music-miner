const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('tugas', async (ctx) => {
    try {
        console.log("Fetching from Supabase...");
        const { data, error } = await supabase.from('tasks').select('*');
        
        if (error) throw error;
        if (!data || data.length === 0) return ctx.reply("Tabel tugas kosong.");
        
        let message = "Daftar Tugas:\n\n";
        data.forEach(t => { 
            // Menggunakan teks biasa tanpa simbol Markdown agar tidak error
            message += `✅ ${t.title || 'Tanpa Judul'}\nLink: ${t.url || '-'}\n\n`; 
        });
        
        ctx.reply(message); // Hapus { parse_mode: 'Markdown' }
    } catch (e) {
        ctx.reply("Error: " + e.message);
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
