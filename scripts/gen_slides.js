const PPTXGenJS = require("pptxgenjs");
const fs = require("fs");

const slideData = JSON.parse(fs.readFileSync("timings.json", "utf8"));
const pptx = new PPTXGenJS();

// Set slide size to 1920x1080 pixels (10 x 5.625 inches)
pptx.defineLayout({ name: "WIDESCREEN_HD", width: 10, height: 5.625 });
pptx.layout = "WIDESCREEN_HD";

const bgPath = "assets/bg.jpg";

slideData.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { path: bgPath };
    slide.addText(item.text, {
        x: 0.5, y: 0.5, w: 9, h: 4.5,
        fontSize: 38,
        color: "404040",
        fontFace: "Crimson Pro",
        align: "justify",
        valign: "top",
        wrap: true,
    });
});

pptx.writeFile({ fileName: "slides.pptx" })
    .then(() => console.log("✅ Created slides.pptx"))
    .catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
