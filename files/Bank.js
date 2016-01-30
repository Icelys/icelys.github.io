var Scratch = require("scratch-api");
var Q = require("q");
var gotten;

var BANK_ID = 96076345;


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
	    		cloud.end();	
	    	});
	    });
	});
}

function varOf(id, varname){
	var deferred = Q.defer();
	console.log("starting");
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
}

function withdraw (username, ammount, recipient) {
	var deferred = Q.defer();

	Scratch.UserSession.load(function(err, user) {
		if(err) console.error(err);

		user.cloudSession(BANK_ID, function(err, cloud) {
			cloud.on("set", function(n, v){

				var allData = cloud.get("☁ Data");
				console.log("OK...\n%s", allData);
				var idIndex = -1;
				var transIndex = -1
				var response;
				var newA = [];
				var newB;

				var indv = decode(allData).split("|");
				for(var i = 0; i<indv.length; i++){
					indv[i] = indv[i].split("/");
				}
				idIndex = index(indv, username, 0);
				transIndex = index(indv, recipient, 0);
				

				if(idIndex == -1 || transIndex == -1){
					throw "User doesn't exist";
				}

				if(indv[idIndex][1] >= ammount) { // Can spend that many credits
					indv[idIndex][1] = indv[idIndex][1] - ammount; //Withdraw
					indv[transIndex][1] = parseInt(indv[transIndex][1]) + ammount;
					response = ammount + " credits withdrawn.";
				} else {
					response = "Sorry, you don't have that many credits.";
				}

				for(i = 0; i<indv.length; i++){

					newA.push(indv[i][0]+"/"+indv[i][1])
				}

				newB = newA.join("|");

				cloud.set("☁ Data", encode(newB));
				cloud.end();
				deferred.resolve();

			});
		});
	});

	return deferred.promise;

}

withdraw("someone", 20, "Icely").then(function(){
	console.log("Done withdrawing...");
	/*
	Scratch.UserSession.load(function(err, user) {
		user.cloudSession(PROJ_ID, function(err, cloud) {
			cloud.set("☁ R", encode(response));
		});
	});
	*/
})


