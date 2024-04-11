//import * as WebSocket from "ws";
/*
        let socketURL='ws://'+window.location.hostname + ":"+PORT+"/"
        //console.log('ws://'+window.location.hostname + ":"+PORT+"/"+"token="+user);
        socket= new WebSocket('ws://'+window.location.hostname + ":"+PORT+"/");//+"token="+user
        //so with token, it ends up in app.get, else it ends up w/ ws
        //i guess bc the websocket listens for "/"
        socket.onopen = async() => {
            let msgObj={
                type:"Auth",
                data:user
            }
            console.log("HELLO");
            await socket.send(JSON.stringify(msgObj));
            socket.onmessage= (event) => {
                                // The 'data' property of the 'event' object contains the server's message
                                let serverMessage = JSON.parse(event.data);

                                if (serverMessage.type === 'authResponse') {
                                    // Handle the server's response to the auth request
                                    // For example, you might redirect to another page
                                    window.location.href = serverMessage.redirectUrl;
                                }
                            };
            const redirectUrl = response.url;
            window.location.href = redirectUrl;
        };
*/
const PORT=4000;
let drawXSize=20;
let drawYSize=20;
let currentMaze=null;
let isPlaying=false;
const socket = new WebSocket('ws://'+window.location.hostname + ":"+PORT+"/");//conn fail
socket.onmessage=(event)=>{//used to tell player game over
    console.log('Received:', event.data);
    if (event.data.toLowerCase()=="game over"){
        //game over
    }
    else if (event.data.toLowerCase()=="escaped"){

    }
};
socket.onclose=(event)=>{
    //lost connection, attempt to reconnect.
    //if connection failed
}

class genParams{
    xSize;
    ySize;
    exitCount;
    constructor(x,y,eCnt){
        this.xSize=x;
        this.ySize=y;
        this.exitCount=eCnt;
    }
}



