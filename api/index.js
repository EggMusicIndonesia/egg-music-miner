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

        return ctx.reply("Klik tombol di bawah untuk mulai menambang:", {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Buka Music Miner",
                        web_app: { url: "https://project-g1fby.vercel.app/" }
                    }
                ]]
            }
        });
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
