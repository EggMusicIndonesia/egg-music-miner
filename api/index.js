bot.command('tugas', async (ctx) => {
    const userId = String(ctx.from.id);

    // Ambil data (tambahkan timestamp agar tidak di-cache oleh Supabase)
    const { data: laporan } = await supabase
        .from('laporan_airdrop')
        .select('total_tugas_selesai, total_poin')
        .eq('telegram_id', userId)
        .order('total_tugas_selesai', { ascending: false })
        .limit(1)
        .maybeSingle();

    const tugas = laporan ? laporan.total_tugas_selesai : 0;
    const poin = laporan ? laporan.total_poin : 0;

    // Teks baru (biar Vercel tahu ini update)
    const text = `📊 *UPDATE PROGRES ANDA*\n\n` +
                 `✅ Tugas Selesai: ${tugas}\n` +
                 `💰 Total Poin: ${poin} pts\n\n` +
                 `--------------------------\n` +
                 `Silakan klik tombol di bawah untuk lanjut:`;

    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{
                text: "▶️ Buka Player",
                web_app: { url: `https://project-g1fby.vercel.app/?telegram_id=${userId}` }
            }]]
        }
    });
});
