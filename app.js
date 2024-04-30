const colorsDiv = document.querySelectorAll(".color");
const currentH2 = document.querySelectorAll(".color h2");
const copyConatiner = document.querySelector(".copied-to-clipboard-container");
const colorAdjustBTNs = document.querySelectorAll(".color-adjust");
const colorsAdjustPanel = document.querySelectorAll(".color-adjust-menu");
const closeColorsAdjustPanelBTN = document.querySelectorAll(
  ".close-color-adjust-menu"
);
const regenerate = document.querySelector(".regenerate");
const colorLocks = document.querySelectorAll(".color-lock");
// For Local Storage
const saveBTN = document.querySelector(".save button");
const saveContainer = document.querySelector(".save-container");
const closeSaveConatiner = document.querySelector(".close-save");
const storeSave = document.querySelector(".store-save");
const savePaletteName = document.querySelector(".save-palette-name");

// for library and get data from localStorage
const library = document.querySelector(".library");
const libraryList = document.querySelector(".library-container");
const closeLibrary = document.querySelector(".close-library");
const reset = document.querySelector(".reset");

//event listeners

reset.addEventListener("click", doResetAllPalettesLocalStorage);

library.addEventListener("click", e => {
  doGetColorsPaletteFromLocalStorage();
  doReturnColorPaletteToUserInterface(e);
});
closeLibrary.addEventListener("click", doCloselibraryContainer);
// علشان نسيف الباليت في اللوكال ستور بتاعة المتصفح
storeSave.addEventListener("click", doCreatePaletteObject);
// علشان لما ندوس علي سيف يفتح القائمه
saveBTN.addEventListener("click", doOpenSaveContainer);

// علشان لما ادوس علي X في قائمة سيف يقفل القايمه
closeSaveConatiner.addEventListener("click", doCloseSaveContainer);

// علشان زرار اللوك
colorLocks.forEach(lock => {
  lock.addEventListener("click", e => {
    lock.classList.toggle("locked");
    const lockBTN = `<i class="fa-solid fa-lock"></i>`;
    const unlockBTN = ` <i class="fa-solid fa-unlock"></i>`;
    if (lock.classList.contains("locked")) {
      lock.innerHTML = lockBTN;
    } else {
      lock.innerHTML = unlockBTN;
    }
    // console.log(e.target);
  });
});

// علشان زرار الري جينيريت يولد الوان جديده من غير ما اعمل ريفرش للصفحه
regenerate.addEventListener("click", palleteColor);

// علشان نعمل البوب اب بتاعة الكوبي
currentH2.forEach(h2 => {
  h2.addEventListener("click", e => {
    copyToClipboard(e, h2);
  });
});

// علشان نفتح منيو التعديل علي الالوان
colorAdjustBTNs.forEach((colorAdjustBTN, index) => {
  colorAdjustBTN.addEventListener("click", function () {
    openColorAdjustMenu(index);
  });
});

// علشان نقفل ونخفي منيو التعديل علي الالوان
closeColorsAdjustPanelBTN.forEach((closeBTN, index) => {
  closeBTN.addEventListener("click", function () {
    closeColorAdjustMenu(index);
  });
});

// functions
palleteColor();
function palleteColor() {
  // foreach علشان افصل الباليته بتاعة كل لون لوحده
  colorsDiv.forEach((div, index) => {
    //random color من كروما
    const color = chroma.random();
    const divH2 = div.querySelector("h2");
    if (doLockedCheck(index) === false) {
      colorLocks[index].innerHTML = ` <i class="fa-solid fa-unlock"></i>`;
      // حطينا اللون خلفيه في الديف بتاعة البالته
      div.style.backgroundColor = color;
      // غيرنا التايتل بتاع الباليته للراندوم كولر اللي جبناه من كروما
      divH2.innerText = color;
    }

    div.addEventListener("input", function (e) {
      updateDivColorsByInput(e, color, div, divH2);
    });

    palleteHslControler(color, divH2, div);
    autmaticUpdateHslValues(color, div, divH2);
  });
}

