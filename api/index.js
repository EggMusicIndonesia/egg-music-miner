const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // Ambil data langsung dari Supabase
    const { data: laporan, error } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Pastikan nilai tidak kosong
    const tugas = laporan ? laporan.total_tugas_selesai : 0;
    const poin = laporan ? laporan.total_poin : 0;

    // Pesan yang langsung menampilkan angka (seperti yang Anda inginkan)
    let message = `📊 *Status Progres Anda*\n`;
    message += `Tugas Selesai: ${tugas}\n`;
    message += `Total Poin: ${poin} pts\n\n`;
    message += `Klik tombol untuk mengerjakan tugas:`;

    // Tombol tetap ada agar Anda bisa membuka video
    const keyboard = {
        inline_keyboard: [[{
            text: "▶️ Kerjakan Tugas",
            web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}` }
        }]]
    };

    await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: keyboard });
});

module.exports = webhookCallback(bot, 'http');
