bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // 1. Ambil data laporan DAN link lagu (misal kolomnya 'song_id')
    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin, song_id') // Tambahkan 'song_id' di sini
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    const tugas = laporan ? laporan.total_tugas_selesai : 0;
    const poin = laporan ? laporan.total_poin : 0;
    
    // 2. Ambil song_id dari database, gunakan default jika kosong
    const songId = laporan?.song_id || 'dQw4w9WgXcQ'; 

    const text = `📊 *Status Progres Anda*\n\n` + 
                 `✅ Tugas Selesai: ${tugas}\n` + 
                 `💰 Total Poin: ${poin} pts\n\n` + 
                 `Klik tombol di bawah untuk lanjut:`;

    // 3. Kirim link yang dinamis
    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{
                text: "▶️ Buka Player", 
                web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}&song_id=${songId}` }
            }]]
        }
    });
});
