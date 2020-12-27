const fs = require('fs');
const { platform } = require('os');
const { resolve } = require('path');
const delay = 100;

var servers = {}

async function saveplaylist(guildID, creator, name, songs){
    var newservers = servers;
    newservers[guildID] = {
        creator: creator,
        name: name,
        songs: songs
    };
    let data = JSON.stringify(newservers);
    fs.writeFile('./utilities/playlist_database.json', data, function (err) {
        if (err) throw err;
        console.log('Data stored!');
    });
};

async function loadplaylist(){
    return fs.readFile('./utilities/playlist_database.json', function(err, rawdata) {
        if (err) throw err;
        let playlist = JSON.parse(rawdata);
        servers = playlist;
    });
}

async function sendplaylist(){
    return servers;
}

module.exports = {
    saveplaylist: function (guildID, creator, name, songs) {
        loadplaylist().then(() => {
            setTimeout(() => {
                saveplaylist(guildID, creator, name, songs);
            }, delay);
        });
    },

    loadplaylist: function (guildID, name) {
        loadplaylist().then(() => {
            setTimeout(() => {
                if (!servers[guildID]) return console.log(`not exists!`);
                return sendplaylist();
            }, delay);
        });
    }
};
