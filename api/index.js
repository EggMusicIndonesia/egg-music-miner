const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('start', (ctx) => ctx.reply('Selamat datang di Egg Music Miner! Ketik /tugas untuk mulai.'));

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);
    const { data: user } = await supabase.from('laporan_airdrop').select('*').eq('telegram_id', userId).maybeSingle();
    
    const tugas = user?.total_tugas_selesai || 0;
    const poin = user?.total_poin || 0;
    const songId = user?.song_id || 'dQw4w9WgXcQ';

    const webAppUrl = `https://project-g1fby.vercel.app/?telegram_id=${userId}&song_id=${songId}`;

    await ctx.reply(`📊 *Progres Anda*\n\n✅ Tugas: ${tugas}\n💰 Poin: ${poin}`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: "▶️ MULAI MINING", web_app: { url: webAppUrl } }]]
        }
    });
});

module.exports = (req, res) => bot.handleUpdate(req.body, res);
