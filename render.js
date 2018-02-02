var imgSize = 48;
var dotSize=4;

function drawPolyLine(lineID, points){
    var style = "fill:none;stroke:black;stroke-width:2"
    return '<polyline id="'+lineID+'" points="'+points+'" style="'+style+'" onclick="drawLine(\''+lineID+'\', true)"/>';
}

function drawComponent(id, newCompInfo, direction, value, pos, pinCount){
    var adjustedPos = pos.offset(-imgSize/2, -imgSize);        
    var leftPos = pos.offset(-24, -imgSize/2);
    var rightPos = pos.offset(24, -imgSize/2);
    var topPos = pos.offset(0, -imgSize);
    var cPos = pos.offset(0, -imgSize/2);
    var bottomPos = pos;
    var pos1, pos2, pos3;
    var angle;

    if(direction==="H"){
        pos1 = leftPos;
        pos2 = rightPos;
        pos3 = bottomPos;
        angle = 0;
    }else{
        pos1 = topPos;
        pos2 = bottomPos;
        pos3 = rightPos.offset(8, 5);
        angle = 90;
    }

    var compStr ='<image id="img'+id+'" xlink:href="images/'+newCompInfo.init+'.png'+'" x="'+adjustedPos.x+'" y="'+adjustedPos.y+'" height="'+imgSize+'" width="'+imgSize+'" onmousedown="move(\''+id+'\')" onmouseup="stopMove()" transform="rotate('+angle+" "+cPos.coords()+')"/>';
    compStr+='<text x="'+pos3.x+'" y="'+pos3.y+'" id="'+"txt"+id+'" text-anchor="middle" style="user-select:none;" onclick="updateValue(\''+id+'\')">'+value+" "+newCompInfo.unit+'</text>';
    compStr+='<circle id="pin-'+pinCount+'" cx="'+pos1.x+'" cy="'+pos1.y+'" r="'+dotSize+'" fill="black" onclick="drawLine(\''+pinCount+'\', false)"></circle>';
    compStr+='<circle id="pin-'+(pinCount+1)+'" cx="'+pos2.x+'" cy="'+pos2.y+'" r="'+dotSize+'" fill="black" onclick="drawLine(\''+(pinCount+1)+'\', false)"></circle>';
    return compStr;
}

function drawNode(id, pos){
    return '<circle id="pin-'+id+'" cx="'+pos.x+'" cy="'+pos.y+'" r="'+4+'" fill="black" onmousedown="handleNode(\''+id+'\')" onmouseup="stopMove()"></circle>';
}

