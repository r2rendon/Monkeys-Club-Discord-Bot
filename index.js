const discord = require('discord.js')
const bot = new discord.Client()
require('dotenv').config()

const token = process.env.BOT_TOKEN;

bot.login(token);

bot.on('ready', () => {
    console.log('Connected to Monkeys Bot!');
})

bot.on('message', msg => {
    if(msg.content === 'MSG'){
        msg.reply('HELLO FRIEND!');
    }
    if (msg.content === 'pto'){
        msg.reply('pto vos');
    }
})