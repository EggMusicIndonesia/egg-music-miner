bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // 1. Selalu ambil data TERBARU dari database setiap kali perintah diketik
    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin, song_id')
        .eq('telegram_id', userId)
        .maybeSingle();

    const tugas = laporan?.total_tugas_selesai || 0;
    const poin = laporan?.total_poin || 0;
    
    // 2. Ambil song_id TERBARU dari kolom database
    const currentSongId = laporan?.song_id || 'dQw4w9WgXcQ'; 

    // 3. Masukkan ID TERBARU ke dalam URL Web App
    const webAppUrl = `https://project-g1fby.vercel.app/?telegram_id=${userId}&song_id=${currentSongId}`;

    const text = `📊 *Status Progres Anda*\n\n✅ Tugas: ${tugas}\n💰 Poin: ${poin} pts`;

    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: "▶️ Buka Player", web_app: { url: webAppUrl } }
            ]]
        }
    });
});
