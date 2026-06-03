const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    try {
        const { data: semuaTugas, error: taskErr } = await supabase.from('tasks').select('song_id, title');
        const { data: progress, error: progErr } = await supabase.from('user_progress').select('song_id').eq('telegram_id', ctx.from.id);
        
        if (taskErr || progErr) throw new Error("Gagal ambil data database");

        const selesaiIds = progress ? progress.map(p => p.song_id) : [];
        const sisaTugas = semuaTugas.filter(t => !selesaiIds.includes(t.song_id));

        if (sisaTugas.length === 0) return ctx.reply("Semua tugas sudah selesai!");

        const keyboard = {
            inline_keyboard: sisaTugas.map(t => [{
                text: `▶️ ${t.title}`,
                web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}` }
            }])
        };
        await ctx.reply("Pilih tugas:", { reply_markup: keyboard });
    } catch (e) {
        ctx.reply("Error sistem: " + e.message);
    }
});

module.exports = webhookCallback(bot, 'http');
