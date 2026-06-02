const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.start(async (ctx) => {
  const { id, username } = ctx.from;
  const { data } = await supabase.from('users').select('*').eq('telegram_id', id).single();

  if (!data) {
    await supabase.from('users').insert([{ telegram_id: id, username }]);
    ctx.reply('Selamat datang di Egg Music Miner! Poin Anda mulai dihitung.');
  } else {
    ctx.reply('Halo lagi! Tambang terus Egg Music Anda!');
  }
});

module.exports = (req, res) => {
  bot.handleUpdate(req.body, res);
};
