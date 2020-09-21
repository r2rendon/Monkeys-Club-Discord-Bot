const discord = require('discord.js');
const bot = new discord.Client();
require('dotenv').config();
const ytdl = require('ytdl-core');

const token = process.env.BOT_TOKEN;
const prefix = '?';
const version = 'v1.1';

bot.login(token);

bot.on('ready', () => {
    console.log('Connected to Monkeys Bot!');
})

bot.once('reconnecting', () => {
    console.log('Reconnecting!');
})

bot.once('disconnect', () => {
    console.log('Disconnected');
})

bot.on('message', message => {
    let args = message.content.substring(prefix.length).split(" ");
    switch (args[0]) {
        case 'ping':
            message.reply('pong :ping_pong:');
            break;
        
        case 'name':
            message.channel.send('Elmer Homero :sunglasses:');
            break;
        
        case 'info':
            switch(args[1]){
                case 'author':
                    message.channel.send('Arturo Rendon');
                    break;
                
                case 'version':
                    message.channel.send(version);
                    break;
            }
            break;
    }
})