"use strict";

const imgSize = 48;
const dotSize = 4;

function unset(arr, value){
    if(arr.includes(value)){
        arr.splice(arr.indexOf(value), 1);
    }
}