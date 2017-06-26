var defaultOptions = {
    'title': 'Ogame Notificator',
    'isActive': true,
    'soundActive': true,
    'soundVolume': 100,
    'maxIdleTimeSeconds': 30,
    'randomIdleTime': true,
    'randomIdleTimeMin': 30,
    'randomIdleTimeMax': 180,
    'checkIdleTimeSeconds': 1,
    'attackText': 'You are being attacked on {type} {coords}!',
    'spioText': 'You are being spied on {type} {coords}!',
    'planetText': 'planet',
    'moonText': 'moon',
    'makerWebhooksActive': false,
    'makerWebhooksUrl': ''
};



// Saves options to chrome.storage.sync.
function save_options() {
    var saveOptions = {};
    for(var key in defaultOptions)
    {
        var el = document.getElementById(key);
        var value = '';
        if(el)
        {
            if (el.type && el.type === 'checkbox')
            {
                value = el.checked;
            }
            else
            {
                value = el.value;
            }
            saveOptions[key] = value;
        }
    }
    chrome.storage.sync.set(saveOptions, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(defaultOptions, function(storageOptions) {
        for(var key in storageOptions)
        {
            var value = storageOptions[key];
            var el = document.getElementById(key);
            console.log('key', key);
            console.log('value', value);
            if(el)
            {
                if (el.type && el.type === 'checkbox')
                {
                    el.checked = value;
                }
                else
                {
                    el.value = value;
                }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);