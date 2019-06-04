// display hours of service for specific date

var today = new Date();
var today1 = today.toString().split(" ", 4);

document.getElementById("service").innerHTML = "Hours of Service for " + today1[1] + " " + today1[2] + ", " + today1[3];

const request = new XMLHttpRequest();

request.open('GET', 'https://www.hebcal.com/shabbat/?cfg=json&zip=10804&gy=2019&gm=6&gd=11', true);

request.onload = function() {

    // for opening hours and earliest tevilla

    var day = today.getDay();
    var data = JSON.parse(this.response);

    var lightingIndex = -1;
    var holidayIndex = -1;

    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].category == "candles") {
            lightingIndex = i;
            i = data.items.length;
        }
    }

    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].yomtov == true) {
            holidayIndex = i;
            i = data.items.length;
        }
    }

    if (holidayIndex != -1) { // to account for when there is no yomtov category
        var holiday = true;
    }

    if (day != 5 && !holiday) { 

        var time = data.items[lightingIndex].date; 
        var splitting = time.split('T');
        var lighting = (splitting[1].split('-'))[0].split(':'); 
        var hour = lighting[0];
        var minutes = lighting[1];
        if (day != 6) { // not a saturday so opens 45 min after candlelighting
            var openHour = parseInt(hour, 10);
            var openMinutes = parseInt(minutes, 10) + 45;
            if (openMinutes >= 60) {
                openMinutes = openMinutes - 60;
                openHour++;
            }

            if (openHour > 12) {
                openHour = openHour - 12;
            }
        }
        else { // saturday so opens 1 1/2 after candelighting
            var openHour = parseInt(hour, 10) + 1;
            var openMinutes = parseInt(minutes, 10) + 30;
            if (openMinutes >= 60) {
                openMinutes = openMinutes - 60;
                openHour++;
            }

            if (openHour > 12) {
                openHour = openHour - 12;
            }
        }

        var text = openHour.toString() + ":" + (openMinutes < 10 ? "0" : "") + openMinutes.toString() + " PM";
    }

    else {
        var text = "-";
    }
    document.getElementById("open").innerHTML = text;
    document.getElementById("tevila").innerHTML = text;

    // for last bath, last shower, and closing time

    var month = today.getMonth();

    let season;
    if (month >= 4 && month <= 7) {
        season = 1; // summer
    }
    else {
        season = 0; // winter
    }

    if (season && day != 5 && !holiday) {
        document.getElementById("closes").innerHTML = "11:00 PM";
        document.getElementById("last bath").innerHTML = "10:00 PM";
        document.getElementById("last shower").innerHTML = "10:30 PM";
    }
    else if (!season && day != 5 && !holiday) {
        document.getElementById("closes").innerHTML = "10:00 PM";
        document.getElementById("last bath").innerHTML = "9:00 PM";
        document.getElementById("last shower").innerHTML = "9:30 PM";
    }
    else {
        document.getElementById("closes").innerHTML = "-";
        document.getElementById("last bath").innerHTML = "-";
        document.getElementById("last shower").innerHTML = "-";
    }
    
}

request.send();