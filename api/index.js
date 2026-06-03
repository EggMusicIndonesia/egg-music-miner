const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // Ambil data dari tabel laporan_airdrop
    const { data, error } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Pastikan nilai angka tidak hilang
    const tugas = data ? data.total_tugas_selesai : 0;
    const poin = data ? data.total_poin : 0;

    let message = `📊 *Status Progres Anda*\n`;
    message += `Tugas Selesai: ${tugas}\n`;
    message += `Total Poin: ${poin} pts\n\n`;
    message += `Klik tombol di bawah untuk mengerjakan tugas:`;

    const keyboard = {
        inline_keyboard: [[{
            text: "▶️ Buka Player & Kerjakan Tugas",
            web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}` }
        }]]
    };

    await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: keyboard });
});

module.exports = webhookCallback(bot, 'http');
