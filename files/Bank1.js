var Scratch = require("scratch-api");
var Q = require("q");
var fs = require("fs");

var gotten;
var response = "Nothing";

var BANK_ID = 96076345;
var THIS_PROJ = 96096982;

var f_path = "fileio/bankAuth.txt";

function readFile(){
	return fs.readFileSync(f_path, "utf8");
}


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

function get(id, varname, callback){

	Scratch.UserSession.load(function(err, user) {
		if(err) console.log(err);
	    user.cloudSession(id, function(err, cloud) {

	    	cloud.on("set", function(name, val) {	
	    		callback(cloud.get("☁ "+varname));	
	    	});
	    });
	});
}

function varOf(id, varname){
	var deferred = Q.defer();
	get(id, varname, function(v){
		gotten = v;
		deferred.resolve();
	});

	return deferred.promise;

}


function index(arr, item, k){
	for(var i = 0; i<arr.length; i++){
		if(arr[i][k]==item){
			return i;
			break;
		}
	}
	return -1;
}

function withdraw (username, amount, recipient) {
	var deferred = Q.defer();
	var amm = 0;

	Scratch.UserSession.load(function(err, user) {
		if(err) console.error(err);

		user.cloudSession(BANK_ID, function(err, cloud) {
			cloud.on("set", function(n, v){

				if(amm < 1){
					amm++;

					var allData = cloud.get("☁ Data");

					var idIndex = -1;
					var transIndex = -1;
					response = "@Nothing";
					var newA = [];
					var newB;

					var indv = decode(allData).split("|");
					for(var i = 0; i<indv.length; i++){
						indv[i] = indv[i].split("/");
					}
					idIndex = index(indv, username, 0);
					transIndex = index(indv, recipient, 0);
					

					if (idIndex == -1 || transIndex == -1) {
						console.log("if");
						response = "@2User doesn't exist";
						deferred.resolve();
					} else {
						if(username != recipient){
							console.log("else");
							
							if(indv[idIndex][1]-amount>=0 && amount > 0) { // Can spend that many credits
								indv[idIndex][1] = parseInt(indv[idIndex][1]) - amount; //Withdraw
								indv[transIndex][1] = parseInt(indv[transIndex][1]) + parseInt(amount);
								response = "!Withdrawn!";
							} else {
								response = "@1Not enough credits!";
							}

							for(i = 0; i<indv.length; i++){

								newA.push(indv[i][0]+"/"+indv[i][1])
							}

							newB = newA.join("|");

							cloud.set("☁ Data", encode(newB));

							deferred.resolve();
						} else {
							response = "@5Can't send credits to yourself!";
						}
					}
				} else {

					deferred.resolve();
				}

			});
		});
	});

	return deferred.promise;

}


function sendResponse(){
	Scratch.UserSession.load(function(err, user) {
		user.cloudSession(THIS_PROJ, function(err, cloud) {
			cloud.set("☁ R", encode(response));
		});
	});
}

function doWithdraw(w, a, r){
	withdraw(w, a, r).then(function(){

		console.log("Done request; Status: %s", response);

	}).then(sendResponse);

}


var num = 0;
var prec = 0;
var ready = "y"
var lastTransID;
var myKey;
var file;

function doAllStuff(cloud, n, v){
	var deferred = Q.defer();

	if(n == "☁ Listen"){

		ready = "n"
		num ++;

		if (num>1){
			prec = v;


			var rData = decode(cloud.get("☁ Listen")).split("|");
			/*========
			0 - Person to withdraw from
			1 - Amount
			2 - Person to give the credits
			3 - ID
			4 - Authentication
			5 - Random Chars for hidden log
			========*/


			rData.splice(5,1); // Don't need the hidden chars
			file = readFile().replace("\r", "").split("\n");

			for(var i = 0; i<file.length; i++){
				file[i] = file[i].split("|");
			}

			myKey = file[index(file, rData[0], 0)][1];

			if(rData[3]!= lastTransID){
				lastTransID = rData[3];
				if(rData[4]==myKey){
					doWithdraw(rData[0], rData[1], rData[2]);
				} else {
					console.log("Invalid Key!");
					response = "@3Invalid Key!";
					sendResponse();
				}
			} else {
				console.log("Ditto ID!");
				response = "@4Internal Error!!!";
				sendResponse();
			}

			deferred.resolve();


		} else {
			ready = "y"
		}
	} else {
		deferred.resolve();
	}
	return deferred.promise;
}

var cloudG = 0;
Scratch.UserSession.load(function(err, user) {
	user.cloudSession(BANK_ID, function(err, cloud) {
		cloud.on("set", function(n, v) {
			cloudG++;
			if(n == "☁ SignUp"&& cloudG>4){
				fs.writeFile(f_path, readFile()+"\n"+decode(v), function(err){
					if (err) console.log(err);
					console.log("Signed up!");
				});
			}
		});
	});
});


Scratch.UserSession.load(function(err, user) {
	user.cloudSession(THIS_PROJ, function(err, cloud) {
		cloud.on("set", function(n, v) {
			if(ready == "y"){
				doAllStuff(cloud, n, v).then(function(){
					ready = "y";
				});
			}
		});
	});
});
