const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');

// resize logic ensures canvas dimensions match displayed size
function resizeCanvas(){
    // preserve current drawing
    const backup=canvas.toDataURL();
    // compute new pixel sizes based on window
    canvas.width = Math.min(window.innerWidth * 0.95, 900);
    canvas.height = Math.min(window.innerHeight * 0.7, 500);
    const img=new Image();
    img.src=backup;
    img.onload=()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
    };
}

// initial sizing
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', () => {
    // debounce
    clearTimeout(window.__resizeTimeout);
    window.__resizeTimeout = setTimeout(resizeCanvas, 100);
});


const colorPicker=document.getElementById('colorPicker');
const brushSize=document.getElementById('brushSize');
const brushBtn=document.getElementById('brush');
const eraserBtn=document.getElementById('eraser');
const undoBtn=document.getElementById('undo');
const redoBtn=document.getElementById('redo');
const clearBtn=document.getElementById('clear');
const downloadBtn=document.getElementById('download');

let painting=false;
let currentColor="#000000";
let currentSize=5;
let erasing=false;

let undoStack=[];
let redoStack=[];

function saveState(){
    undoStack.push(canvas.toDataURL());
    redoStack=[];

}

function restoreState(stackFrom,stackTo){
    if(stackFrom.length===0)return;
    stackTo.push(canvas.toDataURL());
    const imgData=stackFrom.pop();

    const img=new Image();
    img.src=imgData;

    img.onload=()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);
    };
}

function getPosition(e){
    const rect=canvas.getBoundingClientRect();
    if(e.touches){
        return {
            x:e.touches[0].clientX-rect.left,
            y:e.touches[0].clientY-rect.top

        };
    }

    return {
        x:e.clientX-rect.left,
        y:e.clientY-rect.top
    };
}


function startDrawing(e){
    painting=true;
    saveState();
    draw(e);

}

function stopDrawing(){
    painting=false;
    ctx.beginPath();

}

function draw(e){
    if(!painting) return;
    const {x,y}=getPosition(e);

    ctx.lineWidth=currentSize;
    ctx.lineCap='round';
    ctx.lineJoin="round";

    if(erasing){
        ctx.globalCompositeOperation='destination-out';

    }
    else{
        ctx.globalCompositeOperation='source-over';
        ctx.strokeStyle=currentColor;

    }

    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y);

}


canvas.addEventListener('mousedown',startDrawing);
canvas.addEventListener('mouseup',stopDrawing);
canvas.addEventListener('mousemove',draw);
canvas.addEventListener('touchstart',startDrawing);
canvas.addEventListener('touchend',stopDrawing);
canvas.addEventListener('touchmove',draw);

colorPicker.addEventListener('input',e=>{
    currentColor=e.target.value;
    erasing=false;
});

brushSize.addEventListener('input',e=>{
    currentSize=e.target.value;

});

brushBtn.addEventListener('click',()=>{
    erasing=false;
});

eraserBtn.addEventListener('click',()=>{
    erasing=true;
});

undoBtn.addEventListener('click',()=>{
    restoreState(undoStack,redoStack);


});

redoBtn.addEventListener('click',()=>{
    restoreState(redoStack,undoStack);

});

clearBtn.addEventListener('click',()=>{
    saveState();
    ctx.clearRect(0,0,canvas.width,canvas.height);

});

downloadBtn.addEventListener('click',()=>{
    const link=document.createElement('a');
    link.download='drawing.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
});

