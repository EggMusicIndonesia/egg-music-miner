const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { telegram_id, task_id } = req.body;
        
        // 1. Ambil data tugas
        const { data: task } = await supabase.from('music_tasks').select('*').eq('id', task_id).single();
        
        // 2. Simpan ke database (Ini yang akan dihitung bot nanti)
        await supabase.from('worker_logs').insert([{ telegram_id, task_id, status: 'completed' }]);
        
        // 3. Update Poin
        const { data: user } = await supabase.from('user_progress').select('points').eq('telegram_id', telegram_id).single();
        if (user) {
            await supabase.from('user_progress').update({ points: user.points + 10 }).eq('telegram_id', telegram_id);
        } else {
            await supabase.from('user_progress').insert([{ telegram_id, points: 10 }]);
        }

        return res.status(200).json(task);
    }
};
