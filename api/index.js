const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==========================================
// 1. LOGIKA BOT TELEGRAM
// ==========================================
bot.command('start', (ctx) => ctx.reply('Selamat datang di Egg Music Miner! Ketik /tugas untuk mulai.'));

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id;
    
    // Ambil data saldo poin dummy worker dari tabel 'workers'
    let { data: worker } = await supabase.from('workers').select('*').eq('telegram_id', userId).maybeSingle();
    
    // Jika user belum terdaftar di tabel workers, daftarkan otomatis
    if (!worker) {
        const { data: newWorker } = await supabase
            .from('workers')
            .insert([{ telegram_id: userId, username: ctx.from.username || '' }])
            .select()
            .single();
        worker = newWorker;
    }

    const poin = worker?.egg_points_balance || 0;
    
    // Ambil semua lagu dari tabel tanpa memfilter kolom 'is_active' yang belum ada
    const { data: tasks } = await supabase.from('music_tasks').select('*');
    let songId = 'oO6ZfaIMhog'; // Langsung arahkan ke ID video Surat Yang Tak Sampai Anda
    let taskId = 1;
    let songDuration = 30;

    if (tasks && tasks.length > 0) {
        const randomTask = tasks[0]; // Ambil data lagu pertama yang ada di tabel Anda
        songId = randomTask.stream_link || 'oO6ZfaIMhog'; 
        taskId = randomTask.id || 1;
        songDuration = randomTask.duration_seconds || 30;
    }

    // URL Web App diperbarui dengan menambahkan parameter &duration
    const webAppUrl = `https://project-g1fby.vercel.app/?telegram_id=${userId}&task_id=${taskId}&song_id=${songId}&duration=${songDuration}`;

    await ctx.reply(`📊 *Progres Anda*\n\n💰 Saldo: ${poin} Egg Points`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "▶️ MULAI MINING MUSIK", web_app: { url: webAppUrl } }]
            ]
        }
    });
});

// ==========================================
// 2. LOGIKA API (UNTUK TELEGRAM WEB APP & ANTI-CHEAT)
// ==========================================
module.exports = async (req, res) => {
    // Pengaturan CORS agar Frontend Web App bisa melakukan Fetch ke API ini
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // A. DETEKSI REQUEST DARI BOT TELEGRAM (Web-hook)
    if (req.body && req.body.update_id) {
        return bot.handleUpdate(req.body, res);
    }

    // B. DETEKSI REQUEST DARI WEB APP (API Anti-Cheat)
    const { path } = req.query;

    // Endpoint: Menandai Worker Mulai Dengerin Lagu (POST /api?path=start-task)
    if (req.method === 'POST' && path === 'start-task') {
        const { telegram_id, task_id } = req.body;

        const { data: existingLog } = await supabase
            .from('worker_logs')
            .select('*')
            .eq('telegram_id', telegram_id)
            .eq('task_id', task_id)
            .maybeSingle();

        if (existingLog && existingLog.status === 'COMPLETED') {
            return res.status(400).json({ message: "Kamu sudah menyelesaikan tugas ini hari ini!" });
        }

        // Hapus log lama jika ada yang berstatus 'STARTED' sebelumnya agar bersih
        await supabase.from('worker_logs').delete().eq('telegram_id', telegram_id).eq('task_id', task_id);

        const { error } = await supabase
            .from('worker_logs')
            .insert([{ telegram_id, task_id, start_time: new Date(), status: 'STARTED' }]);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: "Task dicatat di server. Selamat mendengarkan!" });
    }

    // Endpoint: Klaim Poin dengan Validasi Durasi Nyata (POST /api?path=claim-points)
    if (req.method === 'POST' && path === 'claim-points') {
        const { telegram_id, task_id } = req.body;

        const { data: log } = await supabase.from('worker_logs').select('*').eq('telegram_id', telegram_id).eq('task_id', task_id).maybeSingle();
        const { data: task } = await supabase.from('music_tasks').select('*').eq('id', task_id).maybeSingle();

        if (!log || log.status !== 'STARTED') {
            return res.status(400).json({ message: "Task belum diinisialisasi atau sudah diklaim." });
        }
        if (!task) {
            return res.status(404).json({ message: "Data lagu tidak ditemukan." });
        }

        // --- VALIDASI DURASI REAL-TIME (ANTI-CHEAT) ---
        const startTime = new Date(log.start_time);
        const currentTime = new Date();
        const waktuTungguDetik = Math.floor((currentTime - startTime) / 1000);

        // Toleransi delay jaringan 5 detik
        if (waktuTungguDetik < (task.duration_seconds - 5)) {
            return res.status(403).json({ 
                message: `Kecurangan terdeteksi! Kamu baru mendengarkan selama ${waktuTungguDetik} detik dari total ${task.duration_seconds} detik.` 
            });
        }

        // Update Log status pengerjaan
        await supabase.from('worker_logs').update({ status: 'COMPLETED', end_time: currentTime, claimed_at: currentTime }).eq('id', log.id);
        
        // Tambahkan koin dummy ke saldo worker
        const { data: worker } = await supabase.from('workers').select('egg_points_balance').eq('telegram_id', telegram_id).maybeSingle();
        const poinBaru = (worker?.egg_points_balance || 0) + task.points_reward;
        
        await supabase.from('workers').update({ egg_points_balance: poinBaru }).eq('telegram_id', telegram_id);

        return res.status(200).json({ message: `Sukses! Poin bertambah +${task.points_reward}.` });
    }

    return res.status(200).json({ status: "ready", message: "Server API & Bot Egg Music berjalan seimbang!" });
};
    
        // Tes pemicu deployment baru
