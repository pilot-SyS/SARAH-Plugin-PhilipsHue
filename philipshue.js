exports.action = function(data, callback, config){
  
	var request = require("request");
	var lights=[["1","bed"],["2","kitchen"],["3","tv"],["4","bloom"],["5","strip"]];
	var groups=[["1","1","2","5"] , ["2","3","4"] ];
	var color=[["white","0.35","0.35"],["red","0.59","0.37"],["blue","0.18","0.06"],["yellow","0.45","0.48"],["orange","0.51","0.41"],["green","0.38","0.47"]];
	
	/*
		on : Sate : true / false
		bri : Brightness 0 - 255
		xy : color  : 0-1 , 0-1 --http://developers.meethue.com/coreconcepts.html#color_gets_more_complicated
		sat : Saturation 0- 255
	*/
	/*
		2 dmensions array
		[
			[ AMBIANCE NUMBER , LAMP X , LAMP X SETTINGS , LAMP Y , LAMP Y SETTINGS etc ... } 
		]
	*/
	var ambiances=	[
						["1", "2" , "{\"on\":true,\"bri\":255,\"xy\":\[0.62,0.22\],\"sat\":230}", "5","{\"on\":true,\"bri\":80,\"xy\":\[0.12,0.22\],\"sat\":230}"],
						["2", "1" , "{\"on\":true,\"bri\":255,\"xy\":\[0.62,0.22\],\"sat\":230}"]
					];

	
	
	var urllight = 'http://192.168.1.6/api/newdeveloper/lights/';
	var urlgroup = 'http://192.168.1.6/api/newdeveloper/groups/';
	var ustate = '/state';
	var uaction = '/action';
	
	
	var rbody = "";
	var text = "";
	var li=0;
	var tm = 3000;
	
	var ptodo = data.todo;
	var	pparam = data.param;
	var proom = data.room;
	var pgroup = data.group;
	var pambiance = data.ambiance;
		
	var pcolor = data.color;
	
	// Answers
	if ( pparam == "off" && proom == -1 )
	{
		//text = "Bonne nuit";
	}
	
	// One word Action
	// Si toutes les lampes sont eteintes ==> on allume tout
	// Si une ou toutes les lampes sont allumees ==> on eteint tout
	if ( ptodo == 0 ) // 
	{
		request({
			uri: urlgroup + "0" ,
			method: "GET",
			body: '{"on":true}',
			timeout: tm,
			}, function(error, response, body) {
				if ( body.indexOf("true") > 0 )
				{	
					request({
						uri: urlgroup + "0" + uaction ,
						method: "PUT",
						body: '{"on":false}',
						timeout: tm,
						}, function(error, response, body) {
						console.log(body);
					});
				}
				else
				{
					request({
						uri: urlgroup + "0" + uaction ,
						method: "PUT",
						body: '{"on":true}',
						timeout: tm,
						}, function(error, response, body) {
						console.log(body);
					});
				}
		});
	
	}
	
	
	if ( ptodo == -99)
	{
		//text = "Red Alert ... Red Alert";
		// Toutes les lampes clignotent rouge pendant 30 sec
		// on allume toutes les lampes
		request({
			uri: urlgroup + "0" + uaction ,
			method: "PUT",
			body: '{"on":true}',
			timeout: tm,
			}, function(error, response, body) {
			console.log(body);
		});
		
		// on change toutes les couleures en rouge
		request({
			uri: urlgroup + "0" + uaction ,
			method: "PUT",
			body: '{"xy": [0.675,0.322]}',
			timeout: tm,
			}, function(error, response, body) {
			console.log(body);
		});
		
		// on lance le clignotementpendant 30 sec
		request({
			uri: urlgroup + "0" + uaction ,
			method: "PUT",
			body: '{"alert":"lselect"}',
			timeout: tm,
			}, function(error, response, body) {
			console.log(body);
		});	
	}
	
	if ( ptodo == 99)
	{
		// CANCEL RED ALERT
		// on lance le clignotementpendant 30 sec
		request({
			uri: urlgroup + "0" + uaction ,
			method: "PUT",
			body: '{"alert":"none"}',
			timeout: tm,
			}, function(error, response, body) {
			console.log(body);
		});	
		// on change toutes les couleures en rouge
		request({
			uri: urlgroup + "0" + uaction ,
			method: "PUT",
			body: '{"xy": [0.35,0.35]}',
			timeout: tm,
			}, function(error, response, body) {
			console.log(body);
		});
	}
	
	
	console.log("TODO = " + ptodo);
	console.log("PARAM = " + pparam);
	console.log("ROOM = " + proom);
	console.log("GROUP = " + pgroup);
	console.log("COLOR = " + pcolor);
	console.log("AMBIANCE = " + pambiance);
  
  
	if ( ptodo == 1 ) // switch on /off
	{
		rbody = '{"on":true}';
		
		if ( pparam == "off" )
		{
			rbody = '{"on":false}';
		}
		
		//group and lamp undifined ==> Issue 
		if ( typeof pgroup == 'undefined' && typeof proom == 'undefined')
		{
			callback({'tts': text});
		}
		
		// group undefined + all lamps
		if ( typeof pgroup == 'undefined' && prroom == -1)
		{
			request({
				uri: urlgroup + "0" + uaction ,
				method: "PUT",
				body: rbody,
				timeout: tm,
				}, function(error, response, body) {
				console.log(body);
			});
		}
		
		//group undifined + 1 lamp
		if ( typeof pgroup == 'undefined' && prroom != -1)
		{
			request({
				uri: urllight + proom + ustate ,
				method: "PUT",
				body: rbody,
				timeout: tm,
				}, function(error, response, body) {
				console.log(body);
			});
		}
		
		if ( typeof pgroup != 'undefined')
		{
			// we look for the number of the group in the groups variable
			for(var i = 0; i < groups.length; i++) 
			{
				if(groups[i][0] == pgroup) 
				{
					for ( var j = 1 ; j < groups[i].length ; j++)
					{
						request({
							uri: urllight + groups[i][j] + ustate ,
							method: "PUT",
							body: rbody,
							timeout: tm,
							}, function(error, response, body) {
							console.log(body);
						});
					}
				}
			}
		}
			
	}
 
 
 
	if ( ptodo == 2 ) // COLOR CHANGE
	{
		rbody = '{"xy":['; //ex: {"xy": [0.19,0.08]}
		for(var i = 0; i < color.length; i++) 
		{
			if(color[i][0] === pcolor) 
			{
				rbody = rbody + color[i][1]  + "," + color[i][2] + "]}";
			}
		}
		
		console.log("rbody = " + rbody);
		
		//GROUP
		if ( typeof pgroup != 'undefined')
		{
			// we look for the number of the group in the groups variable
			for(var i = 0; i < groups.length; i++) 
			{
				if(groups[i][0] == pgroup) 
				{
					for ( var j = 1 ; j < groups[i].length ; j++)
					{
						console.log(urllight + groups[i][j] + ustate + "");
						
						request({
							uri: urllight + groups[i][j] + ustate ,
							method: "PUT",
							body: rbody,
							timeout: tm,
							}, function(error, response, body) {
							console.log(body);
						});
					}
				}
			}
		}	
		else // NO GROUP
		{
			if ( proom != -1 )
			{
				request({
					uri: urllight + proom + ustate ,
					method: "PUT",
					body: rbody,
					timeout: tm,
					}, function(error, response, body) {
					console.log(body);
				});
			}
			else
			{
				
				request({
					uri: urlgroup + "0" + uaction ,
					method: "PUT",
					body: rbody,
					timeout: tm,
					}, function(error, response, body) {
					console.log(body);
				});
			}
		}
	}
	
	
	
	if ( ptodo == 4 ) // Ambiance
	{
		if ( typeof pambiance != 'undefined')
		{
			//We look for the good ambiance to set
			for(var i = 0; i < ambiances.length; i++) 
			{
				if ( ambiances[i][0] == pambiance )
				{
					for ( var j = 1 ; j < ambiances[i].length ; j++ )
					{
							console.log(urllight + ambiances[i][j] + ustate+"");
							
							request({
							uri: urllight + ambiances[i][j] + ustate ,
							method: "PUT",
							body: ambiances[i][++j],
							timeout: tm,
							}, function(error, response, body) {
							console.log(body);
						});
					}
				}
			}
		}
	}
 
 
 
 
 
 
 
 
 if ( ptodo == 3 ) // BLINKING
	{

		rbody = '{"alert":"select"}';
		
		if ( proom != -1 )
		{
			request({
				uri: urllight + proom + ustate ,
				method: "PUT",
				body: rbody,
				timeout: tm,
				}, function(error, response, body) {
				console.log(body);
			});
		}
		else
		{
			for (var i = 1; i <= lights.length; i++) 
			{
				request({
					uri: urllight + i + ustate ,
					method: "PUT",
					body: rbody,
					timeout: tm,
					}, function(error, response, body) {
					console.log(body);
				});
			}
		}
	
	
	}
 
 
  // Callback with TTS
  callback({'tts': text});
}

