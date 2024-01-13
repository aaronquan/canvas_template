export type BlockPosition = {x: number, y:number};

export type BlockShape = BlockPosition[];

const blockShapes1:BlockShape[] = [
    [{x:1, y:0}], [{x:0, y:-1}], [{x:1, y:-1}]
];

const blockShapes2 = [
    [{x:1, y:0}, {x:0, y:1}], [{x:1, y:0}, {x:-1, y:0}]
];
const blockShapes3 = [
    [{x:1, y:0}, {x:-1, y:0}, {x: 1, y: -1}]
];

// cannot be negative value

export const comboShape3:BlockShape[] = [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
    [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}]
];

export const comboShape4:BlockShape[] = [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}],
    [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}]
];

export const comboShape5:BlockShape[] = [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x:0, y:1}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x:0, y:2}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x:1, y:2}],
]

export const comboShape6: BlockShape[] = [
    [{x: 0, y: 0}, {x: 0, y: 1},
     {x: 1, y: 1}, {x: 1, y: 1}, {x: 2, y: 0}, {x: 2, y: 1}],
    [{x: 0, y: 0}, {x: 0, y: 1},
     {x: 1, y: 1}, {x: 1, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}],
]

export const allBlockShapes:BlockShape[][] = [[], blockShapes1, blockShapes2, blockShapes3];