const { Bot, webhookCallback } = require('grammy');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);
    
    // Kirim pesan simpel dengan tombol yang membawa ID pengguna
    await ctx.reply(`📊 *Status Progres & Tugas*\n\nKlik tombol di bawah untuk melihat data asli dan mengerjakan tugas Anda:`, {
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
