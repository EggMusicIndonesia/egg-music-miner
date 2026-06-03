bot.command('tugas', async (ctx) => {
    const { data, error } = await supabase.from('tasks').select('song_id, title');
    if (error || !data) return ctx.reply("Gagal memuat tugas.");

    const keyboard = data.map(song => [{
        text: `🎵 ${song.title || song.song_id}`,
        web_app: { url: `https://project-g1fby.vercel.app/?song_id=${song.song_id}` }
    }]);

    ctx.reply("Pilih lagu untuk menambang:", {
        reply_markup: { inline_keyboard: keyboard }
    });
});