function palleteHslControler(color, divH2, div) {
  // من خلال معادلة palletcolor احضرنا divh2
  // منخلال divh2 قدرت اجيب الديف الام
  // من خلال الديف الام قدرت اوصل لكل الانبوت واجهزهم لتعديل الالوان عليهم
  const paletConteoler =
    divH2.parentElement.querySelectorAll(`input[type="range"]`);
  const hue = paletConteoler[0];
  const brightness = paletConteoler[1];
  const saturation = paletConteoler[2];

  // علشان نعدل خلفية الانبوت بتاعة الساتيوريشن
  // جبنا اعلي قيمة للساتيورشين
  // اقل قيمة للساتيوريشن
  // عملنا سكيل ليهم مع اللون نفسه علشان نعمل جريدينت بالألوان كلها
  const lowSaturation = color.set("hsl.s", 0);
  const highSaturatin = color.set("hsl.s", 1);
  const scaleSaturation = chroma.scale([lowSaturation, color, highSaturatin]);
  saturation.style.backgroundImage = `linear-gradient(to right, 
    ${scaleSaturation(0)}, ${color}, ${scaleSaturation(1)} )`;

  // علشان نعدل علي الانبوت الخاص بالبرايتنس
  // جبنا الميد برايت وحطيناه في الكروما سيت
  // اخدنا القيمه حطناها عملناها سكيل وحطناها جريدينت في الباك جروند بتاعة البرايتنس
  const midBrightness = color.set("hsl.l", 0.5);
  const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);
  brightness.style.backgroundImage = `linear-gradient(to right,
      black, ${scaleBrightness(0.5)} , white )`;

  // علشان نعمل الباك جروند بتاعة الهيو
  // معادلة جاهزه ومحفوظه متحاولش تحفظها
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

  // علشان نخلي كل الانبوتس مرتبطين مع بعض
  updateAllInput(saturation, brightness, divH2, div);
}

function updateDivColorsByInput(e, color, div, divH2) {
  const palleteParent = e.target.parentElement;
  const palleteInput = palleteParent.querySelectorAll(`input[type="range"]`);
  const hue = palleteInput[0];
  const brightness = palleteInput[1];
  const saturation = palleteInput[2];

  const hexColor = chroma(color).hex();
  const newColor = chroma(hexColor)
    .set("hsl.h", hue.value)
    .set("hsl.l", brightness.value)
    .set("hsl.s", saturation.value);

  divH2.innerText = newColor;
  div.style.backgroundColor = newColor;
}

// علشان تغير الباك جروند الخاصه بكل انبوت مع كل ريفرش للصفحة
function autmaticUpdateHslValues(color, div, divH2) {
  const inputs = div.querySelectorAll(`input[type="range"]`);
  const hue = inputs[0];
  const brightness = inputs[1];
  const saturation = inputs[2];

  const hueValue = chroma(color).hsl()[0];
  hue.value = hueValue;

  const brightnessValue = chroma(color).hsl()[2];
  brightness.value = brightnessValue;

  const saturationValue = chroma(color).hsl()[1];
  saturation.value = saturationValue;

  //   const input = div.querySelectorAll('input[type="range"]');
  //   console.log(input);
}

// علشان نخلي كل الانبوتس مرتبطين ببعض
// لو عدلنا مثلا الهيو هتلاقي الالوان اتغيرت في باك جروند الانبوت بتاعة البرايتنس والسايتوريشن
// لو عدلنا الاضاءة هتلاقي الباقي اتغير معاها وهكذا
function updateAllInput(saturation, brightness, divH2, div) {
  div.addEventListener("input", function (e) {
    const newColor = chroma(divH2.innerText);

    const lowSaturation = newColor.set("hsl.s", 0);
    const highSaturatin = newColor.set("hsl.s", 1);
    const scaleSaturation = chroma.scale([
      lowSaturation,
      newColor,
      highSaturatin,
    ]);
    saturation.style.backgroundImage = `linear-gradient(to right, 
    ${scaleSaturation(0)}, ${newColor}, ${scaleSaturation(1)} )`;

    const midBrightness = newColor.set("hsl.l", 0.5);
    const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);
    brightness.style.backgroundImage = `linear-gradient(to right,
      black, ${scaleBrightness(0.5)} , white )`;
  });
  //const inputs = divH2.pa

  //console.log(mtDiv);
}

function copyToClipboard(e, h2) {
  const copyElement = document.createElement("textarea");
  copyElement.value = h2.innerText;
  document.body.appendChild(copyElement);
  copyElement.select();
  document.execCommand("copy");
  document.body.removeChild(copyElement);

  // copy container && copy popup animation
  copyConatiner.classList.add("copied-to-clipboard-container-active");
  copyConatiner.children[0].classList.add("copied-popup-active");
  copyConatiner.children[0].addEventListener("transitionend", () => {
    copyConatiner.classList.remove("copied-to-clipboard-container-active");
    copyConatiner.children[0].classList.remove("copied-popup-active");
  });
}

function openColorAdjustMenu(index) {
  colorsAdjustPanel[index].classList.add("color-adjust-menu-active");
}

function closeColorAdjustMenu(index) {
  colorsAdjustPanel[index].classList.remove("color-adjust-menu-active");
}

function doLockedCheck(index) {
  return colorLocks[index].classList.contains("locked") ? true : false;
}

function doOpenSaveContainer() {
  saveContainer.classList.toggle("save-container-active");
}

function doCloseSaveContainer() {
  saveContainer.classList.remove("save-container-active");
}

