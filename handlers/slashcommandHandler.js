function loadSlashCommands(client) {
    const ascii = require('ascii-table');
    const fs = require("fs");
    const table = new ascii().setHeading('Slash commands', 'Status');

    let commandsArray = [];

    const commandFolder = fs.readdirSync('./slashcommands');
    for (const folder of commandFolder) {
        const commandFiles = fs.readdirSync(`./slashcommands/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandFile = require(`../slashcommands/${folder}/${file}`);

            const properties = {folder, ...commandFile};
            client.slashcommands.set(commandFile.data.name, properties);

            commandsArray.push(commandFile.data.toJSON());

            table.addRow(file, "loaded")
            continue;
        }
    }

    client.application.commands.set(commandsArray);

    return console.log(table.toString(), "\nLoaded Slash commands");
}

module.exports = {loadSlashCommands};