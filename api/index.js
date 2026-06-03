const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // Query dengan penanganan error agar tidak asal kirim angka 0
    const { data: laporan, error } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Jika terjadi error atau data kosong dari Supabase, 
    // kita beri pesan peringatan agar Anda tidak kaget
    if (error || !laporan) {
        return ctx.reply("⚠️ *Sedang sinkronisasi data...* \nSilakan coba lagi dalam beberapa detik. Server sedang memuat progres Anda.");
    }

    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
    
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];
    const sisaTugas = semuaTugas ? semuaTugas.filter(t => !selesaiIds.includes(t.song_id)) : [];

    let message = `📊 *Status Progres Anda*\n`;
    message += `Tugas Selesai: ${laporan.total_tugas_selesai}\n`;
    message += `Total Poin: ${laporan.total_poin} pts\n\n`;

    if (sisaTugas.length === 0) {
        message += "Semua tugas sudah selesai!";
        await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
        message += "Pilih lagu yang belum ditonton:";
        const keyboard = {
            inline_keyboard: sisaTugas.slice(0, 5).map(t => [{
                text: `▶️ ${t.title}`,
                web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}&telegram_id=${userId}` }
            }])
        };
        await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: keyboard });
    }
});

module.exports = webhookCallback(bot, 'http');