function doCreatePaletteObject() {
  let savedPalettes = JSON.parse(localStorage.getItem("paletteLocalDB"));
  let savedPalettesID;
  if (savedPalettes === null) {
    savedPalettesID = 0;
  } else {
    savedPalettesID = savedPalettes.length;
  }
  let finalColors = [];
  currentH2.forEach(color => {
    finalColors.push(color.innerText);
  });
  const paletteID = savedPalettesID;
  const paletteName = savePaletteName.value;
  const paletteColors = finalColors;
  //console.log(savePaletteName.value);

  const PaletteDB = {
    id: paletteID,
    name: paletteName,
    colors: paletteColors,
  };

  //savedPalettes.push(PaletteDB);
  doStoreSaveInLocalStore(PaletteDB);
  savePaletteName.value = "";
  saveContainer.classList.remove("save-container-active");
  // console.log(PaletteDB);
  //console.log(savedPalettes);
}

function doStoreSaveInLocalStore(PaletteDB) {
  //console.log(PaletteDB);
  let paletteLocalDB;
  const testDB = localStorage.getItem("paletteLocalDB");
  if (testDB === null) {
    paletteLocalDB = [];
  } else {
    paletteLocalDB = JSON.parse(localStorage.getItem("paletteLocalDB"));
  }

  paletteLocalDB.push(PaletteDB);
  localStorage.setItem("paletteLocalDB", JSON.stringify(paletteLocalDB));
  //console.log(paletteLocalDB);
}

function doGetColorsPaletteFromLocalStorage() {
  libraryList.classList.add("library-container-active");
  const libraryPalettesContainer = document.querySelector(".library-palettes");

  // console.log(checkPaletteContainer);
  // checkPaletteContainer.forEach((check) => {
  //   console.log(check);
  // });
  // if (checkPaletteContainer !== null) {
  //checkPaletteContainer.remove();
  // }
  const paleteObject = JSON.parse(localStorage.getItem("paletteLocalDB"));
  paleteObject.forEach(palette => {
    // <div class="library-palettes">
    //       <div class="library-palettes-container">
    //         <p>1.</p>
    //         <h4>palette Name</h4>
    //         <div class="library-palettes-container-color">
    //           <div class="color-1"></div>
    //         </div>
    //         <p class="return-palette">Select</p>
    //       </div>
    //     </div>

    const paletteContainer = document.createElement("div");
    paletteContainer.classList.add("library-palettes-container");
    const paletteContainer_p = document.createElement("p");
    paletteContainer_p.innerText = palette.id + ". ";
    paletteContainer.appendChild(paletteContainer_p);

    const paletteContainer_h4 = document.createElement("h4");
    paletteContainer_h4.innerText = palette.name;
    paletteContainer.appendChild(paletteContainer_h4);

    const libraryPalettesContainerColors = document.createElement("div");
    libraryPalettesContainerColors.classList.add(
      "library-palettes-container-colors"
    );
    const paletteContainer_colors = palette.colors;
    paletteContainer_colors.forEach(color => {
      const colorDiv = document.createElement("div");
      colorDiv.classList.add("library-palettes-container-color");
      colorDiv.style.backgroundColor = color;
      libraryPalettesContainerColors.appendChild(colorDiv);
      //console.log(color);
    });
    //console.log(libraryPalettesContainer);
    paletteContainer.appendChild(libraryPalettesContainerColors);

    const paletteContainer_p_returnPalette = document.createElement("p");
    paletteContainer_p_returnPalette.classList.add("return-palette");
    paletteContainer_p_returnPalette.innerText = "Select";
    paletteContainer.appendChild(paletteContainer_p_returnPalette);

    libraryPalettesContainer.appendChild(paletteContainer);

    // console.log(paletteContainer_colors);
  });
  //console.log(paleteObject[0].name);
}

function doCloselibraryContainer() {
  const checkPaletteContainer = document.querySelectorAll(
    ".library-palettes-container"
  );

  checkPaletteContainer.forEach(check => {
    check.remove();
  });
  libraryList.classList.remove("library-container-active");
}

function doReturnColorPaletteToUserInterface(e) {
  const returnPalettes = document.querySelectorAll(".return-palette");
  returnPalettes.forEach(returnPalette => {
    returnPalette.addEventListener("click", e => {
      const returnPaletteParent = e.target.parentElement;
      const returnPaletteColorsParent = returnPaletteParent.querySelector(
        ".library-palettes-container-colors"
      );
      const returnPaletteColors = returnPaletteColorsParent.querySelectorAll(
        ".library-palettes-container-color"
      );

      returnPaletteColors.forEach((color, index) => {
        const returnedColor = color.style.backgroundColor;
        const colorHex = chroma(returnedColor).hex();

        colorsDiv[index].style.backgroundColor = colorHex;
        currentH2[index].innerText = colorHex;
        //console.log(colorHex);
      });

      //console.log(returnPaletteColors);
    });
  });
}

function doResetAllPalettesLocalStorage() {
  const checkPaletteContainer = document.querySelectorAll(
    ".library-palettes-container"
  );

  checkPaletteContainer.forEach(check => {
    check.remove();
  });
  localStorage.clear();
}
