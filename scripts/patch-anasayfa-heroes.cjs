const fs = require("fs");
const p = "components/vf-inline/AnasayfaInteractive.tsx";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const emlakMarker = ") : isEmlak ? (";
const kuaforKadinMarker = ") : isKuaforKadin ? (";

const rs = s.indexOf("{isRestaurant ? (");
const ie = s.indexOf(emlakMarker, rs);
if (rs < 0 || ie < 0) {
  console.error("restaurant/emlak markers", rs, ie);
  process.exit(1);
}

const restaurantComp = `{isRestaurant ? (
          <RestaurantFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        `;

s = s.slice(0, rs) + restaurantComp + s.slice(ie);

const ie2 = s.indexOf(emlakMarker);
const ik = s.indexOf(kuaforKadinMarker, ie2);
if (ie2 < 0 || ik < 0) {
  console.error("second pass markers", ie2, ik);
  process.exit(1);
}

const emlakComp = `${emlakMarker}
          <EmlakFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
            emlakPreview={props.emlakPreview}
          />
        `;

s = s.slice(0, ie2) + emlakComp + s.slice(ik);

const defaultGrid =
  '        ) : (\n        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">';
const idGrid = s.indexOf(defaultGrid);
if (idGrid < 0) {
  console.error("default grid not found");
  process.exit(1);
}

const avukatBranch = `
        ) : isAvukat ? (
          <AvukatFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        `;

s = s.slice(0, idGrid) + avukatBranch + s.slice(idGrid);

fs.writeFileSync(p, s);
console.log("patched ok");
