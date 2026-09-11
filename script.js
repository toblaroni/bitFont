const ascii = { " ": 32, "!": 33, "\"": 34, "#": 35, "$": 36, "%": 37, "&": 38, "'": 39, "(": 40, ")": 41, "*": 42, "+": 43, ",": 44, "-": 45, ".": 46, "/": 47, "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, ":": 58, ";": 59, "<": 60, "=": 61, ">": 62, "?": 63, "@": 64, "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, "G": 71, "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, "M": 77, "N": 78, "O": 79, "P": 80, "Q": 81, "R": 82, "S": 83, "T": 84, "U": 85, "V": 86, "W": 87, "X": 88, "Y": 89, "Z": 90, "[": 91, "\\": 92, "]": 93, "^": 94, "_": 95, "`": 96, "a": 97, "b": 98, "c": 99, "d": 100, "e": 101, "f": 102, "g": 103, "h": 104, "i": 105, "j": 106, "k": 107, "l": 108, "m": 109, "n": 110, "o": 111, "p": 112, "q": 113, "r": 114, "s": 115, "t": 116, "u": 117, "v": 118, "w": 119, "x": 120, "y": 121, "z": 122, "{": 123, "|": 124, "}": 125, "~": 126 };

const colEl = document.getElementById("columns");
const rowEl = document.getElementById("rows");
const glyphEl = document.getElementById("glyph-container");
const clearBtn = document.getElementById("clear");

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

clearBtn.addEventListener("click", () => {
    glyphGrid = [];
    createGlyphGrid();
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

// Character selector
const asciiCharsEl = document.getElementById("ascii-chars-container");

function createAsciiChars() {
    for (let i = 33; i <= 126; i++) {
        const char = document.createElement("div");

        char.classList.add("ascii-char");
        char.textContent = String.fromCharCode(i);
        char.dataset.ascii = i;

        asciiCharsEl.appendChild(char);
    }
}

createAsciiChars();
