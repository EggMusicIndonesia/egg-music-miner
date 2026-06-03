const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id.toString();

    // 1. Ambil data dari tabel laporan_airdrop (Mengambil nilai asli 24/2400)
    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .single();

    // Jika data tidak ditemukan, gunakan nilai default 0 agar tidak error
    const jumlahSelesai = laporan ? laporan.total_tugas_selesai : 0;
    const totalPoin = laporan ? laporan.total_poin : 0;

    // 2. Ambil daftar tugas yang belum dikerjakan (Filter berdasarkan user_progress)
    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
    
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];
    const sisaTugas = semuaTugas.filter(t => !selesaiIds.includes(t.song_id));

    // 3. Menampilkan status dengan format Markdown
    let message = `📊 *Status Progres Anda*\n`;
    message += `Tugas Selesai: ${jumlahSelesai}\n`;
    message += `Total Poin: ${totalPoin} pts\n\n`;

    if (sisaTugas.length === 0) {
        message += "Semua tugas sudah selesai!";
        await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
        message += "Pilih lagu yang belum ditonton:";
        const keyboard = {
            inline_keyboard: sisaTugas.map(t => [{
                text: `▶️ ${t.title}`,
                web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}` }
            }])
        };
        await ctx.reply(message, { parse_mode: 'Markdown', reply_markup: keyboard });
    }
});

module.exports = webhookCallback(bot, 'http');