async function playMaze(){
    if (currentMaze!=null && !isPlaying){
        //block all other buttons until game is done
        isPlaying=true;
        var url="http://"+ window.location.hostname + ":"+PORT +'/playMaze';
            //http://localhost:5173/
        var jsonBody=JSON.stringify(currentMaze);

        const response = await fetch(url, {
            method:"POST",
            body:jsonBody
        })
        let results = await response.text();
        if (results==1){
            let canvas=document.getElementById("mazeCanvas");
            let ctx = canvas.getContext("2d");
            ctx.clear();
            ctx.fillStyle="black";
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        else{
            isPlaying=false;
        }

    }
    else{
        alert("NO MAZE AVAILABLE TO PLAY");
    }
}
document.addEventListener("keydown", (event) => {
    var code=event.keyCode;
    action(code)
});
/*
the server should control how the game works i guess?
w/s: forward/backward movement
a/d: turn left/right
space bar: flash

*/
async function action(code){
    if (isPlaying){
        //send request to move to server
        var url="http://"+ window.location.hostname + ":"+PORT +'/actionRequest';

        const response = await fetch(url, {
            method:"POST",
            body:code
        })
        let results = await response.text();
        let jsonResult=JSON.parse(results);
    }
}

async function clearMaze(){
    if(!isPlaying){
        let canvas=document.getElementById("mazeCanvas");
        let ctx = canvas.getContext("2d");
        ctx.clear();
        currentMaze=null;
    }
}

//const socket=new WebSocket("ws://"+ window.location.hostname + ":"+PORT)
async function makeMaze(){
    if(!isPlaying){
        var url="http://"+ window.location.hostname + ":"+PORT +'/generateMaze';
        //http://localhost:5173/
        var params=new genParams(document.getElementById("Maze X Size").value,document.getElementById("Maze Y Size").value,document.getElementById("Amount of Exits").value);
        var jsonBody=JSON.stringify(params);

        const response = await fetch(url, {
            method:"POST",
            body:jsonBody
        })
        let results = await response.text();
        currentMaze=JSON.parse(results);
        await mapDrawer(currentMaze);

    }

}


async function saveMaze(){
    if (!isPlaying){
        var url="http://"+ window.location.hostname + ":"+PORT +'/saveMaze';
        if (currentMaze!=null){
            console.log("ATTEMPTINMG TO SAVE");
            var jsonBody=JSON.stringify(currentMaze);
            const response = await fetch(url, {
                method:"POST",
                body:jsonBody
            })
            let res=await response.text();
            alert(res);
        }
        else{
            alert("No maze to save!");
        }
    }

}


async function getSavedMazes(){
    if (!isPlaying){
        var url="http://"+ window.location.hostname + ":"+PORT +'/userMazes';
        let listButton=document.getElementById("listMazes");
        while (listButton.firstChild) {
          listButton.removeChild(listButton.lastChild);
        }
        //maybe put a cute loading image or smth while getting mazes, same for generating
        const response = await fetch(url, {
            method:"POST",
        })
        let data= await response.text();
        let jsonResult=JSON.parse(data);
        //{ID:doc.MazeID;XSize:doc.Maze.xSize;YSize:doc.Maze.ySize}
        for (let m of jsonResult){
            let savedMaze=document.createElement("li");
            savedMaze.textContent="ID: " + m.ID + ". Size:" + m.XSize + " by " + m.YSize;
            savedMaze.onclick=function(){
                loadMaze(m.ID);
            }
            listButton.append(savedMaze);
        }
    }
}

//the saved mazes should be separate from above
async function loadMaze(id){
    if(!isPlaying){
        var url="http://"+ window.location.hostname + ":"+PORT +'/loadMaze';
        const response = await fetch(url, {
            method:"POST",
            body:id
        })
        let data= await response.text();
        currentMaze=JSON.parse(data);
        console.log(currentMaze);
        await mapDrawer(currentMaze);
    }
}

async function mapDrawer(maze){
    let tilesToDraw=maze.tiles;
    let canvas=document.getElementById("mazeCanvas");
    let ctxBG = canvas.getContext("2d");
    let detachedCanvas=canvas.cloneNode();
    let ctx=detachedCanvas.getContext("2d")
    ctxBG.fillStyle = "purple";
    ctxBG.fillRect(0,0,canvas.width,canvas.height);
    ctxBG.fillStyle = "black";
    ctxBG.fillRect(0,0,maze.xSize*drawXSize,maze.ySize*drawYSize);
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";

    for(let y=0;y<maze.ySize;y++){
        for(let x=0;x<maze.xSize;x++){
            ctx.beginPath();
            ctx.fillStyle = "white";
            let ourTile=maze.tiles[x][y];

            if (ourTile.type==2){
                console.log("TILE "+x+","+y+" is path");

                if (ourTile.tags.includes("EXIT")){
                    ctx.fillStyle="red";
                }
                else if(ourTile.tags.includes("START")){
                    ctx.fillStyle="green";
                }
                ctx.fillRect(x*drawXSize+1,y*drawYSize+1,drawXSize-2,drawYSize-2);//upper left corner is x,y
                //draw the walls
                for(let w=0;w<4;w++){
                    if (ourTile.walls[w]==1){
                        ctx.beginPath();

                        let startX=0;
                        let startY=0;
                        let endX=0;
                        let endY=0;
                        if (w<2){
                            startX=x*drawXSize;
                            endX=startX+drawXSize;
                            if (w%2==0){
                                startY=y*drawYSize;
                                endY=startY;
                            }
                            else{
                                startY=(y+1)*drawYSize;
                                endY=startY;
                            }
                        }
                        else{
                            startY=y*drawYSize;
                            endY=startY+drawYSize;
                            if (w%2==0){
                                startX=x*drawXSize;
                                endX=startX;
                            }
                            else{
                                startX=(x+1)*drawXSize;
                                endX=startX;
                            }
                        }
                        /*
                            ctx.moveTo(75, 50);
                            ctx.lineTo(100, 75);
                        */
                        //console.log(ctx.strokeStyle);
                        console.log("DRAWING opening FROM " + startX+","+startY+" TO " + endX+","+endY);
                        ctx.moveTo(startX,startY);
                        ctx.lineTo(endX,endY);
                        ctx.stroke();

                    }
                }
            }
        }
    }
    ctxBG.globalAlpha=1;
    ctxBG.drawImage(detachedCanvas,0,0);

}