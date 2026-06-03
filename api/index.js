const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Token baru Anda sudah dimasukkan di sini
const bot = new Telegraf('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('start', (ctx) => {
    return ctx.reply("Selamat datang di Egg Music Miner! Ketik /tugas untuk melihat daftar lagu.");
});

bot.command('tugas', async (ctx) => {
    try {
        const { data, error } = await supabase.from('tasks').select('song_id');
        
        if (error || !data || data.length === 0) {
            return ctx.reply("Gagal mengambil data dari database atau data kosong.");
        }

        const keyboard = data.map(song => [{
            text: `▶️ Buka Music Miner (ID: ${song.song_id})`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${song.song_id}` }
        }]);

        return ctx.reply("Klik tombol di bawah untuk mulai menambang:", {
            reply_markup: { inline_keyboard: keyboard }
        });
    } catch (err) {
        return ctx.reply("Terjadi kesalahan sistem: " + err.message);
    }
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
        }
        return res.status(200).send('OK');
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
