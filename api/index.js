// Contoh filter tugas di sisi Bot
bot.onText(/\/tugas/, async (msg) => {
    const userId = msg.from.id;
    // 1. Ambil daftar tugas yang sudah selesai dari tabel user_progress
    const selesai = await getSelesai(userId); // Query SELECT song_id WHERE telegram_id = userId
    
    // 2. Daftar semua tugas
    const semuaTugas = [
        { id: "oO6ZfaIMhog", judul: "Lagu A" },
        { id: "EuuNyddQfJg", judul: "Lagu B" }
    ];
    
    // 3. Hanya tampilkan yang belum selesai
    const tugasBaru = semuaTugas.filter(t => !selesai.includes(t.id));
    
    // 4. Kirim ke user
    const kb = tugasBaru.map(t => [{
        text: `▶️ ${t.judul}`,
        web_app: { url: `https://project-g1fby.vercel.app/?song_id=${t.id}` }
    }]);
    
    bot.sendMessage(msg.chat.id, tugasBaru.length > 0 ? "Pilih lagu:" : "Habis!", { reply_markup: { inline_keyboard: kb } });
});
