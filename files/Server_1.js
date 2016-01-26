var Scratch = require('scratch-api');
var fs = require('fs');

var PROJ_ID=95171843;

var username;
var mode;
var sentData;
var tmp;

var commands = ["Save", "Get"];

//Insert your cloud var names here
var Interface1 = "☁ Interface1";
var Interface2 = "☁ Interface2";
var Command = "☁ Command";
var Trigger = "☁ Trigger";



/*--------------------FILE IO--------------------*/
var f_path="fileio/savedata.txt";
var contents;
var newData;
var getData;

function newUserData(usr, data){
	newData=usr+"|"+data+"\n";
	writeData();
}

function readFile(){
	return fs.readFileSync(f_path, "utf8");
}

function getUserData(usr){
	var contents;
	var lines = []
	var found_line = -1;

	contents = readFile();
	lines=contents.split("\n");

	for(var i =0;i<lines.length;i++){
		if(lines[i].split("|")[0]==usr){
			found_line=i;
			break;
		}
	}

	if(found_line!=-1) {

		return(lines[found_line].split("|")[1]);
	} else {
		return -1;
	}
}

function writeData(){

	fs.readFile(f_path, "utf8", function(err, data) {
		if(err){
			console.log("File Error: %s", err)
		}

		contents = data;
		console.log("Contents: \n%s", contents);

		fs.writeFile(f_path, data+newData, function(err){
			if(err){
				return console.log("Writing Error: %s", err);
			}
			console.log("Saved!");
		});
	});
}

function modifyData(usr, data){
	var contents;
	var lines = []
	var found_line = -1;

	contents = readFile();
	lines=contents.split("\n");

	for(var i =0;i<lines.length;i++){
		if(lines[i].split("|")[0]==usr){
			found_line=i;
			break;
		}
	}

	if(found_line!=-1) {
		
		lines[found_line]=usr+"|"+data;
		fs.writeFile(f_path, lines.join("\n"), function(err){
			if(err){
				console.log("Error modifying data: %s", err);
			}
			console.log("Modified Sucsessfuly");
		});

	}
}

/*--------------------FILE IO--------------------*/



/*--------------------MEC--------------------*/
function getTimeStamp(){
	var d = new Date();
	var min = d.getMinutes();
	
	var hour = d.getHours();
	var seconds = d.getSeconds();
	var mil = d.getMilliseconds();

	if (min<10){
		min="0"+min;
	}
	if (seconds<10){
		seconds="0"+seconds;
	}
	if (hour<10){
		hour="0"+hour;
	}

	return("["+hour+":"+min+":"+seconds+":"+mil+"]");
}

function log(text){
	console.log(getTimeStamp()+" "+text);
}
/*--------------------MEC--------------------*/



/*--------------------ENCODING--------------------*/
function encode(text){
	var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+[]\\{}|;':\",./<>?`~ ";
	var next;
	var result="";

	for(var i=0;i<text.length;i++){
		next=(alpha.indexOf(text[i])+1).toString();
		if(next.length==1){
			next="0"+next;
		}
		result+=next;
	}
	return result;
}	

function decode(text){
	var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-=_+[]\\{}|;':\",./<>?`~ ";
	var next;
	var result="";
	var text2 = text.toString();

	for(var i=0;i<text.toString().length;i+=2){
		next=alpha[parseInt(text2[i]+text2[i+1])-1];
		result+=next;
	}
	return result;
}
/*--------------------ENCODING--------------------*/



/*--------------------MAIN--------------------*/

Scratch.UserSession.load(function(err, user) {
	console.log(err);
    user.cloudSession(PROJ_ID, function(err, cloud) {

    	cloud.on("set", function(name, val) {		
    		if(name==Trigger) console.log("Server"+getTimeStamp()+" "+name+": "+val);
    		if(name==Trigger && val==1){

    			cloud.set(name, 2); // Tell server we are processing...

    			mode = cloud.get(Command);

    			username = decode(cloud.get(Interface1));
    			if(mode==1){
    				sentData = decode(cloud.get(Interface2));
    			}

    			log(commands[mode]+": "+username);

    			switch(mode){
    				case 1:
    					log(username+": "+sentData);

    					if(getUserData(username)==-1){
    						newUserData(username, sentData);
    					} else {
    						modifyData(username, sentData);
    					}
    					cloud.set(Interface1, encode("Data saved offline."));
    					break;

    				case 2:
    					log("Getting "+username+"'s data...");
    					tmp = getUserData(username);
    					if(tmp==-1){
    						log("Error: User does not exist");
    						cloud.set(Interface1, encode("Error: User does not exist"));
    					} else {
    						log("Got: "+tmp);
    						cloud.set(Interface1, encode(tmp));
    					}
    					break;

    				default:
    					log("Invalid command: "+mode);
    					cloud.set(Interface1, encode("That is not a valid command!"));
    					break;
    			}
				
				cloud.set(name, 0)
    		}
    	});
  	});
});
/*--------------------MAIN--------------------*/
