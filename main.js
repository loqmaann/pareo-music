// Library
const Discord = require('discord.js');
require('dotenv').config();
const {google} = require('googleapis'),
youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_KEY});


// Files
var botplay = require('./game/play');
var BotMusic = require('./music/botmusic');
var yts = require('./music/ytsearch');
var help = require('./utilities/help.js');

const bot = new Discord.Client();
const token = process.env.TOKEN_KEY;
const PREFIX = '-';

var botmusic = new BotMusic;

bot.on('ready', () => {
    bot.user.setActivity(`and kill ayana bot later`);
    console.log('akibot is online!');
});

// server greeting
bot.on('guildMemberAdd', member=>{
    const channel = member.guild.channels.find(channel => channel.name === "general");
    if(!channel) return;

    channel.send(`Hello ${member}, welcome to our server!`);
})

bot.on('message', async message=>{
    if(!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);

    switch(args[0]){
        case 'intro':
            message.channel.send(`Hi all! I am a bot created by Aki kun#1267, I will be a music bot for you. Please use -help to get started. Any bugs please report to Aki kun!`);
        break;

        case 'help':
            help.gethelp(message);
        break;

        case 'rand':
            if (!args[1]) {message.channel.send(`You need to specify a digit`); return;}
            if (!Number.isInteger(Number(args[1]))) {message.channel.send(`Invalid input!`); return;}
            botplay.random(message, args[1]);
        break;

        case 'j':
        case 'join':
            botmusic.connectchannel(message);
        break;

        case 'p':
        case 'play':
            if (!args[1]) return botmusic.playsong();

            // checking if the bot is not connected yet
            if (!botmusic.isconnected) {
                message.channel.send(`Let me join your voice channel first!`);
                return;
            }

            // doing youtube search if it is not a link
            if(!args[1].match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) {
                var keyword = message.content.substring(PREFIX.length + args[0].length);
                yts.ytsearch(message, botmusic, 1, keyword);

            } else {
                if (!botmusic.checkurl(args[1])) {message.channel.send(`Invalid url!`); return;}
                await botmusic.queuesong(args[1]);
                if (!botmusic.isplaying) await botmusic.playsong();
            }
            
        break;

        case 's':
        case 'search':
            if (!args[1]) return message.channel.send(`Please input the song title!`);

            // checking if the bot is not connected yet
            if (botmusic === null || !botmusic.isconnected) {
                message.channel.send(`Let me join your voice channel first!`);
                return;
            }

            var keyword = message.content.substring(PREFIX.length + args[0].length);
            yts.ytsearch(message, botmusic, 10, keyword);
        break;

        case 'q':
        case 'queue':
            if (botmusic === null) {
                message.channel.send(`The queue is empty!`);
                return;
            }
            botmusic.getqueue();

        break;

        case 'loop':
            if (!args[1]) return message.channel.send(`Please enter the following command: none/one/all/status`);
            botmusic.setloopstatus(args[1]);
        break;

        case 'r':
        case 'remove':
            if (!args[1]) {message.channel.send(`You need to specify what number you wish to remove from the queue!`); return;}
            if (!Number.isInteger(Number(args[1]))) {message.channel.send(`Invalid input!`); return;}
            if (botmusic === null) {
                message.channel.send(`The queue is empty!`);
                return;
            }
            botmusic.removesong(args[1]);
        break;

        case 'skip':
            botmusic.skipsong();
        break;

        case 'stop':
            botmusic.stopsong();
        break;

        case 'leave':
            if (botmusic.isconnected == false) return message.channel.send(`The bot is not connected!`);
            botmusic.leavechannel();
        break;

        case 'send':
            console.log(botmusic.gettitle(args[1]));
        break;
    }
})

bot.login(token);
