const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id;
    // Query Supabase
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];

    const semuaLagu = [
        { id: "oO6ZfaIMhog", title: "Lagu A" },
        { id: "EuuNyddQfJg", title: "Lagu B" },
        { id: "3Nuso040BfM", title: "Lagu C" }
    ];

    const sisaTugas = semuaLagu.filter(lagu => !selesaiIds.includes(lagu.id));

    if (sisaTugas.length === 0) {
        await ctx.reply("Tugas habis untuk hari ini!");
    } else {
        const keyboard = sisaTugas.map(t => [{
            text: `▶️ Nonton ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.id}` }
        }]);
        await ctx.reply("Pilih lagu:", { reply_markup: { inline_keyboard: keyboard } });
    }
});

// Ini bagian krusial agar bot jalan di Vercel
module.exports = webhookCallback(bot, 'http');
