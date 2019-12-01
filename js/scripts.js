// display hours of service for specific date

var today = new Date(); 
var today1 = today.toString().split(" ", 4); 
const months = ["January", "February", "March", "April", "May",
 "June", "July", "August", "September", "October", "November", "December"];
document.getElementById("service").innerHTML = "Hours of Service for " + months[today.getMonth()] + " " + today1[2] + ", " + today1[3]; 

// get tomorrow's date
// to check if erev chag or last day of chag
var tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const request1 = new XMLHttpRequest();
const request2 = new XMLHttpRequest();

var tom = tomorrow.toString().split(" ", 4);

var tomDay = parseInt(tom[2]);
var tomYear = tomorrow.getFullYear();
var tomMonth = tomorrow.getMonth() + 1;

var holidayTom = false; // assume false

// find out information about tomorrow
request1.open('GET', `https://www.hebcal.com/shabbat/?cfg=json&zip=10804&gy=${tomYear}&gm=${tomMonth}&gd=${tomDay}`, true);

request1.onload = function() {
    var data = JSON.parse(this.response);

    // find if tom is a holiday
    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].yomtov == true) {
            holidayTom = true;
            i = data.items.length;
        }
    }
}

request1.send();

// find out information about today

var dayToday = parseInt(today1[2]);

console.log(dayToday);

var holiday;
var lastDayOfChag;
var tevilaText;
var openText;

// request with b = 0 so we get the sunset time 
request2.open('GET', `https://www.hebcal.com/shabbat/?cfg=json&zip=10804&gy=${today.getYear()}&gm=${today.getMonth()+1}&gd=${dayToday}&c=on&b=0`, true); 

request2.onload = function() {

    // for opening hours and earliest tevilla
    var data = JSON.parse(this.response);

    var lightingIndex = -1;

    // find which element in the array of the response 
    // has the lighting time for the week
    console.log(data.items.length);
    for (var i = 0; i < data.items.length; i++) { 
        console.log(data.items[i].category);
        if (data.items[i].category == "candles") {
            lightingIndex = i;
            i = data.items.length;
        }
    }

    console.log(lightingIndex);


    // find if it's a holiday
    if (holidayTom) {
        holiday = true;
    }
    else {
        holiday = false;
    }

    for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].yomtov == true) {
            if (holidayTom == false) {
                lastDayOfChag = true;
            }
        }
    }

    if (dayToday != 5 && !holiday && dayToday != 6 && !lastDayOfChag) { // not friday, a holiday, saturday or last day of chag so tevila is 50 min after sunset

        var time = data.items[lightingIndex].date; 
        var splitting = time.split('T');
        var lighting = (splitting[1].split('-'))[0].split(':'); 
        var hour = lighting[0];
        var minutes = lighting[1];
        var tevilaHour = parseInt(hour, 10);
        var tevilaMinutes = parseInt(minutes, 10) + 50;
        var openHour;
        var openMinutes;
        if (tevilaMinutes >= 60) {
            tevilaMinutes = tevilaMinutes - 60;
            tevilaHour++;
        }

        if (tevilaHour > 12) {
            tevilaHour = tevilaHour - 12;
        }

        // calculating opening -- opens at most 30 minutes before tevilah -- round to the nearest hour or half hour
        if (tevilaMinutes > 0 && tevilaMinutes <=30) {
            openMinutes = 0;
            openHour = tevilaHour;
        }
        else {
            openMinutes = 30;
            openHour = tevilaHour;
        }

        tevilaText = tevilaHour.toString() + ":" + (tevilaMinutes < 10 ? "0" : "") + tevilaMinutes.toString() + " PM";
        openText = openHour.toString() + ":" + (openMinutes < 10 ? "0" : "") + openMinutes.toString() + " PM";
    }
}

request2.send();

if (today.getDay() == 6 || lastDayOfChag) { // saturday or last day of chag so make new call and use candle lighting 
    const request3 = new XMLHttpRequest();

    if (today.getDay() == 6) {
        var day = 5; // because need candle lighting from that week 
    }

    request3.open('GET', `https://www.hebcal.com/shabbat/?cfg=json&zip=10804&gy=${today.getYear()}&gm=${today.getMonth()+1}&gd=${today}`, true);

    request3.onload = function() {

        var data = JSON.parse(this.response);

        var lightingIndex = -1;

        // find which element in the array of the response 
        // has the lighting time for the week
        for (var i = 0; i < data.items.length; i++) { 
            if (data.items[i].category == "candles") {
                lightingIndex = i;
                i = data.items.length;
            }
        }

        var time = data.items[lightingIndex].date; 
        var splitting = time.split('T');
        var lighting = (splitting[1].split('-'))[0].split(':'); 
        var hour = lighting[0];
        var minutes = lighting[1];
        var tevilaHour = parseInt(hour, 10) + 1;
            var tevilaMinutes = parseInt(minutes, 10) + 30;
            if (tevilaMinutes >= 60) {
                tevilaMinutes = tevilaMinutes - 60;
                tevilaHour++;
            }

            if (tevilaMinutes >= 0 && tevilaMinutes <= 15) {
                tevilaMinutes = 45;
            }
            else if (tevilaMinutes > 15 && tevilaMinutes <= 30) {
                tevilaMinutes = 0;
                tevilaHour++;
            }
            else if (tevilaMinutes > 30 && tevilaMinutes <= 45) {
                tevilaMinutes = 15;
            }
            else {
                tevilaMinutes = 30;
            }

            if (tevilaHour > 12) {
                tevilaHour = tevilaHour - 12;
            }

            tevilaText = tevilaHour.toString() + ":" + (tevilaMinutes < 10 ? "0" : "") + tevilaMinutes.toString() + " PM";
            openText = tevilaText; // openHour.toString() + ":" + (openMinutes < 10 ? "0" : "") + openMinutes.toString() + " PM";
        }

        request3.send();
    }

    if (today.getDay() == 5 || holiday) {
        tevilaText = "-";
        openText = "-";
    }

    document.getElementById("open").innerHTML = openText;
    document.getElementById("tevila").innerHTML = tevilaText;

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