const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
    if (req.body && req.body.update_id) return bot.handleUpdate(req.body, res);

    if (req.method === 'POST') {
        const { telegram_id } = req.body;
        
        // Cek apakah user sudah ada
        const { data: user } = await supabase.from('user_progress').select('points').eq('telegram_id', telegram_id).single();

        if (user) {
            // Jika ada, tambahkan 10
            await supabase.from('user_progress').update({ points: user.points + 10 }).eq('telegram_id', telegram_id);
        } else {
            // Jika belum ada, buat baru
            await supabase.from('user_progress').insert([{ telegram_id, points: 10 }]);
        }
        
        return res.status(200).json({ stream_link: "dQw4w9WgXcQ", title: "Mining Selesai" });
    }
};
