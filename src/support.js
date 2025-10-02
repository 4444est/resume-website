export class ColorGenerator {
	constructor(colorPalette) {
		this.colorPalette = colorPalette;
		this.currentColorIndex = Math.floor(Math.random() * this.colorPalette.length);
		this.colors = ["maroon", "red", "lightRed", "orange", "yellow", "lightGreen", "green", 
									"teal", "blue", "purple", "lightPurple"];
	}

	getRandomColorFromPalette() {
		if (this.colorPalette.length < 2) {
			console.error("Palette needs at least two colors to work properly");
			return null; // Guard clause to handle palettes with less than two colors
		}
		let randomIndex;
		do {
			randomIndex = Math.floor(Math.random() * this.colorPalette.length);
		} while (randomIndex === this.currentColorIndex && this.colorPalette.length > 1); // Ensure a different color, if possible

		this.currentColorIndex = randomIndex; // Update the current color index
		console.log(this.colors[randomIndex]);
		return this.colorPalette[randomIndex]; // Return the new color
	}

	getNextColorFromPalette() {
		if (this.colorPalette.length < 2) {
			console.error("Palette needs at least two colors to work properly");
			return null; // Guard clause to handle palettes with less than two colors
		}
		console.log(this.colors[(this.currentColorIndex+1) % this.colorPalette.length]);
		return this.colorPalette[++this.currentColorIndex % this.colorPalette.length];

  }

	getCurrentColor() {
		return this.colorPalette[this.currentColorIndex];
	}
}


export function getRandomColorWithLightness(lightness) {
	// Ensure lightness is between 0 and 100
	if (lightness < 0 || lightness > 100) {
		console.error("Lightness must be between 0 and 100");
		return null;
	}

	// Generate random hue and saturation
	const hue = Math.floor(Math.random() * 360); // Hue between 0 and 359
	const saturation = 100; // Saturation between 0 and 100%

	// Convert HSL to RGB, then RGB to Hex
	const rgb = hslToRgb(hue, saturation, lightness);
	const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
	return hex;
}

function hslToRgb(h, s, l) {
	s /= 100;
	l /= 100;
	const k = n => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
	return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}

function rgbToHex(r, g, b) {
	return "#" + [r, g, b].map(x => {
		const hex = x.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}).join("");
}