let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
let mapid = document.getElementById('mapid');

// Mapping Data/Overlay variables
let topContainer = document.getElementById("top");
let bmTitle = document.getElementById("bmTitle");

let leftContainer = document.getElementById("mapperInfo");
let mapperName = document.getElementById("mapperName");

let rightContainer = document.getElementById("right");
let bmDataContainer = document.getElementById("bmData");
let arContainer = document.getElementById("box-ar");
let odContainer = document.getElementById("box-od");
let csContainer = document.getElementById("box-cs");
let hpContainer = document.getElementById("box-hp");
let ar = document.getElementById("ar");
let od1 = document.getElementById("od1"); //For some reason, od can't just be defined as "od"
let cs = document.getElementById("cs");
let hp = document.getElementById("hp");

let pp = document.getElementById("pp");
let maxpp = document.getElementById("maxpp");

let progressChart = document.getElementById("progress");
let strainGraph = document.getElementById("strainGraph");

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};

let gameState;
let chatState;
let tempBmTitle;
let tempStrainBase;
let smoothOffset = 2;
let seek;
let fullTime;
let mapper;
let arData;
let csData;
let odData;
let hpData;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (gameState !== data.menu.state || chatState !== data.menu.isChatEnabled) {
        gameState = data.menu.state;
        chatState = data.menu.isChatEnabled;
        // Transitions depending on the section you are, full gameState options on GOsuMemory GitHub 
        // Repetitions are nedded to avoid overlapping of instructions 
        switch (gameState + "," + chatState) {
            case "0,0":
                // Principal Screen, didn't put it on default case to avoid transitions conflict 
                topContainer.style.transform = "translate(1025px, -500px)";
                leftContainer.style.transform = "translate(-500px, -700px)";
                rightContainer.style.transform = "translate(-1500px, 600px)";
                bmDataContainer.style.transform = "translate(-1235px, -900px)";
                arContainer.style.transform = "translate(-420px, 240px)";
                odContainer.style.transform = "translate(-280px, 160px)";
                csContainer.style.transform = "translate(-140px, 80px)";
                strainGraph.style.transform = "translateY(500px)";
                break;
            case "1,0":
                // Editing
                topContainer.style.transform = "translate(1025px, -115px)";
                leftContainer.style.transform = "translateY(50px)";
                rightContainer.style.transform = "translateY(50px)";
                bmDataContainer.style.transform = "translate(0px, 0px)";
                //From Vertical to Horizontal stack transition and viceversa
                arContainer.style.transform = "translate(0px, 0px)";
                odContainer.style.transform = "translate(0px, 0px)";
                csContainer.style.transform = "translate(0px, 0px)";
                strainGraph.style.transform = "translateY(0)";
                break;
            case "1,1":
                // Chat Enabled when Editing
                topContainer.style.transform = "translate(1025px, -300px)";
                leftContainer.style.transform = "translate(-400px, 50px)";
                rightContainer.style.transform = "translateY(500px)";
                bmDataContainer.style.transform = "translateY(-1000px)";
                arContainer.style.transform = "translate(0px, 0px)";
                odContainer.style.transform = "translate(0px, 0px)";
                csContainer.style.transform = "translate(0px, 0px)";
                strainGraph.style.transform = "translateY(500px)";
                break;
            case "4,0":
                // Editor Song Selector
                topContainer.style.transform = "translate(1025px, -500px)";
                leftContainer.style.transform = "translateX(-350px)";
                rightContainer.style.transform = "translate(-1520px, -40px)";
                bmDataContainer.style.transform = "translate(-1235px, -585px)";
                //From Vertical to Horizontal stack transition and viceversa
                arContainer.style.transform = "translate(-420px, 240px)";
                odContainer.style.transform = "translate(-280px, 160px)";
                csContainer.style.transform = "translate(-140px, 80px)";
                strainGraph.style.transform = "translateY(500px)";
                break;
            case "4,1":
                // Chat Enablen when on Editor Song Selector
                rightContainer.style.transform = "translate(-1520px, 400px)";
                bmDataContainer.style.transform = "translate(-1235px, -1000px)";
                break;
            default:
                //Transitions thought for F9 menu activation, which is not contemplated on chatState (F8)
                topContainer.style.transform = "translate(1025px, -500px)";
                leftContainer.style.transform = "translate(-500px, 50px)";
                rightContainer.style.transform = "translate(-1520px, 800px)";
                bmDataContainer.style.transform = "translateY(-1000px)";
                strainGraph.style.transform = "translateY(500px)";
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
        onepart = 1110 / fullTime;
    }

    if (seek !== data.menu.bm.time.current && fullTime !== undefined && fullTime != 0) {
        seek = data.menu.bm.time.current;
        progressChart.style.width = onepart * seek + 'px';
    }

    if (arData !== data.menu.bm.stats.AR) {
        arData = data.menu.bm.stats.AR;
        ar.innerHTML = arData;
    }

    if (csData !== data.menu.bm.stats.CS) {
        csData = data.menu.bm.stats.CS;
        cs.innerHTML = csData;
    }

    if (odData !== data.menu.bm.stats.OD) {
        odData = data.menu.bm.stats.OD;
        od1.innerHTML = odData;
    }

    if (hpData !== data.menu.bm.stats.HP) {
        hpData = data.menu.bm.stats.HP;
        hp.innerHTML = hpData;
    }

    if (mapper !== data.menu.bm.metadata.mapper) {
        mapper = data.menu.bm.metadata.mapper
        mapperName.innerHTML = mapper;
    }

    if (data.gameplay.pp.current != '') {
        let ppData = data.gameplay.pp.current;
        pp.innerHTML = Math.round(ppData);
    } else {
        pp.innerHTML = "";
    }

    if (data.menu.pp["100"] != '') {
        let maxppData = data.menu.pp["100"];
        maxpp.innerHTML = Math.round(maxppData);
    } else {
        maxpp.innerHTML = "";
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
}


window.onload = function() {

    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

    var ctxSecond = document.getElementById('canvasSecond').getContext('2d');
    window.myLineSecond = new Chart(ctxSecond, configSecond);

};

/*For StrainGraph configuration and color*/

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