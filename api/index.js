const { Telegraf } = require('telegraf');

// Inisialisasi Bot menggunakan Token Resmi Anda
const bot = new Telegraf('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');

// Daftar lagu dari database/manually
const daftarLagu = [
    { nama: "Lagu 1 🎵", song_id: "oO6ZfaIMhog" },
    { nama: "Lagu 2 🎵", song_id: "EuuNyddQfJg" },
    { nama: "Lagu 3 🎵", song_id: "3Nuso040BfM" }
];

bot.start((ctx) => {
    ctx.reply('Selamat datang di Egg Music Miner! Ketik /tugas untuk melihat daftar tugas menonton lagu.');
});

bot.command('tugas', (ctx) => {
    const userId = ctx.from.id; // Mengambil ID Asli Telegram User (Contoh: 7659693582)
    const username = ctx.from.username || 'guest';

    // Membuat tombol inline secara dinamis dengan menyuntikkan ID & Username ke URL
    const tombol = daftarLagu.map(lagu => [
        {
            text: `▶️ Buka Music Miner (ID: ${lagu.song_id})`,
            web_app: {
                // PERBAIKAN MUTLAK: Menyuntikkan telegram_id secara benar agar dibaca oleh index.html
                url: `https://project-g1fby.vercel.app/?song_id=${lagu.song_id}&telegram_id=${userId}&username=${username}`
            }
        }
    ]);

    ctx.reply('Silakan pilih lagu yang ingin ditonton untuk menambang poin:', {
        reply_markup: {
            inline_keyboard: tombol
        }
    });
});

// Export untuk kebutuhan Vercel Serverless Function
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
        }
        res.status(200).send('Bot berjalan dengan baik!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi eror pada komponen bot.');
    }
};
