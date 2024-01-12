
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

export type ProbabilityItem<T> = {
    item: T
    probability: number
}

export class Probabilities<T>{
    probabilities: Map<T, number>;
    remaining: number;
    constructor(){
        this.probabilities = new Map<T, number>();
        this.remaining = 1;
    }
    has(t:T):boolean{
        return this.probabilities.has(t);
    }
    addProbability(val: T){
        //if(this.remaining === 0)
        this.probabilities.set(val, 0);
    }
    changeProbability(k: T, value: number, from: T | null=null): boolean{
        //if(!this.probabilities.has(k)) return false;
        const kProb = this.probabilities.get(k);
        if(kProb === undefined) return false;
        if(from !== null){
            // add probabilities  from -> k
            const fromProb = this.probabilities.get(from);
            if(fromProb){
                const change = value > fromProb ? fromProb : value;
                this.probabilities.set(k, kProb+change);
                this.probabilities.set(from, fromProb-change);
            }else{
                return false;
            }
        }else{
            // add probabilities remaining -> k
            console.log(value);
            if(this.remaining === 0) return false;
            const change = value > this.remaining ? this.remaining : value;
            this.probabilities.set(k, kProb+change);
            this.remaining -= change;
        }
        return true;
    }
    asList():ProbabilityItem<T>[]{
        return [...this.probabilities.entries()].map(([key, val]) => {
            return {item: key, probability: val};
        })
    }
    roll():T | null{
        let r = Math.random();
        const value: T | null = [...this.probabilities.entries()].reduce(
            (v: T | null, [val, prob]) => {
            if(v !== null) return v;
            if(r < prob){
                v = val;
            }
            r -= prob;
            return v;
        }, null);
        return value;
    }
}
