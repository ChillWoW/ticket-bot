function loadCommands(client) {
    const fs = require("fs");

    let commandsArray = [];

    const commandFolder = fs.readdirSync('./commands');
    for (const folder of commandFolder) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandFile = require(`../commands/${folder}/${file}`);

            const properties = {folder, ...commandFile};
            client.commands.set(commandFile.data.name, properties);

            commandsArray.push(commandFile.data.toJSON());
            continue;
        }
    }

    client.application.commands.set(commandsArray);

    return console.log("Komennot ladattu!");
}

module.exports = {loadCommands};