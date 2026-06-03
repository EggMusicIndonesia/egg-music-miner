bot.command('tugas', async (ctx) => {
    // 1. Ambil tugas
    const { data: semuaTugas } = await supabase.from('tasks').select('song_id, title');
    const { data: progress } = await supabase.from('user_progress').select('song_id').eq('telegram_id', ctx.from.id);
    
    // 2. Filter ID yang sudah dikerjakan
    const selesaiIds = progress ? progress.map(p => p.song_id) : [];
    const belumSelesai = semuaTugas.filter(t => !selesaiIds.includes(t.song_id));

    // 3. Hapus duplikat secara manual di kode agar rapi
    const uniqueTasks = Array.from(new Set(belumSelesai.map(a => a.song_id)))
        .map(id => belumSelesai.find(a => a.song_id === id));

    if (uniqueTasks.length === 0) return ctx.reply("Semua tugas selesai!");

    // 4. Buat keyboard
    const keyboard = {
        inline_keyboard: uniqueTasks.map(t => [{
            text: `▶️ ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.song_id}` }
        }])
    };
    await ctx.reply("Pilih tugas:", { reply_markup: keyboard });
});
