const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.start(async (ctx) => {
    const { id, username } = ctx.from;
    const { data } = await supabase.from('users').select('*').eq('telegram_id', id).single();
    
    if (!data) {
        await supabase.from('users').insert([{ telegram_id: id, username }]);
        ctx.reply('Selamat datang di Egg Music Miner! Poin Anda mulai dihitung.');
    } else {
        ctx.reply('Halo lagi! Tambang terus Egg Music Anda!');
    }
});
bot.command('tugas', async (ctx) => {
    const { data: tasks, error } = await supabase.from('tasks').select('*');
    
    if (error) {
        ctx.reply("Gagal mengambil daftar tugas.");
        return;
    }

    let message = "🎵 **Daftar Tugas Listen/Watch to Earn:**\n\n";
    tasks.forEach(t => {
        message += `✅ *${t.title}*\nPlatform: ${t.platform}\nPoin: ${t.points}\nLink: ${t.url}\n\n`;
    });
    
    ctx.reply(message, { parse_mode: 'Markdown' });
});
module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};
