const colEl = document.getElementById("columns");
const rowEl = document.getElementById("rows");
const glyphEl = document.getElementById("glyph-container");
const clearBtn = document.getElementById("clear");

let glyphGrid = [];
let drawing = false;
let erasing = false;

// Character selector
const asciiCharsEl = document.getElementById("ascii-chars-container");

let glyphs = {};

function createNewGlyph() {
    return Array.from(
        { length: Number(rowEl.value) },
        () => Array(Number(colEl.value)).fill(0)
    );
}

(function createAsciiChars() {
    for (let i = 33; i <= 126; i++) {
        const char = document.createElement("div");

        const character = String.fromCharCode(i);
        char.classList.add("ascii-char");
        char.textContent = character;
        char.dataset.ascii = i;

        asciiCharsEl.appendChild(char);
        glyphs[i] = createNewGlyph();
    }
})();

function createGlyphsObj() {
    for (let i = 33; i <= 126; i++) {
        glyphs[i] = createNewGlyph();
    }
}

// Highlight the default glyph ("!"")
let currentGlyph = 33;

let glyphDiv = document.querySelector(`[data-ascii='${currentGlyph}']`);
glyphDiv.classList.add("selected-glyph");

// Char selection
asciiCharsEl.addEventListener("click", (event) => {
    if (!event.target.classList.contains("ascii-char"))
        return;

    currentGlyph = Number(event.target.dataset.ascii);
    glyphDiv.classList.remove("selected-glyph");
    glyphDiv = event.target;
    glyphDiv.classList.add("selected-glyph")
    loadCurrentGlyph();
});

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
};

function loadCurrentGlyph() {
    let colNum = Number(colEl.value);
    let rowNum = Number(rowEl.value);
    for (let row = 0; row < rowNum; row++) {
        for (let col = 0; col < colNum; col++) {
            const cell = document.querySelector(
                `[data-col='${col}'][data-row='${row}']`
            );

            if (glyphs[currentGlyph][row][col]) {
                cell.classList.add("active-pixel");
            } else {
                cell.classList.remove("active-pixel");
            }
        }
    }
}

createGlyphGrid();

// TODO - create a warning that if changed it may ruin current glyph data...
[colEl, rowEl].forEach((el) => {
    el.addEventListener("change", () => {
        createGlyphGrid();
    });
});

clearBtn.addEventListener("click", () => {
    
});

function setPixel(pixel, turnOn) {
    const col = Number(pixel.dataset.col);
    const row = Number(pixel.dataset.row);
    
    glyphGrid[row][col] = turnOn ? 1 : 0;
    glyphs[currentGlyph][row][col] = turnOn ? 1 : 0;
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
