var options = {};
var defaultOptions = {
    'title': 'Ogame Notificator', //x
    'isActive': true, // x
    'soundActive': true,
    'soundVolume': 100,
    'maxIdleTimeSeconds': 30, // x
    'randomIdleTime': true, // x
    'randomIdleTimeMin': 30, // x
    'randomIdleTimeMax': 180, // x
    'checkIdleTimeSeconds': 1,
    'attackText': 'You are being attacked on {type} {coords}!', // x
    'spioText': 'You are being spied on {type} {coords}!', // x
    'planetText': 'planet', // x
    'moonText': 'moon', // x
    'makerWebhooksActive': false,
    'makerWebhooksUrl': ''
};

chrome.storage.sync.get(defaultOptions, function(storageOptions) {
    options = storageOptions;
    //console.log('options', options);
    start();
});

function start()
{
    if(options.isActive)
    {
        // request permission on page load
        document.addEventListener('DOMContentLoaded', function () {
            if (!Notification) {
                alert('Desktop notifications not available in your browser. Try Google-Chrome.');
                return;
            }

            if (Notification.permission !== "granted")
                Notification.requestPermission();
        });

        function notifyMe(title, message, messageOptions) {
            if(typeof messageOptions == 'undefined')
            {
                messageOptions = {};
            }
            if(messageOptions.hasOwnProperty('coords'))
            {
                message = message.replace(/\{coords\}/g, messageOptions.coords);
            }
            if(messageOptions.hasOwnProperty('type'))
            {
                message = message.replace(/\{type\}/g, messageOptions.type);
            }
            if (Notification.permission !== "granted")
                Notification.requestPermission();
            else {
                var notification = new Notification(title, {
                    icon: 'chrome-extension://'+chrome.runtime.id+'/alert.png',
                    body: message
                });
                if(options.soundActive)
                {
                    audioNotification();
                }
                if(options.makerWebhooksActive)
                {
                    makerWebhooksNotification();
                }
            }
        }
        function audioNotification()
        {
            var alertSound = new Audio('chrome-extension://'+chrome.runtime.id+'/alert.mp3');
            alertSound.volume = parseInt(options.soundVolume) / 100;
            alertSound.play();
            setTimeout(function(){
                alertSound.pause()
            }, 9000);
        }

        function makerWebhooksNotification()
        {
            var xhr = new XMLHttpRequest();
            xhr.open("GET",options.makerWebhooksUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    //console.log(xhr.responseText);
                }
            };
            xhr.send();
        }

        /* Idle detection */
        var idleTime = 0;
        var tempIdleTime = 1000000;
        var idleInterval = window.setInterval(timerIncrement, 1000 * parseInt(options.checkIdleTimeSeconds));
        function timerIncrement() {
            idleTime = idleTime + 1;
            if(options.randomIdleTime)
            {
                if(idleTime === 1)
                {
                    tempIdleTime = Math.floor(Math.random() * (parseInt(options.randomIdleTimeMax) - parseInt(options.randomIdleTimeMin)+ 1)) + parseInt(options.randomIdleTimeMin);
                }
                else
                {
                    //console.log(idleTime, tempIdleTime);
                    if(idleTime > tempIdleTime)
                    {
                        window.location.reload();
                    }
                }
            }
            else
            {
                if(idleTime >= parseInt(options.maxIdleTimeSeconds))
                {
                    window.location.reload();
                }
            }
        }
        function resetIdleTime()
        {
            idleTime = 0;
        }

        /* Reset idle time when user interacts */
        document.addEventListener("click", resetIdleTime);
        document.addEventListener("mousemove", resetIdleTime);
        document.addEventListener("scroll", resetIdleTime);
        document.addEventListener("keypress", resetIdleTime);
        document.addEventListener("mousedown", resetIdleTime);
        document.addEventListener("touchstart", resetIdleTime);

        /* Check for attacks and send notification and sound */
        var attackAlert = document.getElementById('attack_alert');
        if(attackAlert.classList.contains('soon'))
        {
            // check if spio or attack
            var openEventList = document.getElementById('js_eventDetailsClosed');
            openEventList.click();
            window.setTimeout(function(){
                var eventTable = document.getElementById('eventContent');
                if(eventTable)
                {
                    var events = eventTable.getElementsByTagName('tr');
                    for(var i = 0; i < events.length; i++)
                    {
                        var event = events[i];
                        var notifyEnabled = true;
                        var missionType = parseInt(event.dataset.missionType);
                        if(missionType === 1 || missionType === 6)
                        {
                            var text = missionType === 1 ? options.attackText : options.spioText;
                            var coords = '';
                            var type = options.planetText;
                            for(var j = 0; j < event.childNodes.length; j++)
                            {
                                var td = event.childNodes[j];
                                //console.log('td '+j,td);
                                if(td.classList)
                                {
                                    if(td.classList.contains('destCoords'))
                                    {
                                        coords = td.innerText;
                                    }
                                    if(td.classList.contains('destFleet'))
                                    {
                                        var planetIcons = td.getElementsByTagName('figure');

                                        var planetIcon = planetIcons[0];
                                        if(planetIcon.classList.contains('moon'))
                                        {
                                            type = options.moonText;
                                        }
                                    }
                                    if(j === 13)
                                    {
                                        if(td.classList.contains('icon_movement_reserve'))
                                        {
                                            notifyEnabled = false;
                                        }
                                    }
                                    if(j === 1)
                                    {
                                        if(td.classList.contains('hostile') === false)
                                        {
                                            notifyEnabled = false;
                                        }
                                    }
                                }
                            }
                            if(notifyEnabled)
                            {
                                notifyMe(options.title, text, {'coords' : coords, 'type': type});
                            }
                        }
                    }
                }
            }, 1000);
        }
    }
}
