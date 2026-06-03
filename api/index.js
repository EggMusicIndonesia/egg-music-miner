const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id;
    
    // 1. Ambil history tugas user dari Supabase
    const { data: progress } = await supabase
        .from('user_progress')
        .select('song_id')
        .eq('telegram_id', userId);

    const selesaiIds = progress ? progress.map(p => p.song_id) : [];

    // 2. Daftar semua tugas yang tersedia
    const semuaLagu = [
    { id: "oO6ZfaIMhog", title: "Lagu A" },
    { id: "EuuNyddQfJg", title: "Lagu B" },
    { id: "3Nuso040BfM", title: "Lagu C" },
    { id: "NUyNaPazni8", title: "Lagu D" },
    { id: "phbDRO_7vMs", title: "Lagu E" }
];

    // 3. FILTER: Hanya tampilkan lagu yang BELUM ada di selesaiIds
    const sisaTugas = semuaLagu.filter(lagu => !selesaiIds.includes(lagu.id));

    if (sisaTugas.length === 0) {
        await ctx.reply("Tugas harian sudah habis!");
    } else {
        const keyboard = sisaTugas.map(t => [{
            text: `▶️ Nonton ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.id}` }
        }]);
        await ctx.reply("Pilih lagu yang belum ditonton:", { 
            reply_markup: { inline_keyboard: keyboard } 
        });
    }
});

module.exports = webhookCallback(bot, 'http');
