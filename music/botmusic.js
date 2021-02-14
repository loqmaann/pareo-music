const ytdl = require("ytdl-core");
const Discord = require('discord.js');
const db = require('../utilities/database.js');

class BotMusic {
    constructor() {
        this.message = null;
        this.connection = null;
        this.server = {
            guildID: null,
            loopindex: null,
            Queue: []
        }
        this.isplaying = false;
        this.isconnected = false;
        this.isloop = 'none';
    }

    async queuesong (url) {
        if (!url) return this.message.channel.send(`There is nothing to queue`);
        if (!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?(undefined)?/)) return console.log(`Failed to queue the song`);

        await ytdl.getBasicInfo(url)
        .then((songinfo) => {
            let title = songinfo.videoDetails.title;
            let songdata = [url, title];
            if (this.isloop == 'all') {
                this.server.Queue.splice(this.server.loopindex, 0, songdata);
                this.server.loopindex++;
            } else this.server.Queue.push(songdata);

            this.message.channel.send(title + ' is added into the queue');
        })
        .catch((err) => {
            console.log(err);
            this.message.channel.send(`There is an error occurred while getting the song info!`);
        })
    }

    loopstatus () {
        switch(this.isloop) {
            case 'none':
                this.server.Queue.shift();
            break;

            case 'one':
                return;

            case 'all':
                // get position of last song in the queue
                if (this.server.loopindex < 0){
                    this.server.loopindex = this.server.Queue.length;
                } else {
                    this.server.loopindex--;
                }
                
                this.server.Queue.push(this.server.Queue[0]);
                this.server.Queue.shift();
            break;
        }
    }

    setloopstatus (loopstatus) {
        if (!this.message) return this.message.channel.send(`The bot is not connected`);
        switch (loopstatus) {
            case 'none':
                this.isloop = 'none';
                this.message.channel.send(`Set to loop ${this.isloop}`);
            break;

            case 'one':
                this.isloop = 'one';
                this.message.channel.send(`Set to loop ${this.isloop}`);
            break;

            case 'all':
                this.server.loopindex = this.server.Queue.length;
                this.isloop = 'all';
                this.message.channel.send(`Set to loop ${this.isloop}`);
            break;

            case 'status':
                this.message.channel.send(`Currently is loop ${this.isloop}`);
            break;

            default:
                this.message.channel.send(`The commands are limited to none/one/all/status!`);
        }
    } 

    async connectchannel(message) {
        this.message = message;
        if(!this.message.member.voice.channel){
            this.message.channel.send("You must be in a voice channel so I can play the music!");
            return;
        }

        this.message.member.voice.channel.join()
        .then((connected) => {
            this.server.guildID = message.guild.id;
            this.connection = connected;
            this.isconnected = true;
        })
        .catch((err) => {
            console.log(err);
            this.message.channel.send(`Unable to connect to the voice channel!`);
        })
    }

    leavechannel () {
        if (!this.message) return this.message.channel.send(`The bot is not connected`);
        if (this.message.guild.voice.connection) {
            this.message.channel.send(`Leaving the channel!`);
            this.isconnected = false;
            this.connection.disconnect();
        }
    }

    async playsong(){
        // if no song in the queue
        if (this.server.Queue.length == 0) {
            this.message.channel.send(`The queue is empty!`);
            this.isplaying = false;
            return;
        }

        await this.message.channel.send(`Now playing: ` + this.server.Queue[0][1]);

        const stream = ytdl(this.server.Queue[0][0], {filter: 'audioonly'});
        this.server.dispatcher = this.connection.play(stream, {seek: 0, volume:1})
        .on('finish' , () => {
            this.loopstatus();
            this.playsong();
        })

        this.isplaying = true;
    }

    geturl(videoId) {
        if (videoId == undefined) return console.log(`Invalid videoId`);
        return 'https://youtu.be/' + videoId;
    }

    async getqueue() {
        if (!this.message) return this.message.channel.send(`The bot is not connected`);

        // get loop status and display all songs in the list
        let songlist = `\nloop status = ${this.isloop}`;
        for (var i = 0 ; i < this.server.Queue.length; i++) {
            songlist += `\n${i + 1}. ${this.server.Queue[i][1]}`;
        }

        // display the song list in embed
        const queueEmbed = {
            title: 'Song queue',
            description: songlist,
            footer: {
                text: 'Created by Aki kun',
            },
        }

        this.message.channel.send({embed: queueEmbed});
    }

    checkurl(url) {
        return ytdl.validateURL(url);
    }

    async removesong(num) {
        if (!this.message) return this.message.channel.send(`The bot is not connected`);
        if (num == 1) return this.message.channel.send(`This song is currently playing, please use skip or stop command!`);
        if (num < 1 || num > this.server.Queue.length) return this.message.channel.send(`Outside of the queue bound!`);
        
        let songremoved = this.server.Queue.splice(num-1, 1);
        this.message.channel.send(songremoved[0][1] + ' is removed from the queue');
        // display the song list again to avoid from removing any song accidentially
        this.getqueue();
        
        if (num <= this.server.loopindex && this.isloop == 'all') this.server.loopindex--;
    }

    skipsong(){
        if (!this.message) return this.message.channel.send(`The bot is not connected`);
        if (!this.server.Queue[0]) {
            this.message.channel.send(`The queue is empty!`);
            return;
        }

        if (this.isloop == 'one') this.server.Queue.shift();
        if (this.server.dispatcher) this.server.dispatcher.end();
        this.message.channel.send(`Song skipped!`);
    }

    stopsong(){
        if (!this.message) return this.message.channel.send(`The bot is not connected`);
        if (!this.server.Queue[0]) {
            this.message.channel.send(`The queue is empty!`);
            return;
        }

        if (this.message.guild.voice.connection) {
            for(var i = this.server.Queue.length - 1; i >= 0 ; i--){
                this.server.Queue.splice(i, 1);
            }

            this.server.dispatcher.end();
            this.isplaying = false;
        }
    }

    save_playlist(message) {
        db.saveplaylist(this.server, message);
    }

    load_playlist(message) {
        let playlist = db.loadplaylist(this.server, message);
        if (!playlist) return message.channel.send('Playlist not found');
        
        this.server.Queue = playlist;
    }

}

module.exports = BotMusic;