
export function randomArrayElement<T>(arr: T[]):T | null{
    if(arr.length === 0) return null;
    return arr[getRandomInteger(arr.length)];
}

export function getRandomInteger(n:number){
    return Math.floor(Math.random()*n);
}

export function getRandomRanges(min:number, max:number){
    return Math.random()*(max-min)+min;
}