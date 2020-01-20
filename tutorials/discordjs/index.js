const Discord = require('discord.js');
const client = new Discord.Client();
                
client.on('ready', () => {
    console.log(`${client.user.tag} logged in`);
});
                
client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
});                 
client.login('token');