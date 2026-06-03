// Contoh update logika di api/index.js
bot.onText(/\/tugas/, async (msg) => {
    const userId = msg.from.id;

    // 1. Ambil semua tugas yang sudah dikerjakan user dari Supabase
    const { data: progress } = await supabase
        .from('user_progress')
        .select('song_id')
        .eq('telegram_id', userId);

    const selesaiIds = progress ? progress.map(p => p.song_id) : [];

    // 2. Daftar semua lagu yang tersedia
    const semuaLagu = [
        { id: "oO6ZfaIMhog", title: "Lagu A" },
        { id: "EuuNyddQfJg", title: "Lagu B" },
        { id: "3Nuso040BfM", title: "Lagu C" }
    ];

    // 3. Filter: Hanya ambil lagu yang ID-nya tidak ada di selesaiIds
    const sisaTugas = semuaLagu.filter(lagu => !selesaiIds.includes(lagu.id));

    if (sisaTugas.length === 0) {
        bot.sendMessage(msg.chat.id, "Tugas harian sudah habis. Kembali lagi besok!");
    } else {
        const kb = sisaTugas.map(t => [{
            text: `▶️ ${t.title}`,
            web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.id}` }
        }]);
        bot.sendMessage(msg.chat.id, "Pilih lagu yang belum ditonton:", {
            reply_markup: { inline_keyboard: kb }
        });
    }
});
