const discord = require('discord.js');
const bot = new discord.Client();
require('dotenv').config();
const ytdl = require('ytdl-core');
const axios = require('axios');

// Queue
const queue = new Map();

// Execute function
async function execute(message, serverQueue) {
    const args = message.content.split(" ");
    const voiceChannel = message.member.voice.channel;

    if(!voiceChannel)
        return message.channel.send('Tenes que estar en un canal para que pueda poner musica!');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")){
        return message.channel.send("Ocupo las bananas para poder entrar a ese canal :(");
    }

    let songInfo = {};
    if(args[1].includes('https://')){
        songInfo = await ytdl.getInfo(args[1]);
    } else {
        let newArgs = args;
        args[0] = '';
        const searchText = newArgs.join('%20');
        const search = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY}&type=video&part=snippet&maxResults=2&q=${searchText}`);
        const videoId = search.data.items[0].id.videoId;
        songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
    }
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if(serverQueue){
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} fue agregada a la cola!`);
    }

    // Create the contract from the queue
    const queueContract = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 4,
        playing: true,
    }
    // Set the queue using the contract
    queue.set(message.guild.id, queueContract)

    // Pushing the song to the songs array
    queueContract.songs.push(song);

    try{
        let connection = await voiceChannel.join();
        queueContract.connection = connection;
        play(message.guild, queueContract.songs[0]);
    } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channeld.send(err);
    }

}

// Play function
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if(!song){
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Esta sonando esta rola :musical_note: :  ** ${song.title} **`);
}

function skip(message, serverQueue) {
    if(!message.member.voice.channel)
        return message.channel.send('Tenes que estar en un canal de voz para poder hacer skip a una canción!')

    if (!serverQueue)
        return message.channel.send("No hay canción alguna para hacer skip!");
    serverQueue.connection.dispatcher.end();    
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send('Tenes que estar en un canal de voz para poder hacer skip a una canción!')
    
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

// Config
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

bot.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)){
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}name`)) {
        return message.channel.send('Elmer Homero :sunglasses:')
    } else if (message.content.startsWith(`${prefix}leave`)) {
        return message.member.voice.channel.disconnect();
    } else {
        message.channel.send("You need to enter a valid command!");
    }

    // let args = message.content.substring(prefix.length).split(" ");
    // switch (args[0]) {
    //     case 'ping':
    //         message.reply('pong :ping_pong:');
    //         break;
        
    //     case 'name':
    //         message.channel.send('Elmer Homero :sunglasses:');
    //         break;
        
    //     case 'info':
    //         switch(args[1]){
    //             case 'author':
    //                 message.channel.send('Arturo Rendon');
    //                 break;
                
    //             case 'version':
    //                 message.channel.send(version);
    //                 break;
    //         }
    //         break;
    // }
})

bot.on('disconnect', () => {

})