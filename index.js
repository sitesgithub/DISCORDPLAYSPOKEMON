var fs = require("fs");
var GameBoyAdvance = require("gbajs");
var waitSync = require("wait-sync");
var Discord = require("discord.js");
var client = new Discord.Client();
require('events').EventEmitter.defaultMaxListeners = 50
//GBAjs vars
var gba = new GameBoyAdvance
var keypad = gba.keypad;
var png;
//DiscordPlaysPokémon(Gameboy)- GBA emulator that is controlled via Discord.
//-----IMPORTANT SETTINGS-----
var allowedchannelid = "561291581228056593";
var token = process.env.TOKEN;
//Main rom path, save file path
var filepaths = ["./nameless-firered-project-a1.02.gba", "./savefile.sav"];
//This is the help message that is sent to a user (in DMs) when help* is sent
var helpmsg = "**DiscordPlaysPokémon Help** *Basic commands:* Button syntax: Classic: `a` `b` `l` `r` `start` `select` `up ` `down` `right` `left` Shorthand: `st` (start) `sl` (select) `u` (up) `d` (down) `rt` (right) `lt` (left) `button*times` up to 10. ex: `up*3` or `a*10`. *Advanced Features:* `sav*` Writes and dumps current save file as of last in-game save. `n*times` up to 3. Fetch new screenshots. ex: `n*2` Hold Syntax: Hold works with one button at a time. If you try to push more than that, nothing will happen. `hold*button` Hold d-pad or a/b. Only supports one button at a time. ex: `hold*up` or `hold*b` `letgo*` Let go of current held down button.";
//-----IMPORTANT SETTINGS-----

//Declare important variables:
var input;
var holdflag = false;
var holdbutton;
var commandarray = ["UP", "DOWN", "RIGHT", "LEFT", "A", "B", "L", "R", "START", "SELECT"];
var shortcommandarray = ["U", "D", "RT", "LT", "A", "B", "L", "R", "ST", "SL"];
var screenshotdelay = 1.5;
//Displayed message in terminal when bot logs in + sets activity status:
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("do help*");
});

//GBAjs starter code:
gba.logLevel = gba.LOG_ERROR;
var biosBuf = fs.readFileSync("./node_modules/gbajs/resources/bios.bin");
gba.setBios(biosBuf);
gba.setCanvasMemory();
gba.loadRomFromFile(filepaths[0], function (err, result) {
  if (err) {
    console.error("loadRom failed:", err);
    process.exit(1);
  }
  gba.loadSavedataFromFile(filepaths[1]);
  gba.runStable();
})

//Draws the screen:
screenshotdelay = screenshotdelay / 2;
function  MakeScreen() {
	waitSync(screenshotdelay);
    png = gba.screenshot();
    png.pack().pipe(fs.createWriteStream("GBA.png"));
	waitSync(screenshotdelay);
  }

/* The heart of the code. Runs the command logic and screen exporting.
   If message sent and not a bot and message is sent in allowed channel and message includes a "*", then: */
  client.on("message", msg => {	
if(msg && !msg.author.bot && msg.channel.id === allowedchannelid && msg.content.includes("*")){
	//Input variable declared earlier is being set to the message string.
	 input = msg.content;
	 input = input.toUpperCase();
	 input = input.split("*");
	 //Should interpret the short commands into the larger versions
	 for(c = 0; c < shortcommandarray.length; c++){
		 if (input[0] === shortcommandarray[c]){
			 input[0] = commandarray[c];
		 }
	 }
	//Handles input that need to be run once: Start/Select, and no number after the "*".
     if(input[1] === "" || input[0] === "START" || input[0] === "SELECT"){
		 input[1] = "1";
	 }
/* For loop used in conjunction with the if to find match in array with message.
   Once found in array, it checks if the repeat number is less than 10. If so, it will loop code asked number of times. */
	for(i=0; i < commandarray.length; i++){
	    if(input[0] === commandarray[i]){
	        if(input[1] <= 10 && input[1] >= 1){
				msg.channel.startTyping();
	            for(x=0; x < input[1]; x++){	 
	             keypad.press(keypad[commandarray[i]]);
	             MakeScreen();
				 if(holdflag === true){
				  msg.channel.send("Holding: " + holdbutton + " (Turn off using `letgo*`)");
				 }
	             msg.channel.send("Button " + commandarray[i] + " pushed " + input[1] + " time(s):", {
                 files: [
                 "./GBA.png"
                        ]
                    });
                }
			    console.log(commandarray[i] + ":" + input[1]);
            } else {
			msg.reply("Invalid input. Max repeat for a button press is 10.");
			}
        } else if(input[0] === "SAV"){
			//Bit that writes and sends the save file.
			msg.channel.startTyping();
			gba.downloadSavedataToFile(filepaths[1]);
			console.log("SAVE");
			msg.channel.send("Save file as of last save in-game:", {
				files: [
					filepaths[1]
				]
			});
		input = "";	
		} else if(input[0] === "N" || input[0] === "NEW"){
		//Sends new screenshots. Limit is 3.
		if(input[1] <= 3){
			msg.channel.startTyping();	
			for(x=0; x < input[1]; x++){	 
			    MakeScreen();
			        if(holdflag === true){
				    msg.channel.send("Holding: " + holdbutton + ". (Turn off using letgo*).");
				    }
	            msg.channel.send("Another Screen:", {
                files: [
                "./GBA.png"
                        ]
                    });
				}
			console.log("N:" + input[1]);
			} else {
			msg.reply("Invalid input. Max repeat for `n*` is 3.");
			}	
		input = "";	
        } else if(input[0] === "HELP"){
			//Offers help to a requesting user over DMs.
			msg.author.send(helpmsg);
			msg.channel.send("I sent you the help message!");
			input = "";
		} else if(input[0] === "HOLD"){
			//Code to hold down a button
			for(x = 0; x < commandarray.length; x++){
			    if(holdflag === false && input[1] === commandarray[x] || input[1] === shortcommandarray[x] && holdflag === false){
					if(x < 6){
			    keypad.keydown(keypad[commandarray[x]]);
				holdflag = true;
				holdbutton = commandarray[x];
			    msg.reply("Now holding " + holdbutton + ".");
			    console.log("HOLD:" + holdbutton);
					}
			    }
			}
			if(holdflag === false){
				msg.reply("`hold*button` input was invalid.");
			}
			input = "";
		} else if(input[0] === "LETGO"){
			//Code to disable a currently held button
			if(holdflag === true){
			keypad.keyup(keypad[holdbutton]);				
		    holdflag = false;			
			msg.reply("Hold is now disabled.");
			console.log("LETGO");
		    input = "";
			} else if(holdflag === false){
			msg.reply("`letgo*` only works to release a held down button.");
			input = "";
			}
	    }
   }
}
//Stops the typing status for all code above.
msg.channel.stopTyping(true);
client.on("error", console.log)
});
client.login(token);