//Plan a line which can connect two components
function findPolyStr(pins, pinId0, pinId1){
    var polyStr = "";
    var pin0 = pins[pinId0];
    var pin1 = pins[pinId1];
    var origin = pin0.pos;
    var dest = pin1.pos;
    var dir0 = pin0.direction;
    var dir1 = pin1.direction;
    var dx = dest.x - origin.x;
    var dy = dest.y - origin.y;
    var mid = origin.offset(dx*0.5, dy*0.5);
    var min = new Position(Math.min(origin.x, dest.x), Math.min(origin.y, dest.y));
    var max = new Position(Math.max(origin.x, dest.x), Math.max(origin.y, dest.y));
    var polyLinePoints = [];
    var midPoints = [];
    var halfImgSize = imgSize/2;
    if(!dir0){ dir0 = [dx*Math.abs(dir1[1]),dy*Math.abs(dir1[0])];}
    if(!dir1){ dir1 = [-dx*Math.abs(dir0[1]),-dy*Math.abs(dir0[0])];}
    var kx = dx*dir0[0]>0 && dx*dir1[0]<0;
    var sx = dir1[0]*dir0[0]>0;
    if(dir0 && dir1){    
        if(dir0[1]===0 && dir1[1]===0){
            if(sx){
                if(Math.abs(dy)>halfImgSize){
                    if(dir1[0]<0){
                        midPoints.push([min.x-halfImgSize, origin.y]);
                        midPoints.push([min.x-halfImgSize, dest.y]);
                    }else{
                        midPoints.push([max.x+halfImgSize, origin.y]);
                        midPoints.push([max.x+halfImgSize, dest.y]);
                    }
                }else if(Math.abs(dy)<imgSize){
                    midPoints.push([origin.x+dir0[0]*halfImgSize, origin.y]);
                    if(dy*dx*dir1[0]>=0){
                        midPoints.push([origin.x+dir0[0]*halfImgSize, max.y - halfImgSize]);
                        midPoints.push([dest.x+dir1[0]*halfImgSize, max.y - halfImgSize]);    
                    }else{
                        midPoints.push([origin.x+dir0[0]*halfImgSize, min.y + halfImgSize]);
                        midPoints.push([dest.x+dir1[0]*halfImgSize, min.y + halfImgSize]);
                    }
                    midPoints.push([dest.x+dir1[0]*halfImgSize, dest.y]);    
                }else{
                    midPoints.push([mid.x, origin.y]);
                    midPoints.push([mid.x, dest.y]);
                }
            }else{
                if(dx*dir0[0]>=0 && (Math.abs(dx)>imgSize || Math.abs(dy)<imgSize)){
                    midPoints.push([mid.x, origin.y]);
                    midPoints.push([mid.x, dest.y]);
                }else{
                    midPoints.push([origin.x+dir0[0]*halfImgSize, origin.y]);
                    if(Math.abs(dy)>=imgSize){
                        midPoints.push([origin.x+dir0[0]*halfImgSize, mid.y]);
                        midPoints.push([dest.x+dir1[0]*halfImgSize, mid.y]);
                    }else{
                        midPoints.push([origin.x+dir0[0]*halfImgSize, min.y - halfImgSize]);
                        midPoints.push([dest.x+dir1[0]*halfImgSize, min.y - halfImgSize]);
                    }
                    midPoints.push([dest.x+dir1[0]*halfImgSize, dest.y]);
                } 
            }
        }else if(dir0[0]===0 && dir1[0]===0){
            if(dy*dir0[1]>0 && dy*dir1[1]<0 && Math.abs(dy)>imgSize){
                midPoints.push([origin.x, mid.y]);
                midPoints.push([dest.x, mid.y]);
            }else if(dir1[1]*dir0[1]>0 && Math.abs(dx)>halfImgSize){
                if(dir1[1]<0){
                    midPoints.push([origin.x, min.y-imgSize]);
                    midPoints.push([dest.x, min.y-imgSize]);
                }else{
                    midPoints.push([origin.x,max.y+imgSize]);
                    midPoints.push([dest.x, max.y+imgSize]);
                }
            }else if(Math.abs(dx)>imgSize){
                midPoints.push([origin.x, origin.y+dir0[1]*halfImgSize]);
                midPoints.push([mid.x, origin.y+dir0[1]*halfImgSize]);
                midPoints.push([mid.x, dest.y+dir1[1]*halfImgSize]);
                midPoints.push([dest.x, dest.y+dir1[1]*halfImgSize]);
            }else if(dy*dir0[1]<0 || dy*dir1[1]>0){
                midPoints.push([origin.x, origin.y+dir0[1]*halfImgSize]);
                if(dir1[1]*dir0[1]>0){
                    if(dx*dy*dir1[1]>=0){
                        midPoints.push([max.x - halfImgSize,origin.y+dir0[1]*halfImgSize]);
                        midPoints.push([max.x - halfImgSize,dest.y+dir1[1]*halfImgSize]);    
                    }else{
                        midPoints.push([min.x + halfImgSize,origin.y+dir0[1]*halfImgSize]);
                        midPoints.push([min.x + halfImgSize,dest.y+dir0[1]*halfImgSize]);
                    }
                }else{
                    midPoints.push([min.x - halfImgSize, origin.y + dir0[1]*halfImgSize]);
                    midPoints.push([min.x - halfImgSize, dest.y + dir1[1]*halfImgSize]);
                }
                midPoints.push([dest.x, dest.y+dir1[1]*halfImgSize]);    
            }else{
                midPoints.push([origin.x, mid.y]);
                midPoints.push([dest.x, mid.y]);
            }
        }else if(dir0[0]===0 && dir1[1]===0){
            if(dy*dir0[1]>0 && dx*dir1[0]<0){
                midPoints.push([origin.x, dest.y]);
            }else{
                midPoints.push([dest.x, origin.y]);
            }
        }else{
            if(dx*dir0[0]>0 && dy*dir1[1]<0){
                midPoints.push([dest.x, origin.y]);
            }else{                    
                midPoints.push([origin.x, dest.y]);
            }
        }
    }

    polyLinePoints.push(origin.coords());
    polyLinePoints = polyLinePoints.concat(midPoints);
    polyLinePoints.push(dest.coords());
    for(var i=0; i<polyLinePoints.length; i++){
        polyStr+=polyLinePoints[i][0]+","+polyLinePoints[i][1]+" ";
    }
    return polyStr;
}

