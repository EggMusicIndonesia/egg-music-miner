const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Tampilkan angka langsung ke chat, tidak perlu buka Web App untuk lihat data
    const text = `📊 *Status Progres Anda*\n\n` +
                 `✅ Tugas Selesai: ${laporan ? laporan.total_tugas_selesai : 0}\n` +
                 `💰 Total Poin: ${laporan ? laporan.total_poin : 0} pts\n\n` +
                 `Tekan tombol untuk buka player:`;

    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{
                text: "▶️ Buka Player",
                web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}` }
            }]]
        }
    });
});

module.exports = webhookCallback(bot, 'http');
