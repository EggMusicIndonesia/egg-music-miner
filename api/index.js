const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id;

    // 1. Ambil daftar SEMUA lagu yang ada di database (Anggap Anda punya tabel bernama 'tasks')
    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    
    // 2. Ambil daftar lagu yang SUDAH dikerjakan user
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];

    // 3. Filter: Ambil yang BELUM dikerjakan
    const sisaTugas = semuaTugas.filter(tugas => !selesaiIds.includes(tugas.song_id));

    // 4. Randomize: Acak urutan lagu yang tersisa
    const acakTugas = sisaTugas.sort(() => Math.random() - 0.5);

    if (acakTugas.length === 0) {
        await ctx.reply("Tugas harian sudah habis untuk hari ini!");
    } else {
        const keyboard = acakTugas.map(t => [{
            text: `▶️ ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}` }
        }]);
        await ctx.reply("Pilih lagu yang belum ditonton:", { reply_markup: { inline_keyboard: keyboard } });
    }
});

module.exports = webhookCallback(bot, 'http');
