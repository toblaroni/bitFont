const colEl = document.getElementById("columns");
const rowEl = document.getElementById("rows");
const glyphEl = document.getElementById("glyph-container");
const clearBtn = document.getElementById("clear");

let drawing = false;
let erasing = false;

// Character selector
const asciiCharsEl = document.getElementById("ascii-chars-container");

let glyphs = {};
let currentRows = Number(rowEl.value);
let currentCols = Number(colEl.value);

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

loadProject();

function createGlyphsObj() {
    for (let i = 33; i <= 126; i++) {
        glyphs[i] = createNewGlyph();
    }
}

// Store projects in local storage.
function saveProject() {
    const project = {
        rows: currentRows,
        cols: currentCols,
        glyphs: glyphs
    };

    localStorage.setItem("bitfont-project", JSON.stringify(project));
}

function loadProject() {
    const saved = localStorage.getItem("bitfont-project");

    if (!saved) {
        return;
    }

    const project = JSON.parse(saved);

    currentRows = project.rows;
    currentCols = project.cols;
    glyphs = project.glyphs;
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

    for (let row = 0; row < rowNum; row++) {
        for (let col = 0; col < colNum; col++) {
            const div = document.createElement("div");

            div.classList.add("glyph-pixel");
            div.dataset.col = col;
            div.dataset.row = row;

            const value = glyphs[currentGlyph][row][col];

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

function resizeGlyphs() {
    const cols = Number(colEl.value);
    const rows = Number(rowEl.value);

    for (const character in glyphs) {
        const oldGlyph = glyphs[character];
        let newGlyph = [];

        for (let row = 0; row < rows; row++) {
            newGlyph[row] = [];

            for (let col = 0; col < cols; col++) {
                // If row doesn't exist make it zero
                newGlyph[row][col] = oldGlyph[row]?.[col] ?? 0;
            }
        }
        glyphs[character] = newGlyph;
    }
}


[colEl, rowEl].forEach((el) => {
    el.addEventListener("change", () => {
        const newRows = Number(rowEl.value);
        const newCols = Number(colEl.value);

        // Only warn if the grid is getting smaller
        if (newRows < currentRows || newCols < currentCols) {
            const confirmed = confirm(
                "Reducing the grid size may delete existing pixels. Continue?"
            );

            if (!confirmed) {
                // Restore the previous value
                if (el === rowEl) {
                    rowEl.value = currentRows;
                } else {
                    colEl.value = currentCols;
                }

                return;
            }
        }

        resizeGlyphs();

        currentRows = newRows;
        currentCols = newCols;

        createGlyphGrid();
        saveProject();
    });
});


clearBtn.addEventListener("click", () => {
    // Clear the current glyph
    for (let row = 0; row < currentRows; row++) {
        glyphs[currentGlyph][row].fill(0);
    }

    loadCurrentGlyph();
    saveProject();
});

function setPixel(pixel, turnOn) {
    const col = Number(pixel.dataset.col);
    const row = Number(pixel.dataset.row);
    
    glyphs[currentGlyph][row][col] = turnOn ? 1 : 0;
    if (turnOn) {
        pixel.classList.add("active-pixel");
    } else {
        pixel.classList.remove("active-pixel");
    }

    saveProject();
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


// === Exporting ===
function glyphToBytes(glyph) {
    const bytes = [];
    const bytesPerColumn = Math.ceil(currentRows / 8);

    for (let col = 0; col < currentCols; col++) {
        for (let byteIndex = 0; byteIndex < bytesPerColumn; byteIndex++) {
            let byte = 0;

            for (let bit = 0; bit < 8; bit++) {
                const row = byteIndex * 8 + bit;

                if (row < currentRows && glyph[row][col]) {
                    byte |= 1 << bit;
                }
            }

            bytes.push(byte);
        }
    }

    return bytes;
}

function generateCFile() {
    let output = `#include "bitfont.h"\n\n`;

    output += `const uint8_t font[] = {\n`;

    for (let i = 32; i <= 126; i++) {   // Include whitespace

        const glyph = glyphs[i] ??
            Array.from(
                { length: currentRows },
                () => Array(currentCols).fill(0)
            );

        const bytes = glyphToBytes(glyph);

        const character = String.fromCharCode(i);
        const displayChar = 
            character === "\\" ?  "BACKSLASH" : 
            character === " " ? "SPACE" : character;

        output += `    // ${displayChar}\n`;
        output += `    ${bytes.map(byte => `0x${byte.toString(16).padStart(2, "0")}`).join(", ")},\n`;
    }

    output += `};\n`;

    return output;
}

function generateHeaderFile() {
    return `#ifndef BITFONT_H
#define BITFONT_H

#include <stdint.h>

#define FONT_FIRST_CHAR 32
#define FONT_LAST_CHAR 126
#define FONT_CHAR_WIDTH ${currentCols}
#define FONT_CHAR_HEIGHT ${currentRows}

extern const uint8_t font[];

#endif
`;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], {
        type: "text/plain"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);
}

document.getElementById("export").addEventListener("click", () => {
    const cFile = generateCFile();
    const hFile = generateHeaderFile();

    downloadFile("bitfont.c", cFile);
    downloadFile("bitfont.h", hFile);
});