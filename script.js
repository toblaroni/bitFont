const colEl = document.getElementById("columns");
const rowEl = document.getElementById("rows");
const glyphEl = document.getElementById("glyph-container");
const clearBtn = document.getElementById("clear");

const fontNameEl = document.getElementById("font-name")

const showMetrics = document.getElementById("show-metrics");

let drawing = false;
let erasing = false;

// Character selector
const asciiCharsEl = document.getElementById("ascii-chars-container");

let glyphs = {};
let currentRows = Number(rowEl.value);
let currentCols = Number(colEl.value);

const guides = [
    { name: "ascender",  className: "ascender-guide",  row: 1, element: null },
    { name: "x-height",  className: "x-height-guide",  row: 3, element: null },
    { name: "baseline",  className: "baseline-guide",  row: 5, element: null },
    { name: "descender", className: "descender-guide", row: 7, element: null }
];


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
applyMetricsVisibility();

// Store projects in local storage.
function saveProject() {
    const project = {
        fontName: fontNameEl.value,
        rows: currentRows,
        cols: currentCols,
        glyphs: glyphs,
        guides: guides.map(guide => guide.row),
        showMetrics: showMetrics.checked
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
    fontNameEl.value = project.fontName;

    rowEl.value = project.rows;
    colEl.value = project.cols;

    showMetrics.checked = project.showMetrics !== false;

    if (Array.isArray(project.guides)) {
        guides.forEach((guide, i) => {
            if (Number.isInteger(project.guides[i])) {
                guide.row = Math.max(0, project.guides[i])
            }
        })
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
    attachGuides();
};

// Save whenever it loses focues
fontNameEl.addEventListener("blur", () => saveProject());

function applyMetricsVisibility() {
    glyphEl.classList.toggle("hide-metrics", !showMetrics.checked);
}

showMetrics.addEventListener("change", () => {
    applyMetricsVisibility();
    saveProject();
});

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


// === Metric guides ===
// Each guide keeps its own DOM element so it survives grid rebuilds.
// `row` is a boundary index: 0 = top edge of the grid, `rows` = bottom edge.

// Y position (relative to the glyph container's padding box) of every row boundary
function makeDraggable(element, guide) {
    let dragging = false;

    element.addEventListener("pointerdown", (event) => {
        dragging = true;
        element.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    element.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const boundaries = getRowBoundaries();
        if (boundaries.length === 0) return;

        const originY = glyphEl.getBoundingClientRect().top + glyphEl.clientTop;
        const y = event.clientY - originY;

        // Snap to the closest row boundary
        let closest = 0;
        for (let i = 1; i < boundaries.length; i++) {
            if (Math.abs(y - boundaries[i]) < Math.abs(y - boundaries[closest])) {
                closest = i;
            }
        }

        element.style.top = `${boundaries[closest]}px`;
        guide.row = closest;
    });

    element.addEventListener("pointerup", (event) => {
        dragging = false;
        element.releasePointerCapture(event.pointerId);
        saveProject();
    });
}

function getRowBoundaries() {
    const pixels = glyphEl.querySelectorAll(".glyph-pixel");
    const rows = Number(rowEl.value);
    const cols = Number(colEl.value);

    if (pixels.length < rows * cols) return [];

    // clientTop = top border width, so this matches what `top: ...px` is relative to
    const originY = glyphEl.getBoundingClientRect().top + glyphEl.clientTop;

    const boundaries = [];

    for (let row = 0; row < rows; row++) {
        const rect = pixels[row * cols].getBoundingClientRect();
        boundaries.push(rect.top - originY);
    }

    // Bottom edge of the last row
    const lastRect = pixels[(rows - 1) * cols].getBoundingClientRect();
    boundaries.push(lastRect.bottom - originY);

    return boundaries;
}

function createGuideElement(guide) {
    const element = document.createElement("div");

    element.className = `metric-guide ${guide.className}`;
    element.dataset.label = guide.name;

    makeDraggable(element, guide);   // listeners are attached once and persist
    guide.element = element;
}

// Re-attach guides after the grid is rebuilt, clamp them to the new size,
// and move them to their stored row.
function attachGuides() {
    const rows = Number(rowEl.value);

    guides.forEach(guide => {
        if (!guide.element) createGuideElement(guide);

        glyphEl.appendChild(guide.element);
        guide.row = Math.min(guide.row, rows);
    });

    // Positioning needs the guides' parent laid out, so do it after appending.
    positionGuides();
}

function positionGuides() {
    const boundaries = getRowBoundaries();
    if (boundaries.length === 0) return;

    guides.forEach(guide => {
        guide.element.style.top = `${boundaries[guide.row]}px`;
    });
}


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

function generateCFile(fontName) {
    let output = `#include "${fontName}.h"\n\n`;

    output += `const uint8_t ${fontName}_data[] = {\n`;

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

function generateHeaderFile(fontName) {
    const bytesPerColumn = Math.ceil(currentRows / 8);

    const fontNameUp = fontName.toUpperCase();

    return `#ifndef ${fontNameUp}_H
#define ${fontNameUp}_H

#include <stdint.h>

#define ${fontNameUp}_FIRST_CHAR 32
#define ${fontNameUp}_LAST_CHAR 126
#define ${fontNameUp}_CHAR_WIDTH ${currentCols}
#define ${fontNameUp}_CHAR_HEIGHT ${currentRows}
#define ${fontNameUp}_BYTES_PER_COLUMN ${bytesPerColumn}

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
    let fontName = document.getElementById("font-name").value;

    var disallowedChars = /[<>:"\/\\|?*\x00-\x1F]/;
    // Check if the filename contains any disallowed characters
    if (disallowedChars.test(fontName)) {
        alert("Fontname contains illegal characters.")
        return;
    } else if (fontName.trim() === '') {
        alert("Font name cannot be empty.")
        return;
    } if (fontName.length > 255) {
        alert("Font name exceeds the maximum length (255).")
        return;
    }

    fontName = fontName.replace('-', "_");

    const cFile = generateCFile(fontName);
    const hFile = generateHeaderFile(fontName);

    downloadFile(`${fontName}.c`, cFile);
    downloadFile(`${fontName}.h`, hFile);
});

