const Discord = require('discord.js');
var fs = require('fs');


module.exports = {
    gethelp: function (message) {
        fs.readFile('utilities/help.txt', 'utf8', function(err, data) {
            if (err) throw err;

            const queueEmbed = {
                title: 'Akikun bot help',
                description: data,
                footer: {
                    text: 'Created by Aki kun',
                },
            }
    
            message.channel.send({embed: queueEmbed});
        });
        
    }
};