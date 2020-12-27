module.exports = {
    random: function (message, digit){
    // get the random number
    const min = 1 * Math.pow(10, digit-1);
    const max = (1 * Math.pow(10, digit)) - 1;
    const num = Math.floor(Math.random() * (max - min + 1) + min);
    message.channel.send(`The random number is ${num}`);

    // the game begins!
    return;
    }
};