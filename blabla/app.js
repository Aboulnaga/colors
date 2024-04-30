// hue.style.backgroundImage = `linear-gradient(
//   to right,
//   rgb(204,75,75),
//    rgb(204,204,75),
//     rgb(75,204,75),
//     rgb(75,204,204),
//     rgb(75,75,204),
//     rgb(204,75,204),
//     rgb(204,75,75)
//     )`;

//selectors
//
const colorsPallete = document.querySelectorAll(".color");
const colorsSider = document.querySelectorAll(".color-adjust-menu");
const colorsSiderInput = document.querySelectorAll('input[type="range"]');
let initialColors;
//console.log(initialColors);
//event listeners
colorsSiderInput.forEach((colorInput) => {
  colorInput.addEventListener("input", adjustPalleteBySliders);
});

colorsPallete.forEach((pallete, index) => {
  pallete.addEventListener("change", () => {
    updatePalleteTextUI(index);
  });
});

//functions
colorizeDIVS();
function colorizeDIVS() {
  initialColors = [];
  colorsPallete.forEach((pallete) => {
    const hexColor = chromaRandomColor();
    const hexTXT = pallete.querySelector("h2");
    initialColors.push(chroma(hexColor).hex());
    hexTXT.textContent = hexColor;
    const bg = (pallete.style.backgroundColor = hexColor);
    // check hex title contrast with the div background color
    checkLuminance(hexColor, hexTXT);
    // colorize pallete adjustment slider
    const slider = pallete.querySelectorAll(`input[type="range"]`);
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    colorizePalleteAdjustmentSlider(hexColor, hue, saturation, brightness);
  });

  //reset sliders input

  resetInputs();
}

function chromaRandomColor() {
  color = chroma.random();
  return color;
  console.log(color);
}

function checkLuminance(hexColor, hexTXT) {
  const luminance = hexColor.luminance();
  luminance > 0.5
    ? (hexTXT.style.color = "Black")
    : (hexTXT.style.color = "white");
}

function colorizePalleteAdjustmentSlider(
  hexColor,
  hue,
  saturation,
  brightness
) {
  const lowSaturation = chroma(hexColor).set("hsl.s", 0);
  const highSaturation = chroma(hexColor).set("hsl.s", 1);
  const scaleSaturation = chroma.scale([
    lowSaturation,
    hexColor,
    highSaturation,
  ]);

  saturation.style.backgroundImage = `linear-gradient(to right, 
    ${scaleSaturation(0)}, ${scaleSaturation(1)} )`;

  const midBrightness = chroma(hexColor).set("hsl.l", 0.5);
  const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);

  brightness.style.backgroundImage = `linear-gradient(to right, 
    black, ${scaleBrightness(0.5)} , white )`;

  hue.style.backgroundImage = `linear-gradient(
  to right,
  rgb(204,75,75),
   rgb(204,204,75),
    rgb(75,204,75),
    rgb(75,204,204),
    rgb(75,75,204),
    rgb(204,75,204),
    rgb(204,75,75)
    )`;
}

function adjustPalleteBySliders(e) {
  // const color = chroma().set("hsl.h").set("hsl.l").set("hsl.s");
  const adjustPalleteSliders =
    e.target.parentElement.querySelectorAll(`input[type="range"`);

  const hue = adjustPalleteSliders[0];
  const brightness = adjustPalleteSliders[1];
  const saturation = adjustPalleteSliders[2];

  const palleteIndex =
    e.target.getAttribute("color-hue") ||
    e.target.getAttribute("color-bri") ||
    e.target.getAttribute("color-sat");

  //const palletHex = colorsPallete[palleteIndex].querySelector("h2").innerText;
  const palletHex = initialColors[palleteIndex];
  const color = chroma(palletHex)
    .set("hsl.h", hue.value)
    .set("hsl.l", brightness.value)
    .set("hsl.s", saturation.value);

  colorsPallete[palleteIndex].style.backgroundColor = color;
  colorizePalleteAdjustmentSlider(color, hue, saturation, brightness);
}

function updatePalleteTextUI(index) {
  const activeColorPallete = colorsPallete[index];
  const color = chroma(activeColorPallete.style.backgroundColor);
  const hexText = activeColorPallete.querySelector("h2");
  const controlIcons = activeColorPallete.querySelectorAll(
    ".color-control button"
  );
  controlIcons[0].style.color = color;
  controlIcons[1].style.color = color;

  hexText.innerText = color.hex();
}

function resetInputs() {
  const allSliders = document.querySelectorAll(`input[type="range"]`);
  allSliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("color-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = hueValue;
    }
    if (slider.name === "brightness") {
      const brightnessColor = initialColors[slider.getAttribute("color-bri")];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = brightnessValue;
    }
    if (slider.name === "saturation") {
      const saturationColor = initialColors[slider.getAttribute("color-sat")];
      const saturationValue = chroma(saturationColor).hsl()[1];
      slider.value = saturationValue;
    }
  });
}
