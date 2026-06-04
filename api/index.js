const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. INISIALISASI TELEGRAF BOT & SUPABASE
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '8883262227:AAHhDLF-qHadlEm-7CKYzDVtXsiI1Ln74WA');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const webAppUrl = 'https://project-g1fby.vercel.app';

bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const username = ctx.from.username || 'User';

    // Cek atau daftarkan otomatis user di tabel workers saat start bot
    const { data: worker } = await supabase.from('workers').select('*').eq('telegram_id', telegramId).maybeSingle();
    if (!worker) {
        await supabase.from('workers').insert([{ telegram_id: telegramId, egg_points_balance: 0 }]);
    }

    await ctx.replyWithMarkdownV2(
        `Selamat datang *${username}* di *Egg Music Miner*\\!\n\n` +
        `Klik tombol di bawah ini untuk membuka dashboard mining musik Anda\\.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "▶️ MULAI MINING MUSIK", web_app: { url: webAppUrl } }]
                ]
            }
        }
    );
});

bot.command('tugas', async (ctx) => {
    await ctx.reply(
        `📊 *Progres Anda*\n💰 Saldo: 0 Egg Points`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "▶️ MULAI MINING MUSIK", web_app: { url: webAppUrl } }]
                ]
            }
        }
    );
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

        const cleanTelegramId = parseInt(telegram_id, 10) || 0;
        const cleanTaskId = parseInt(task_id, 10) || 0;

        if (cleanTelegramId === 0) {
            return res.status(400).json({ message: "Gagal mengidentifikasi akun Telegram Anda." });
        }

        const { data: existingLog } = await supabase.from('worker_logs').select('*').eq('telegram_id', cleanTelegramId).eq('task_id', cleanTaskId).maybeSingle();

        if (existingLog && existingLog.status === 'COMPLETED') {
            return res.status(400).json({ message: "Kamu sudah menyelesaikan tugas ini hari ini!" });
        }

        // OTOMATISASI: Jika user belum terdaftar di tabel workers, daftarkan otomatis di sini
        const { data: worker } = await supabase.from('workers').select('*').eq('telegram_id', cleanTelegramId).maybeSingle();
        if (!worker) {
            await supabase.from('workers').insert([{ telegram_id: cleanTelegramId, egg_points_balance: 0 }]);
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

        const cleanTelegramId = parseInt(telegram_id, 10) || 0;
        const cleanTaskId = parseInt(task_id, 10) || 0;

        if (cleanTelegramId === 0) {
            return res.status(400).json({ message: "Gagal mengidentifikasi akun Telegram Anda." });
        }

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

        const { data: worker } = await supabase.from('workers').select('egg_points_balance').eq('telegram_id', cleanTelegramId).maybeSingle();
        const currentBalance = worker ? worker.egg_points_balance : 0;
        const newBalance = currentBalance + (task.points_reward || 10);

        await supabase.from('workers').update({ egg_points_balance: newBalance }).eq('telegram_id', cleanTelegramId);

        return res.status(200).json({ message: "Poin berhasil diklaim!", points_earned: task.points_reward || 10, new_balance: newBalance });
    }

    return res.status(404).json({ error: "Path tidak ditemukan" });
};
