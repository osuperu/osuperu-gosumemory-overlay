let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
let mapid = document.getElementById('mapid');

// Gameplay Data/Overlay variables
let topContainer = document.getElementById("top");
let bmTitle = document.getElementById("bmTitle");
let progressChart = document.getElementById("progress");
let strainGraph = document.getElementById("strainGraph");

let hundredCounter = document.getElementById("hun");
let fiftyCounter = document.getElementById("fiv");
let missesCounter = document.getElementById("miss");

let sbContainer = document.getElementById("box-sb");
let sbCounter = document.getElementById("sb");

let bottomContainer = document.getElementById("bottom");
let currentSrContainer = document.getElementById("box-currentSr");
let currentSr = document.getElementById("currentSr");
let urContainer = document.getElementById("box-ur");
let ur = document.getElementById("ur");

let bottomContainer2 = document.getElementById("bottom2");
let pp = document.getElementById("pp");
let ppFCContainer = document.getElementById("box-ppFC");
let ppFC = document.getElementById("ppFC");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    ur: new CountUp('ur', 0, 0, 2, .2, { useEasing: true, useGrouping: true, separator: " ", decimal: "." }),
}

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};

let gameState;
let chatState;
let sbData;
let missData
let tempBmTitle;
let tempStrainBase;
let smoothOffset = 2;
let seek;
let fullTime;
let tempSliderBreaks;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (gameState !== data.menu.state || chatState !== data.menu.isChatEnabled || sbData !== data.gameplay.hits.sliderBreaks || missData !== data.gameplay.hits[0]) {
        gameState = data.menu.state;
        chatState = data.menu.isChatEnabled;
        sbData = data.gameplay.hits.sliderBreaks;
        missData = data.gameplay.hits[0];

        // Transitions depending on the section you are, full gameState options on GOsuMemory GitHub 
        switch (gameState + "," + chatState) {
            case "2,0":
                // Gameplay, watching replay
                topContainer.style.transform = "translateX(0)";
                bottomContainer.style.transform = "translateY(0)";

                currentSrContainer.style.transform = "translate(0px, 0px)";
                urContainer.style.transform = "translate(0px, 0px)";

                // Condition to show Sliderbreak counter
                if (sbData > 0) {
                    tempSliderBreaks = data.gameplay.hits.sliderBreaks;
                    sbCounter.innerHTML = `${tempSliderBreaks}xSB`;
                    sbContainer.style.transform = "translateX(0)";
                } else if (sbData == 0) {
                    sbContainer.style.transform = "translateX(-400px)";
                }

                // Condition to show ppFC (Also this is what controls ppCounter position during gameplay)
                if (missData > 0 || sbData > 0) {
                    bottomContainer2.style.transform = "translate(-10px, 0px)";
                    ppFCContainer.style.transform = "translateY(0)";
                } else if (missData == 0 || sbData == 0) {
                    bottomContainer2.style.transform = "translate(-10px, 65px)";
                    ppFCContainer.style.transform = "translateY(-65px)";
                }
                break;

            case "2,1":
                // Viewing chat during gameplay pause
                topContainer.style.transform = "translateX(0)";

                if (sbData > 0) {
                    tempSliderBreaks = data.gameplay.hits.sliderBreaks;
                    sbCounter.innerHTML = `${tempSliderBreaks}xSB`;
                    sbContainer.style.transform = "translateX(0)";
                } else if (sbData == 0) {
                    sbContainer.style.transform = "translateX(-400px)";
                }

                bottomContainer.style.transform = "translateY(200px)";
                bottomContainer2.style.transform = "translate(60px, 200px)";
                break;

            case "7,0":
                // Result Screen
                topContainer.style.transform = "translateX(-400px)";

                bottomContainer.style.transform = "translateY(0)";
                currentSrContainer.style.transform = "translate(-400px, 0px)";
                urContainer.style.transform = "translate(-370px, 45px)";

                bottom2.style.transform = "translate(-370px, 65px)";

                // Condition to show Sliderbreak counter
                if (sbData > 0) {
                    tempSliderBreaks = data.gameplay.hits.sliderBreaks;
                    sbCounter.innerHTML = `${tempSliderBreaks}xSB`;
                    sbContainer.style.transform = "translateX(400px)";
                } else if (sbData == 0) {
                    sbContainer.style.transform = "translateX(0px)";
                }

                // Condition to show ppFC
                if (missData > 0 || sbData > 0) {
                    ppFCContainer.style.transform = "translateY(-125px)";
                } else if (missData == 0 || sbData == 0) {
                    ppFCContainer.style.transform = "translateY(-65px)";
                }
                break;

            case "7,1":
                // Chat on result screen
                if (sbData > 0) {
                    sbContainer.style.transform = "translateX(400px)";
                }

                bottomContainer.style.transform = "translateY(300px)";
                currentSrContainer.style.transform = "translate(-400px, -40px)";
                urContainer.style.transform = "translate(-370px, -100px)";
                bottomContainer2.style.transform = "translate(-370px, 300px)";
                break;

            default:
                topContainer.style.transform = "translateX(-400px)";
                sbContainer.style.transform = "translateX(0px)";
                bottomContainer.style.transform = "translateY(300px)";
                bottomContainer2.style.transform = "translate(-370px, 300px)";
                ur.innerHTML = 0;
                break;
        }
    }

    if (tempStrainBase != JSON.stringify(data.menu.pp.strains)) {
        tempStrainBase = JSON.stringify(data.menu.pp.strains);
        smoothed = smooth(data.menu.pp.strains, smoothOffset);
        config.data.datasets[0].data = smoothed;
        config.data.labels = smoothed;
        configSecond.data.datasets[0].data = smoothed;
        configSecond.data.labels = smoothed;

        window.myLine.update();
        window.myLineSecond.update();
    }

    if (fullTime !== data.menu.bm.time.mp3) {
        fullTime = data.menu.bm.time.mp3;
        onepart = 350 / fullTime;
    }

    if (seek !== data.menu.bm.time.current && fullTime !== undefined && fullTime != 0) {
        seek = data.menu.bm.time.current;
        progressChart.style.width = onepart * seek + 'px';
    }

    if (data.gameplay.pp.current != '') {
        let ppData = data.gameplay.pp.current;
        pp.innerHTML = Math.round(ppData);
    } else {
        pp.innerHTML = "";
    }

    if (data.gameplay.pp.fc != '') {
        let ppFCData = data.gameplay.pp.fc;
        ppFC.innerHTML = Math.round(ppFCData);
    } else {
        ppFC.innerHTML = "";
    }

    if (data.gameplay.hits.unstableRate > 0) {
        animation.ur.update(data.gameplay.hits.unstableRate);
    } else {
        animation.ur.update(0);
    }

    if (tempBmTitle !== data.menu.bm.metadata.artist + ' - ' + data.menu.bm.metadata.title + ' [' + data.menu.bm.metadata.difficulty + ']') {
        tempBmTitle = data.menu.bm.metadata.artist + ' - ' + data.menu.bm.metadata.title + ' [' + data.menu.bm.metadata.difficulty + ']';
        bmTitle.innerHTML = tempBmTitle;

        if (bmTitle.getBoundingClientRect().width >= 300) {
            bmTitle.classList.add("over");
        } else {
            bmTitle.classList.remove("over");
        }
    }

    if (data.menu.bm.stats.SR != '') {
        let currentSrData = data.menu.bm.stats.SR;
        currentSr.innerHTML = currentSrData;
    } else {
        currentSr.innerHTML = "";
    }

    if (data.gameplay.hits[100] > 0) {
        hundredCounter.innerHTML = data.gameplay.hits[100];
    } else {
        hundredCounter.innerHTML = 0;
    }

    if (data.gameplay.hits[50] > 0) {
        fiftyCounter.innerHTML = data.gameplay.hits[50];
    } else {
        fiftyCounter.innerHTML = 0;
    }

    if (data.gameplay.hits[0] > 0) {
        missesCounter.innerHTML = data.gameplay.hits[0];
    } else {
        missesCounter.innerHTML = 0;
    }
}

window.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

    var ctxSecond = document.getElementById('canvasSecond').getContext('2d');
    window.myLineSecond = new Chart(ctxSecond, configSecond);

};

// For Strain graph configuration and color
let config = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            borderColor: 'rgba(255, 255, 255, 0)',
            backgroundColor: 'rgba(200,16,46, 0.6)',
            data: [],
            fill: true,
        }]
    },
    options: {
        tooltips: { enabled: false },
        legend: {
            display: false,
        },
        elements: {
            line: {
                tension: 0.4,
                cubicInterpolationMode: 'monotone'
            },
            point: {
                radius: 0
            }
        },
        responsive: false,
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        }
    }
};

let configSecond = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            borderColor: 'rgba(255, 255, 255, 0)',
            backgroundColor: 'rgba(200,16,46, 0.8)',
            data: [],
            fill: true,
        }]
    },
    options: {
        tooltips: { enabled: false },
        legend: {
            display: false,
        },
        elements: {
            line: {
                tension: 0.4,
                cubicInterpolationMode: 'monotone'
            },
            point: {
                radius: 0
            }
        },
        responsive: false,
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        }
    }
};