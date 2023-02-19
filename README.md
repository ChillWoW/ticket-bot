1. 
```bash
npm install
``` 

2. Muokkaa config.js

```javascript
TOKEN: "",
MONGOURL: "",
COLOR: "2b2d31",

TICKETS: {
  ENABLED: false, //true tai false
  TICKETNAME: "", //[ "count", "discordid", "discordname" ] *
  PARENT: "", // KATEGORIAN ID *
  SUPPORTROOLI: "" //Support rooli id *
},

ACTIVITY: {
  ENABLED: true,
  STATUS: "online", // [online, idle, dnd, invisible]
  TYPE: "WATHCING", // [PLAYING, LISTENING, WATCHING, COMPETING]
  MESSAGE: "ChillWoW", // *
},
```

3. Käynnistä
```bash
node index.js
```
