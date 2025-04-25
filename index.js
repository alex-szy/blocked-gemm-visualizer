const loopVars = ["i", "j", "k"];
let currentStep = 0;
let autoInterval = null;
let loopSequence = [];
let selectedTile = null;

function initLoopBox(boxId) {
    const box = document.getElementById(boxId);
    box.innerHTML = "";
    loopVars.forEach((v) => {
        const div = document.createElement("div");
        div.className = "loop-tile";
        div.textContent = v;
        div.addEventListener("click", (e) => handleTileClick(e, boxId));
        box.appendChild(div);
    });
}

function handleTileClick(e, boxId) {
    e.stopPropagation();
    if (selectedTile) {
        removeArrows(selectedTile);
        selectedTile = null;
    }
    const tile = e.currentTarget;
    selectedTile = tile;
    showArrows(tile, boxId);
}

function showArrows(tile, boxId) {
    const parent = document.getElementById(boxId);
    const tiles = Array.from(parent.children);
    const index = tiles.indexOf(tile);

    if (index > 0) {
        const leftArrow = document.createElement("button");
        leftArrow.className = "arrow arrow-left";
        leftHTML = "&#8592;";
        leftArrow.innerHTML = leftHTML;
        leftArrow.onclick = (e) => {
            e.stopPropagation();
            swapTiles(parent, index - 1, index);
        };
        tile.appendChild(leftArrow);
    }

    if (index < tiles.length - 1) {
        const rightArrow = document.createElement("button");
        rightArrow.className = "arrow arrow-right";
        rightHTML = "&#8594;";
        rightArrow.innerHTML = rightHTML;
        rightArrow.onclick = (e) => {
            e.stopPropagation();
            swapTiles(parent, index, index + 1);
        };
        tile.appendChild(rightArrow);
    }
}

function swapTiles(parent, i, j) {
    const tiles = Array.from(parent.children);
    if (i >= 0 && j >= 0 && i < tiles.length && j < tiles.length) {
        const temp = tiles[i];
        parent.insertBefore(tiles[j], tiles[i]);
        parent.insertBefore(temp, tiles[j].nextSibling);
        removeArrows(tiles[i]);
        removeArrows(tiles[j]);
        selectedTile = null;
    }
}

function removeArrows(tile) {
    tile.querySelectorAll(".arrow").forEach((el) => el.remove());
}

function deselectTiles(e) {
    if (selectedTile) {
        removeArrows(selectedTile);
        selectedTile = null;
    }
}

function populateTileOptions() {
    const size = +document.getElementById("matrixSize").value;
    const powers = Array.from(
        { length: Math.log2(size) + 1 },
        (_, i) => 2 ** i
    );
    ["tileSizeI", "tileSizeJ", "tileSizeK"].forEach((id) => {
        const select = document.getElementById(id);
        select.innerHTML = "";
        powers.forEach((p) => {
            const opt = document.createElement("option");
            opt.text = p;
            select.add(opt);
        });
    });
}

function initializeMatrix() {
    const size = +document.getElementById("matrixSize").value;
    const containers = ["matrixA", "matrixB", "matrixC"];
    containers.forEach((id) => {
        const box = document.getElementById(id);
        box.innerHTML = "";
        for (let i = 0; i < size; i++) {
            const row = document.createElement("div");
            row.className = "matrix-row";
            for (let j = 0; j < size; j++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.id = `${id[6].toLowerCase()}-${i}-${j}`;
                row.appendChild(cell);
            }
            box.appendChild(row);
        }
    });
    currentStep = 0;
    buildLoopSequence();
}

function buildLoopSequence() {
    const size = +document.getElementById("matrixSize").value;
    const tileSize = {
        i: +document.getElementById("tileSizeI").value,
        j: +document.getElementById("tileSizeJ").value,
        k: +document.getElementById("tileSizeK").value,
    };
    const outer = Array.from(
        document.getElementById("outerLoopBox").children
    ).map((el) => el.textContent);
    const inner = Array.from(
        document.getElementById("innerLoopBox").children
    ).map((el) => el.textContent);
    loopSequence = [];

    const range = (max, step) =>
        Array.from({ length: Math.ceil(max / step) }, (_, i) => i * step);

    const outerSpace = {};
    outer.forEach((d) => (outerSpace[d] = range(size, tileSize[d])));
    const innerSpace = {};
    inner.forEach((d) => (innerSpace[d] = range(tileSize[d], 1)));

    for (let o1 of outerSpace[outer[0]])
        for (let o2 of outerSpace[outer[1]])
            for (let o3 of outerSpace[outer[2]])
                for (let i1 = 0; i1 < tileSize[inner[0]]; i1++)
                    for (let i2 = 0; i2 < tileSize[inner[1]]; i2++)
                        for (let i3 = 0; i3 < tileSize[inner[2]]; i3++) {
                            const ctx = { i: 0, j: 0, k: 0 };
                            ctx[outer[0]] = o1;
                            ctx[outer[1]] = o2;
                            ctx[outer[2]] = o3;
                            ctx[inner[0]] += i1;
                            ctx[inner[1]] += i2;
                            ctx[inner[2]] += i3;
                            if (ctx.i < size && ctx.j < size && ctx.k < size)
                                loopSequence.push([ctx.i, ctx.j, ctx.k]);
                        }
}

function nextStep() {
    if (currentStep >= loopSequence.length) currentStep = 0;
    const [i, j, k] = loopSequence[currentStep];
    document
        .querySelectorAll(".cell")
        .forEach((c) =>
            c.classList.remove("highlight-a", "highlight-b", "highlight-c")
        );
    document.getElementById(`a-${i}-${k}`)?.classList.add("highlight-a");
    document.getElementById(`b-${k}-${j}`)?.classList.add("highlight-b");
    document.getElementById(`c-${i}-${j}`)?.classList.add("highlight-c");
    currentStep++;
}

function toggleAuto() {
    if (!autoInterval) autoInterval = setInterval(nextStep, 50);
    else {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

document
    .getElementById("matrixSize")
    .addEventListener("change", populateTileOptions);
window.onload = () => {
    initLoopBox("outerLoopBox");
    initLoopBox("innerLoopBox");
    populateTileOptions();
};
