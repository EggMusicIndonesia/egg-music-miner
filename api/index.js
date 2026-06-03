bot.command('tugas', async (ctx) => {
    // 1. Ambil SEMUA tugas dan pastikan unik
    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    
    // 2. Ambil riwayat user
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', ctx.from.id);
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];

    // 3. Filter tugas yang belum selesai DAN hapus duplikat (menggunakan Map)
    const unikTugas = [...new Map(semuaTugas.map(t => [t.song_id, t])).values()];
    const sisaTugas = unikTugas.filter(t => !selesaiIds.includes(t.song_id));

    if (sisaTugas.length === 0) return ctx.reply("Tugas harian sudah habis!");

    // 4. Kirim daftar yang sudah bersih
    const keyboard = {
        inline_keyboard: sisaTugas.map(t => [{
            text: `▶️ ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}` }
        }])
    };
    await ctx.reply("Pilih tugas:", { reply_markup: keyboard });
});
