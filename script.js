const colEl = document.getElementById("columns");
const rowEl = document.getElementById("rows");
const glyphEl = document.getElementById("glyph-container");

let glyphGrid = [];
let drawing = false;
let erasing = false;

function createGlyphGrid() {
    let colNum = Number(colEl.value);
    let rowNum = Number(rowEl.value);

    glyphEl.innerHTML = "";

    glyphEl.style.gridTemplateColumns = `repeat(${colNum}, 1fr)`;
    glyphEl.style.gridTemplateRows = `repeat(${rowNum}, 1fr)`;

    const oldGrid = glyphGrid;
    glyphGrid = [];

    for (let row = 0; row < rowNum; row++) {
        glyphGrid[row] = [];

        for (let col = 0; col < colNum; col++) {
            const div = document.createElement("div");

            div.classList.add("glyph-pixel");
            div.dataset.col = col;
            div.dataset.row = row;

            const value = oldGrid?.[row]?.[col] ?? 0;

            glyphGrid[row][col] = value;

            if (value)
                div.classList.add("active-pixel");
        
            glyphEl.appendChild(div);
        }
    }
}

[colEl, rowEl].forEach((el) => {
    el.addEventListener("change", () => {
        createGlyphGrid();
    });
});

function setPixel(pixel, turnOn) {
    const col = Number(pixel.dataset.col);
    const row = Number(pixel.dataset.row);
    
    glyphGrid[row][col] = turnOn ? 1 : 0;
    if (turnOn) {
        pixel.classList.add("active-pixel");
    } else {
        pixel.classList.remove("active-pixel");
    }
}

glyphEl.addEventListener("pointerdown", (event) => {
    if (!event.target.classList.contains("glyph-pixel")) 
        return;

    drawing = true;
    erasing = !event.target.classList.contains("active-pixel");

    setPixel(event.target, erasing);
});

glyphEl.addEventListener("pointerover", (event) => {
    if (!drawing)
        return;
    if (!event.target.classList.contains("glyph-pixel")) 
        return;

    setPixel(event.target, erasing);
});

document.addEventListener("pointerup", () => {
    drawing = false;
});

createGlyphGrid();
