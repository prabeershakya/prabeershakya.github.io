/**
 * A 3x5 pixel font, drawn as five 3-bit rows per glyph (MSB = left column).
 *
 * Shared by two renderers: Astro frontmatter (static SSR frames) and bundled
 * client scripts (the animated terminal), so both always draw identical
 * letterforms. Uppercase only — `draw` calls `toUpperCase()` — which is the
 * retro-terminal read we want.
 *
 * Glyphs are 3 wide with a 1-column gap, so the advance is 4 cells.
 * Missing glyphs render as blank; the sequence data in TerminalArt.astro must
 * stay inside this character set.
 */
export const GLYPHS: Record<string, [number, number, number, number, number]> = {
	A: [0b010, 0b101, 0b111, 0b101, 0b101],
	B: [0b110, 0b101, 0b110, 0b101, 0b110],
	C: [0b011, 0b100, 0b100, 0b100, 0b011],
	D: [0b110, 0b101, 0b101, 0b101, 0b110],
	E: [0b111, 0b100, 0b110, 0b100, 0b111],
	F: [0b111, 0b100, 0b110, 0b100, 0b100],
	G: [0b011, 0b100, 0b101, 0b101, 0b011],
	H: [0b101, 0b101, 0b111, 0b101, 0b101],
	I: [0b111, 0b010, 0b010, 0b010, 0b111],
	J: [0b011, 0b001, 0b001, 0b101, 0b010],
	K: [0b101, 0b101, 0b110, 0b101, 0b101],
	L: [0b100, 0b100, 0b100, 0b100, 0b111],
	M: [0b101, 0b111, 0b101, 0b101, 0b101],
	N: [0b110, 0b101, 0b101, 0b101, 0b101],
	O: [0b010, 0b101, 0b101, 0b101, 0b010],
	P: [0b110, 0b101, 0b110, 0b100, 0b100],
	R: [0b110, 0b101, 0b110, 0b101, 0b101],
	S: [0b011, 0b100, 0b010, 0b001, 0b110],
	T: [0b111, 0b010, 0b010, 0b010, 0b010],
	U: [0b101, 0b101, 0b101, 0b101, 0b111],
	V: [0b101, 0b101, 0b101, 0b101, 0b010],
	W: [0b101, 0b101, 0b111, 0b111, 0b101],
	X: [0b101, 0b101, 0b010, 0b101, 0b101],
	Y: [0b101, 0b101, 0b010, 0b010, 0b010],
	Z: [0b111, 0b001, 0b010, 0b100, 0b111],
	"0": [0b111, 0b101, 0b101, 0b101, 0b111],
	"1": [0b010, 0b110, 0b010, 0b010, 0b111],
	"2": [0b111, 0b001, 0b111, 0b100, 0b111],
	"3": [0b111, 0b001, 0b011, 0b001, 0b111],
	"4": [0b101, 0b101, 0b111, 0b001, 0b001],
	"5": [0b111, 0b100, 0b111, 0b001, 0b111],
	"6": [0b111, 0b100, 0b111, 0b101, 0b111],
	"7": [0b111, 0b001, 0b001, 0b010, 0b010],
	"8": [0b111, 0b101, 0b111, 0b101, 0b111],
	"9": [0b111, 0b101, 0b111, 0b001, 0b111],
	">": [0b100, 0b010, 0b001, 0b010, 0b100],
	_: [0b000, 0b000, 0b000, 0b000, 0b111],
	"-": [0b000, 0b000, 0b111, 0b000, 0b000],
	".": [0b000, 0b000, 0b000, 0b000, 0b010],
	",": [0b000, 0b000, 0b000, 0b010, 0b100],
	":": [0b000, 0b010, 0b000, 0b010, 0b000],
	"/": [0b001, 0b001, 0b010, 0b100, 0b100],
	"[": [0b011, 0b010, 0b010, 0b010, 0b011],
	"]": [0b110, 0b010, 0b010, 0b010, 0b110],
	"{": [0b001, 0b010, 0b110, 0b010, 0b001],
	"}": [0b100, 0b010, 0b011, 0b010, 0b100],
	"#": [0b101, 0b111, 0b101, 0b111, 0b101],
	"%": [0b101, 0b001, 0b010, 0b100, 0b101],
	"+": [0b000, 0b010, 0b111, 0b010, 0b000],
	" ": [0b000, 0b000, 0b000, 0b000, 0b000],
};

export const CHAR_W = 3;
export const CHAR_H = 5;
/** Glyph width plus the 1-column gap. */
export const ADVANCE = 4;

/** Rendered width of a string, in cells. */
export const textWidth = (text: string): number =>
	Math.max(0, text.length * ADVANCE - (ADVANCE - CHAR_W));
