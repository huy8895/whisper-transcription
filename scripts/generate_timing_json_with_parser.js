// generate_timing_json_with_parser.js
const fs = require('fs-extra');
const nlp = require('compromise');
const minimist = require('minimist');

// ===== Subtitle Parser (From subtitle-parser.js) =====
function timeToMs(timeString) {
    const [hours, minutes, rest] = timeString.split(':');
    const [seconds, millis] = rest.split(',');
    return (
        parseInt(hours) * 3600000 +
        parseInt(minutes) * 60000 +
        parseInt(seconds) * 1000 +
        parseInt(millis)
    );
}

function parseSRT(data) {
    const srt = data.replace(/\r/g, '');
    const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n{2}|$)/g;
    const result = [];

    let match;
    while ((match = regex.exec(srt)) !== null) {
        const id = parseInt(match[1]);
        const start = timeToMs(match[2]);
        const end = timeToMs(match[3]);
        const text = match[4].replace(/\n/g, ' ').trim();

        result.push({ id, start, end, text });
    }

    return result;
}

// ===== Helper Functions =====
function normalizeText(text) {
    text = text.toLowerCase();
    let words = text.split(/\s+|-|—/);
    const numberWords = {'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','ten':'10'};
    return words.map(w => w.replace(/[^\w\s]/g,'').trim())
                .filter(w => /^[a-zA-Z]+$/.test(w) || /^\d+$/.test(w))
                .map(w => numberWords[w] || w).join(' ').trim();
}

function levenshteinDistance(str1, str2) {
    const len1 = str1.length, len2 = str2.length, matrix = [];
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    for (let i = 1; i <= len1; i++)
        for (let j = 1; j <= len2; j++)
            matrix[i][j] = Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+(str1[i-1]!==str2[j-1]?1:0));
    return matrix[len1][len2];
}

function fuzzyMatchAverage(arr1, arr2) {
    let totalSimilarity = 0;
    for (let a of arr1) {
        let bestSimilarity = 0;
        for (let b of arr2) {
            const distance = levenshteinDistance(a,b);
            const similarity = 1 - distance / Math.max(a.length,b.length);
            if (similarity > bestSimilarity) bestSimilarity = similarity;
        }
        totalSimilarity += bestSimilarity;
    }
    return (totalSimilarity / arr1.length * 100).toFixed(2);
}

function processRawContent(content,maxCharLimit,minCharLimit=0) {
    console.log("🔍 Processing raw content...");
    const sentences=nlp(content).sentences().out("array");
    const slides=[]; let currentSlide="";
    sentences.forEach(sentence=>{
        if(currentSlide.length===0){
            if(sentence.length>maxCharLimit){slides.push(sentence.trim())}
            else{currentSlide=sentence+" ";}
            return;
        }
        if((currentSlide+sentence).length>maxCharLimit){
            slides.push(currentSlide.trim());
            currentSlide=sentence+" ";
        } else {
            currentSlide+=sentence+" ";
        }
    });
    if(currentSlide.trim()) slides.push(currentSlide.trim());
    console.log(`✅ Total slides generated: ${slides.length}`);
    return slides;
}

function generateTimings(srtData,slides,matchThreshold=90,maxOffset=3) {
    const timings=[],availableSrtData=[...srtData];let lastSlideEndTime=0;
    slides.forEach((slide,indexSlide)=>{
        const slideSplit=normalizeText(slide).split(' ');
        const arraySrtSplit=availableSrtData.slice(0,slideSplit.length).map(s=>normalizeText(s.text));
        const equalWithPercentage=fuzzyMatchAverage(arraySrtSplit,slideSplit);
        console.log(`\n[Slide #${indexSlide + 1}]`);
        console.log(`Text: ${slide}`);
        console.log(`Match: ${equalWithPercentage}%`);
        if(parseInt(equalWithPercentage)<matchThreshold){
            console.error("❌ Không đủ độ khớp!");
            throw Error('Slide không khớp đủ mức cho phép: '+equalWithPercentage+'%');
        }
        const startIndex=0,endIndex=slideSplit.length-1;
        let startTime=indexSlide===0?0:lastSlideEndTime;
        let endTime=endIndex===availableSrtData.length-1?availableSrtData[endIndex].end:(availableSrtData[endIndex+1].start+availableSrtData[endIndex].end)/2;
        lastSlideEndTime=endTime;
        timings.push({slide,start:startTime,end:endTime,duration:endTime-startTime});
        availableSrtData.splice(startIndex,endIndex-startIndex+1);
    });
    console.log("✅ Timing generation complete.");
    return timings;
}

// ===== Main Entry Point =====
async function main() {
    const args = minimist(process.argv.slice(2));
    const srtPath = args.srt, contentPath = args.content;
    const maxChar = parseInt(args.maxChar || 200), minChar = parseInt(args.minChar || 100);
    const matchThreshold = parseInt(args.matchThreshold || 90);

    console.log("📁 Reading files...");
    const srtContent = fs.readFileSync(srtPath, 'utf-8');
    const rawContent = fs.readFileSync(contentPath, 'utf-8');

    const srtData = parseSRT(srtContent);
    console.log(`📜 Loaded ${srtData.length} subtitle entries.`);

    const slides = processRawContent(rawContent, maxChar, minChar);
    const timings = generateTimings(srtData, slides, matchThreshold);

    const jsonData = timings.map(t => ({text: t.slide, timing: parseFloat((t.duration / 1000).toFixed(2))}));
    fs.writeJsonSync('slides-timing.json', jsonData, { spaces: 2 });
    console.log("💾 File 'slides-timing.json' created successfully!");
}

main().catch(err => {console.error("🔥 Error:", err); process.exit(1);});
