const Alexa = require('alexa-sdk');
var twilio = require('twilio');
var preset_texts = require('./preset_texts')
var config = require('./config.json');
var accountSid = config.account
var authToken = config.token


const handlers = {
    'LaunchRequest': function () {
        var welcomeSpeech = 'Welcome to spam texter. Ask for preset messages and then send spam to your friends or enemies'
        var repromptSpeech = 'If you are having troubles view the skill for more information'
        this.response.speak(welcomeSpeech).listen(repromptSpeech);
        this.emit(':responseReady');
	},
     'Unhandled': function() {
              this.emit(':tell', 'Could not understand');
       },
    'AMAZON.HelpIntent': function () {
          var welcomeSpeech = 'For example ask spam texter to spam message 1 to the phone number of you choice'
          var repromptSpeech = 'Anything else you would like to ask?'
          this.response.speak(welcomeSpeech).listen(repromptSpeech);
          this.emit(':responseReady');
      },
      'AMAZON.StopIntent': function () {
          console.log('stop skill')
          self.emit(':tell', 'Stopping the spam texter skill')
      },
      'AMAZON.CancelIntent': function () {
          console.log('cancel skill')
          self.emit(':tell', 'Canceling the spam texter skill')
      },
    'presets': function () {
        const intentObj = this.event.request.intent;


        if (intentObj.slots.number.value){
            this.emit(':tell', preset_texts[parseInt(intentObj.slots.number.value) - 1] );
        }

        else{
            var presetSpeech = ""
            for (var i=0; i < preset_texts.length; i++){
                var num = i+1;
                presetSpeech = presetSpeech + " Preset " + num.toString() + " is " + preset_texts[i] + " . "
            }
            console.log(presetSpeech)
            this.emit(':tell',presetSpeech)
        }

    },
    'messageintent': function () {
            const intentObj = this.event.request.intent;

            if (!intentObj.slots.number.value)
            {
                var errorSpeech = "You need to specify a preset message number"
                this.emit(':tell',errorSpeech)
            }
            if (!intentObj.slots.phone.value)
            {
                var errorSpeech = "You need to specify a phone number to spam"
                this.emit(':tell',errorSpeech)
            }
             if (!intentObj.slots.multiplier.value)
            {
                var spam_times = 4;
            }
            else{
                if (intentObj.slots.multiplier.value >= 7){
                    var spam_times = 6;
                }
                else{
                    var spam_times = intentObj.slots.multiplier.value + 1;
                }
            }
            console.log(preset_texts[mess_num])
            var mess_num = parseInt([intentObj.slots.number.value])-1
            var client = new twilio(accountSid, authToken);
            for (var i =0; i < spam_times; i++){
                setTimeout(send_message,3000,client,preset_texts[mess_num],"+1" + intentObj.slots.phone.value)
            }
            var responseSpeech= 'Successfully Spammed ' + " with " + preset_texts[mess_num]
            this.emit(':tell',responseSpeech)
    },

};

function send_message(client, body, to){
    console.log(to,body)
    client.messages.create({
         body: body,
         to: to,  // Text this number
         from:  "+17014011046" // From a valid Twilio number
     })
     .then((message) => console.log(message.sid));
 }

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.appId = 'amzn1.ask.skill.46c1a976-1c20-4724-b52b-1d633f99c876' // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.

    alexa.execute();
};