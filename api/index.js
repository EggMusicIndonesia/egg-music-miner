const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Bot dan Supabase
const bot = new Telegraf(process.env.BOT_TOKEN || '7581298068:AAELv84N3UfLpbe9o1V_7Z9B4gGCHl93mYQ');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('start', (ctx) => {
    ctx.reply("Selamat datang di Egg Music Miner! Ketik /tugas untuk melihat daftar lagu.");
});

bot.command('tugas', async (ctx) => {
    try {
        // Mengambil song_id dan platform dari tabel tasks
        const { data, error } = await supabase.from('tasks').select('song_id, platform');
        
        if (error || !data || data.length === 0) {
            return ctx.reply("Gagal mengambil data dari database atau data kosong.");
        }

        // Membuat tombol dinamis berdasarkan song_id di database
        const keyboard = data.map(song => [{
            text: `🎵 Putar Lagu (ID: ${song.song_id})`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${song.song_id}` }
        }]);

        ctx.reply("Klik tombol di bawah untuk mulai menambang:", {
            reply_markup: { inline_keyboard: keyboard }
        });
    } catch (err) {
        ctx.reply("Terjadi kesalahan sistem: " + err.message);
    }
});

// Handler untuk Vercel Serverless
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
        }
        res.status(200).send('OK');
    } catch (err) {
        res.status(500).send(err.message);
    }
};
