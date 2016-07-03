
/****************************************************************
 * Designer: Erhan YILMAZ										*
 * Application: Control application with Telegram bot api and	*
 * Intel Edison 												*
 * Date: 02-07-2016												*
 * Version: 1.0													*
 * Description:	This is NodeJS application to get/send			*
 * message over the telegram users by telegram bots.			*
 * *************************************************************/

  console.log('Aplication Started!');
 
// Telegram Bot API module
// https://www.npmjs.com/package/telegram-bot-api
var telegram = require('telegram-bot-api');
var api = new telegram({
	token: 'YOUR_TOKEN',
	updates: {
		enabled: true,
		get_interval: 1000
	}
});

var m = require('mraa'); //require mraa
console.log('MRAA Version: ' + m.getVersion()); //write the mraa version to the console

var myLed = new m.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Galileo Gen1 & Gen2)
myLed.dir(m.DIR_OUT); //set the gpio direction to output

var analogPin0 = new m.Aio(0); //setup access analog input Analog pin #0 (A0)
var analogValue=0,counter=0;

// Global variables used in program
var chatId;
var chatName;

  
// When someone send message to bot this event runs to get message.
api.on('message', function(message)
{
	chatId = message.chat.id;			// To reply we need sender id
	chatName = message.chat.first_name;	// Sender first name
	var command="";
	var txt="";
	var commandType=false;
	
	// It'd be good to check received message type here
	// And react accordingly
	// We consider that only text messages can be received here
	//if(message.chat.id == "82112412")
	//{	
		message.text = message.text.toLowerCase();	// Firs convert message to lower case.
	//	Check the message to get command
		if(message.text.indexOf("help")>-1)
		{
			txt="\n\rAvailabe commands\n\r" +
			"Get location\n\r" +
			"Get temperature\n\r" +
			"Get plate number\n\r" +
			"Take a photo\n\r" +
			"Led on(test)\n\r" +
			"Led off(test)\n\r";
			console.log("Availabe commands asked");	
			commandType=true;
		}
		else if(message.text.indexOf("led on")>-1)
		{
			myLed.write(1);
			txt="\n\rLED is on!";
			console.log("LED is on!");	
			commandType=true;
		}	
		else if(message.text.indexOf("led off")>-1)
		{
			myLed.write(0)
			txt="\n\rLED is off!";
			console.log("LED is off!");
			commandType=true;
		}
		else if(message.text.indexOf("temp")>-1
		|| message.text.indexOf("temperature")>-1)
		{
			for(i=0;i<10;i++)
			{
				analogValue = analogValue + analogPin0.read(); //read the value of the analog pin
			}
			analogValue = analogValue / 10;
			var resistance=(1023-analogValue)*10000/analogValue; 
			var temperature=1/(Math.log(resistance/10000)/3975+1/298.15)-273.15;
			temperature = Math.round(temperature * 10) / 10;
			txt="\n\rTemperature is "+temperature + '\xB0' + "C";
			console.log("Temperature is "+temperature + '\xB0' + "C");
			commandType=true;
			analogValue = 0;
		}
		else if(message.text.indexOf("plate number")>-1)
		{
			txt="\n\rTruck plate number is B-TR-3427";
			console.log("Trcuk plate number is B-TR-3427");
			commandType=true;
		}
		else if(message.text.indexOf("pic")>-1
		|| message.text.indexOf("picture")>-1
		|| message.text.indexOf("photo")>-1)
		{
			api.sendPhoto({
				chat_id: chatId,
				caption: "Truck Camera",
				// you can also send file_id here as string (as described in telegram bot api documentation)
				photo: "/home/erhan/TruckBot/nodejs/truckcam.jpeg"
				}, function(err, data)
				{	if(err)
					console.log(err);
				});
			txt="\n\rPicture taken";
			console.log("Picture taken");
			commandType=true;
		}
		else if(message.text.indexOf("loc")>-1
		|| message.text.indexOf("location")>-1)
		{
			api.sendLocation({
				chat_id: chatId,
				latitude: 52.505582,
				longitude: 13.393242,
				}, function(err, data)
				{	if(err)
					console.log(err);
				});
			txt="\n\rTruck location";
			console.log("Truck location");
			commandType=true;
		}
		else	// Unknown message
		{
			txt="\n\rUnknown Command";
			commandType=true;
		}
//////////////////////////////////////////////////

		if(commandType)
		{
			api.sendMessage({
				chat_id: chatId,
				text: chatName+":"+txt
			}, function(err, message)
			{
				if(err)console.log(err);
				console.log(message);		// More info about message packet
				console.log(chatName+":"+txt);
			});
		}
	//}
	/*
	else
	{
		api.sendMessage({
				chat_id: chatId,
				text: chatName+":Please get lost!"
			}, function(err, message)
			{
				if(err)console.log(err);
				console.log(message);		// More info about message packet
				console.log(chatName+":Tried to acces to system!");
			});
	}
	*/
});