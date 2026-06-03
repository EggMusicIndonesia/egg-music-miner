const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // 1. Ambil data progres
    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    const tugas = laporan ? laporan.total_tugas_selesai : 0;
    const poin = laporan ? laporan.total_poin : 0;

    // 2. Teks ini yang akan muncul di Telegram
    const text = `📊 *Status Progres Anda*\n\n` +
                 `✅ Tugas Selesai: ${tugas}\n` +
                 `💰 Total Poin: ${poin} pts\n\n` +
                 `Klik tombol di bawah untuk mengerjakan tugas:`;

    // 3. Kirim pesan dengan angka tersebut
    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{
                text: "▶️ Buka Player & Kerjakan Tugas",
                web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}` }
            }]]
        }
    });
});

module.exports = webhookCallback(bot, 'http');
