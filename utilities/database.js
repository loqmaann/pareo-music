const { Channel } = require('discord.js');
const fs = require('fs');
const { platform } = require('os');
const { resolve } = require('path');

const playlist = './utilities/playlist.json';
const database = './utilities/database.json';

var obj = {};

function save_playlist(server, message){
    var db = load_database();
    db[message.author.id] = {
        songs: server.Queue
    };

    let data = JSON.stringify(db, null, 2);
    fs.writeFileSync(playlist, data);

    message.channel.send(`${message.author.username}'s playlist saved`);
};

function load_database(){
    try {
        var rawdata = fs.readFileSync(database);
        var db = JSON.parse(rawdata);
        return db;
    } catch(err) {
        fs.writeFileSync(database, '{}');
        var rawdata = fs.readFileSync(database);
        var db = JSON.parse(rawdata);
    }

    return db;
    
}

function load_playlist(server, message){
    let db = load_database();
    if(!db[message.author.id]) return message.channel.send('Playlist is not found');

    message.channel.send(`${message.author.username}'s playlist loaded`);

    return db[message.author.id].songs;
}

function delete_playlist(message) {
    let db = load_database();
    if(!db[server.guildID]) return message.channel.send('Playlist is not existed');
    if(!db[server.guildID].list[name]) return message.channel.send('Playlist is not existed');


}

function backup_database() {
    fs.copyFile(playlist, database, (err) => {
        if (err) throw err;

        console.log('Data backup');
    })
}

module.exports = {
    saveplaylist: async function (server, message) {
        save_playlist(server, message);
        backup_database();
    },

    loadplaylist: function (server, message) {
        return load_playlist(server, message)
    },

    deleteplaylist: function (message) {

    }
};
