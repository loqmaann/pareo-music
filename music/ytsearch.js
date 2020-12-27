require('dotenv').config();
const {google} = require('googleapis'),
youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_KEY});

async function botplay (botmusic, queue, selection) {
    let url = botmusic.geturl(queue[selection-1]);
    await botmusic.queuesong(url);
    if (!botmusic.isplaying) await botmusic.playsong();
}

module.exports = {
    ytsearch: async function (message, botmusic, maxresult, keyword) {
        var queue = [];
        const filter = m => m.author.id === message.author.id;

        youtube.search.list({
            part: 'snippet',
            q: keyword,
            maxResults: maxresult,
            type: 'video',
        })
        .then((response) => {
            const { data } = response;
            let songlist = ``;
            var i = 1;
            data.items.forEach((item) => {
                songlist += `\n${i} - ${item.snippet.title}`;
                queue.push(item.id.videoId);  
                i++;   
            })

            if (maxresult == 1) {
                return botplay(botmusic, queue, 1);
            }

            songlist += `\nc - to cancel`;
            message.channel.send({embed: queueEmbed = {
                description: songlist,
                }
            });

            message.reply(`Please choose a song... Will expire in 10 seconds...`);

            message.channel.awaitMessages(filter, {
                max:1, 
                time: 10000
            })
            .then(collected => {
                let selection = collected.first().content.toLowerCase();
                if (selection === 'c') return message.channel.send('Cancelled!');

                Number(selection);

                botplay(botmusic, queue, selection);

            })
            .catch(err => {
                console.log(err);
                return message.channel.send(`Invalid input or session expired`);
            })

            
        })
        .catch((err) => {
            message.channel.send(`There is an error occurred!`);
            console.log(err);
        })
    }
};