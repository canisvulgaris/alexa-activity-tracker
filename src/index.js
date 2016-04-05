/**
 * Skill to pull your latest activity (from Nikeplus)
 * App ID for the skill
 */

/**
 * RESPONSE IDEAS:
 * my last activity
 * time since my last run
 * total distance
 * nikeplus level
 * longest run distance
 * my last three runs
 */


var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * API SAMPLES
 * 
 * Get Access Token:
 * curl -i -k -X POST --data "email={email}&password={password}" -H "Accept: application/json" "https://api.nike.com/nsl/v2.0/user/login/?client_id=d521c22cd024759fbe9b83dd10eb895e&app=fuelband&client_secret=e3f522abd784736d"
 *
 * Get Activities:
 * curl 'https://api.nike.com/v1/me/sport/activities?access_token={access_token}' -H 'Accept: application/json' 
 * sample: curl 'https://api.nike.com/v1/me/sport/activities?access_token=HXSr7AIxJNmqz4ZLnmoCNVchuZRK&_=1459827762620' -H 'Pragma: no-cache' -H 'DNT: 1' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8,ru;q=0.6,es;q=0.4,pt;q=0.2'  -H 'Accept: application/json' -H 'Referer: https://api.nike.com/nikeplus/js/v2/iframe.html'  -H 'Connection: keep-alive' -H 'Cache-Control: no-cache' --compressed
 * docs: https://developer.nike.com/documentation/api-docs/activity-services/list-activities.html
 *
 * User Totals
 * curl 'https://api.nike.com/v1/me/sport?access_token={access_token} -H 'Accept: application/json' 
 * sample: curl 'https://api.nike.com/v1/me/sport?access_token=HXSr7AIxJNmqz4ZLnmoCNVchuZRK&_=1459827948820' -H 'Pragma: no-cache' -H 'DNT: 1' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8,ru;q=0.6,es;q=0.4,pt;q=0.2'  -H 'Accept: application/json' -H 'Referer: https://api.nike.com/nikeplus/js/v2/iframe.html' -H 'Connection: keep-alive' -H 'Cache-Control: no-cache' --compressed
 * docs: https://developer.nike.com/documentation/api-docs/activity-services/aggregate-sport-data.html
 *
 */
var apiPrefix = 'https://api.nike.com';
var apiListActivities = '/v1/me/sport/activities';
var apiUserTotals = '/v1/me/sport';

var ACCESS_TOKEN = 'tgxGyTyADqliFvR25sbGzWTQL7A0';

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var MONTHS = ['January', 'February', 'March', 'Aril', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/**
 * using AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var ActivityTrackerSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ActivityTrackerSkill.prototype = Object.create(AlexaSkill.prototype);
ActivityTrackerSkill.prototype.constructor = ActivityTrackerSkill;

ActivityTrackerSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("ActivityTrackerSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

ActivityTrackerSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("ActivityTrackerSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

ActivityTrackerSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

ActivityTrackerSkill.prototype.intentHandlers = {

    "GetLastActivityIntent": function (intent, session, response) {
        handleLastActivityRequest(intent, session, response);
    },

    // "GetTimeSinceLastRunIntent": function (intent, session, response) {
    //     handleTimeSinceLastActivityRequest(intent, session, response);
    // },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Nike Plus, you can track your activity and performance data.  " +
            "For example, you could ask what was my last activity, or what is my total distance run. Now, how can I help you?";
        var repromptText = "What do you want to know?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Nike Plus Data";
    var repromptText = "With Nike Plus, you can track your activity and performance data.  " +
            "For example, you could ask what was my last activity, or what is my total distance run. Now, how can I help you?";
    var speechText = "<p>Nke Plus Data.</p> <p>What kind of Nikeplus Data do you want?</p>";
    var cardOutput = "Nike Plus. What data can I return for you?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleLastActivityRequest(intent, session, response) {

    var prefixContent = "<p>Your last Nike Plus activity </p>";

    getLastActivityFromNikePlus(ACCESS_TOKEN, function (activity) {
        
        if ( activity == {} ) {
            speechText = "No previous Nike Plus Activities found.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            //type
            var typeText = activity.activityType;

            //date and time
            var activityDate = Date(activity.startTime); 
            var dateText =  DAYS[activityDate.getDay()] + " "
                        + activityDate.getDate() + " " + MONTHS[activityDate.getMonth()] + " "
                        + activityDate.getFullYear() + " at " + activityDate.getHours() + " "
                        + activityDate.getMinutes();

            //duration
            var durationText = "";
            durationSplit = (activityDate.metricSummary.duration).split(':');
            if (durationSplit[0] == 0 ) {
                durationText = durationSplit[1] + " minutes and " 
                                + durationSplit[2] + " seconds"
            } else {
                durationText = durationSplit[0] + " hours " 
                                + durationSplit[1] + " minutes and " 
                                + durationSplit[2] + " seconds"
            }

            //distance
            distanceText = (activity.metricSummary.distance).toFixed(2);

            speechText = prefixContent + 
                            " was a " + typeText +
                            " on " + dateText +
                            " for " + durationText +
                            " and a distance of " + distanceText + " kilometers";

            var speechOutput = {
                speech: "<speak>" + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        }
    });
}

function getLastActivityFromNikePlus(access_token, eventCallback) {
    var url = apiPrefix + apiListActivities + '?access_token=' + access_token;

    console.log("getLastActivityFromNikePlus url: " + url);

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            console.log("getLastActivityFromNikePlus body: " + body);
            var resultActivity = parseLastActivityJson(body);
            eventCallback(resultActivity);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseLastActivityJson(inputText) {    
    var retActivity;

    if (inputText.data.length > 0) {
        retActivity = inputText.data[0];  
    }
    
    return retActivity;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the ActivityTracker Skill.
    var skill = new ActivityTrackerSkill();
    skill.execute(event, context);
};

