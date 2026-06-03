const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot('8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient('https://tawqbyyzckcdmdluhxis.supabase.co', 'sb_publishable_bRnN4OTn2ToANaPAiOiDpA__oFt8X9o');

bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // 1. Coba ambil dari laporan_airdrop
    let { data: laporan, error } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .maybeSingle();

    // 2. Fallback: Jika error atau data kosong, ambil hitungan manual dari user_progress
    // Ini menjamin angka 0 TIDAK AKAN PERNAH MUNCUL selama ada data di user_progress
    let jumlahSelesai = laporan?.total_tugas_selesai || 0;
    let totalPoin = laporan?.total_poin || 0;

    if (jumlahSelesai === 0) {
        const { data: progressBackup } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
        if (progressBackup && progressBackup.length > 0) {
            jumlahSelesai = progressBackup.length;
            totalPoin = jumlahSelesai * 10;
        }
    }

    // 3. Ambil sisa tugas
    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', userId);
    
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];
    const sisaTugas = semuaTugas.filter(t => !selesaiIds.includes(t.song_id));

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
