const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. LOGIKA BOT TELEGRAM
bot.command('start', (ctx) => ctx.reply('Selamat datang di Egg Music Miner! Ketik /tugas untuk mulai.'));

bot.command('tugas', async (ctx) => {
    const userId = ctx.from.id;
    
    let { data: worker } = await supabase.from('workers').select('*').eq('telegram_id', userId).maybeSingle();
    
    if (!worker) {
        const { data: newWorker } = await supabase
            .from('workers')
            .insert([{ telegram_id: userId, username: ctx.from.username || '' }])
            .select()
            .single();
        worker = newWorker;
    }

    const poin = worker?.egg_points_balance || 0;
    const { data: tasks } = await supabase.from('music_tasks').select('*');
    
    let songId = 'oO6ZfaIMhog'; 
    let taskId = 1;
    let songDuration = 30;

    if (tasks && tasks.length > 0) {
        const randomTask = tasks[0];
        songId = randomTask.stream_link || 'oO6ZfaIMhog';
        taskId = randomTask.id || 1;
        songDuration = randomTask.duration_seconds || 30;
    }

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

// 2. LOGIKA API (UNTUK TELEGRAM WEB APP & ANTI-CHEAT)
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.body && req.body.update_id) {
        return bot.handleUpdate(req.body, res);
    }

    const { path } = req.query;

    if (req.method === 'POST' && path === 'start-task') {
        const { telegram_id, task_id } = req.body;
        
        // Jika teks kosong, berikan angka default agar tidak memicu crash NaN di Supabase
        const cleanTelegramId = parseInt(telegram_id, 10) || 0;
        const cleanTaskId = parseInt(task_id, 10) || 0;

        const { data: existingLog } = await supabase.from('worker_logs').select('*').eq('telegram_id', cleanTelegramId).eq('task_id', cleanTaskId).maybeSingle();

        if (existingLog && existingLog.status === 'COMPLETED') {
            return res.status(400).json({ message: "Kamu sudah menyelesaikan tugas ini hari ini!" });
        }

        await supabase.from('worker_logs').delete().eq('telegram_id', cleanTelegramId).eq('task_id', cleanTaskId);
        const { error } = await supabase.from('worker_logs').insert([
            { telegram_id: cleanTelegramId, task_id: cleanTaskId, start_time: new Date(), status: 'STARTED' }
        ]);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: "Task dicatat di server. Selamat mendengarkan!" });
    }

    if (req.method === 'POST' && path === 'claim-points') {
        const { telegram_id, task_id } = req.body;

        // Konversi paksa ke angka murni agar Supabase int8 tidak menolak
        const cleanTelegramId = parseInt(telegram_id, 10);
        const cleanTaskId = parseInt(task_id, 10);

        const { data: log } = await supabase.from('worker_logs').select('*').eq('telegram_id', cleanTelegramId).eq('task_id', cleanTaskId).maybeSingle();
        const { data: task } = await supabase.from('music_tasks').select('*').eq('id', cleanTaskId).maybeSingle();

        if (!log || log.status !== 'STARTED') {
            return res.status(400).json({ message: "Task belum diinisialisasi atau sudah diklaim." });
        }
        if (!task) {
            return res.status(404).json({ message: "Data lagu tidak ditemukan." });
        }

        const startTime = new Date(log.start_time);
        const currentTime = new Date();
        const waktuTungguDetik = Math.floor((currentTime - startTime) / 1000);

        if (waktuTungguDetik < (task.duration_seconds - 5)) {
            return res.status(403).json({ message: `Kecurangan terdeteksi! Kamu baru mendengarkan selama ${waktuTungguDetik} detik.` });
        }

        await supabase.from('worker_logs').update({ status: 'COMPLETED', end_time: currentTime, claimed_at: currentTime }).eq('id', log.id);
        
        const {data : worker } = await supabase . from ('workers' ) . select ('egg_points_balance' ) . eq ('telegram_id' , cleanTelegramId ) . maybeSingle () ; 
        const poinBaru = (worker ?. egg_points_balance || 0 ) + task . points_reward ;
        await supabase . from ('workers' ) . update ({egg_points_balance : poinBaru } ) . eq ('telegram_id' , cleanTelegramId ) ;

        return res.status(200).json({ message: `Sukses! Poin bertambah +${task.points_reward}.` });
    }

    return res.status(200).json({ status: "ready", message: "Server API & Bot Egg Music berjalan seimbang!" });
};
