# Bitfont

A small bitmap font designer for creating pixel fonts and exporting them as C data for embedded projects.

## Features

* Create bitmap glyphs using a grid-based editor
* Supports printable ASCII characters
* Adjustable glyph width and height
* Draw and erase individual pixels
* Export glyph data as `.c` and `.h` files
* Save and load font data using browser local storage

## Font Format

Glyphs are stored in **column-major** order, with each column packed into bytes from top to bottom. This makes the generated data convenient to render directly onto column-oriented bitmap displays.

For example, an 8-pixel-high glyph can be represented as:

```c
const uint8_t font[] = {
    0x00, 0x3C, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x42
};
```

Each byte represents one column of pixels, with individual bits representing the rows of that column.

## Why?

I built Bitfont to make it easier to create small bitmap fonts for embedded displays. The generated font data can be dropped directly into projects such as my [Raspberry Pi Pico SSD1306 graphics library](https://github.com/toblaroni/SSD1306-pico-library).

## Usage

Open the web app, select a character, and draw the glyph using the pixel grid. Adjust the dimensions as needed, then export the font when finished.
