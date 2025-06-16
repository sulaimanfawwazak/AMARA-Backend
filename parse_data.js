// ------------------------------------------
// Functions to parse the data in the HEADER
// ------------------------------------------  
function parseJenisUjian(texts) {
  const patternJenisUjian = /KARTU UJIAN (TENGAH|AKHIR) SEMESTER/;

  try {
    const match = texts.match(patternJenisUjian);
    const jenisUjian = match[1] === "TENGAH" ? "UTS" : "UAS";
    return jenisUjian;
  }
  catch (error) {
    console.log(`Error on parsing jenisUjian: ${error}`);
    return null;
  }
}

function parseNamaLengkap(texts) {
  const patternNamaLengkap = /\d{4}\/\d{4}\s*Nama\s*:\s*(.*?)\s*NIM\s*:/; // dddd/dddd Nama: <nama>

  try {
    const match = texts.match(patternNamaLengkap);
    return match[1];
  }
  catch (error) {
    console.log(`Error on parsing namaLengkap: ${error}`);
    return null;
  }
}

function parseNim(texts) {
  const patternNim = /NIM\s*:\s*(.{18})/; // NIM: ss/ssssss/ss/sssss
  
  try {
    match = texts.match(patternNim);
    return match[1];
  }
  catch (error) {
    console.log(`Error on parsing nim: ${error}`);
    return null;
  }
}

function parseProdi(texts) {
  const patternProdi = /Prodi\s*:\s*(.*?)\s*No\s*/; // Prodi: <prodi>
  
  try {
    const match = texts.match(patternProdi);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing prodi: ${error}`);
    return null;
  }
}

// ------------------------------------------
// Functions to parse the data in the TABLE
// ------------------------------------------  

function parseRows(texts) {
  // const patternRows = /(\d{1,2}[A-Z]{2,4}\d{4,7}.*?(?=\d{1,2}[A-Z]{2,4}\d{4,7}|\s*$))/g;
  const patternRows = /(\d{1,2}\s*[A-Z]{2,4}\s*\d{4,7}\s*.*?(?=\d{1,2}\s*[A-Z]{2,4}\s*\d{4,7}\s*|\s*$))/g;

  const rows = texts.match(patternRows);
  return rows;
}

function parseMataKuliah(texts) {
  // const patternMataKuliah = /\d{1,2}\s*[A-Z]{1,5}\s*\d{4,7}\s*[A-Z]?\s*\d{0,3}\s*(.*?)\s*Kelas\s*:/;
  const patternMataKuliah = /\d{1,2}\s*[A-Z]{1,5}\s*\d{3,7}\s{0,1}\s*\d{0,7}\s*(.*?)\s*Kelas\s*:/;

  try {
    const match = texts.match(patternMataKuliah);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing mataKuliah: ${error}`);
    return null;
  }
}

function parseTanggal(texts) {
  const patternTanggal = /Kelas:\s*[A-Z]{1,3}\s*\d{1,3}\s*(\d{2}-\d{2}-\d{4})\s*\d{2}:\d{2}-\d{2}:\d{2}/;

  try {
    const match = texts.match(patternTanggal);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing tanggal: ${error}`);
    return null;
  }
}

function parseJam(texts) {
  const patternJam = /\d{2}-\d{2}-\d{4}\s*(\d{2}:\d{2}-\d{2}:\d{2})/;

  try {
    const match = texts.match(patternJam);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing jam: ${error}`);
    return null;
  }
}

function parseRuangan(texts) {
  // const patternRuangan = /\d{2}:\d{2}-\d{2}:\d{2}\s+(.*?)\s(?=\d+(?=\s|$))/;
  const patternRuangan = /\d{2}:\d{2}-\d{2}:\d{2}\s*(.*?)(?=\d{1,2}(?=\s|$))/;

  try {
    const match = texts.match(patternRuangan);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing ruangan: ${error}`);
    return null;
  }
}

function parseNoKursi(texts) {
  // const patternNoKursi = /\d{2}:\d{2}-\d{2}:\d{2}\s+.*?\s(?=\d+(?=\s|$))\s*(\d{1,2})/;
  const patternNoKursi = /\d{2}:\d{2}-\d{2}:\d{2}\s*.*?(?=\d{1,2}(?=\s|$))(\d{1,2})\s*/;

  try {
    const match = texts.match(patternNoKursi);
    return match[1];
  } catch (error) {
    console.log(`Error on parsing no_kursi: ${error}`);
    return null;
  }
}

// ------------------------------------------
// Other Functions
// ------------------------------------------

function makeDict(mataKuliahArr, tanggalArr, jamArr, ruanganArr, noKursiArr, jenisUjian) {
  let processedMataKuliahArr;

  if (jenisUjian === "UTS") {
    processedMataKuliahArr = mataKuliahArr.map(mataKuliah => `[UTS] ${mataKuliah}`);
  }
  else if (jenisUjian === "UAS") {
    processedMataKuliahArr = mataKuliahArr.map(mataKuliah => `[UAS] ${mataKuliah}`);
  }
  else {
    console.log(`Error: jenisUjian has wrong value`);
    processedMataKuliahArr = mataKuliahArr;
  }

  const eventsArr = [];

  for (let i = 0; i < processedMataKuliahArr.length; i++) {
    if (tanggalArr[i] == null | tanggalArr[i] == undefined) {
      continue;
    }
    else {
      const examDict = {
        no: i,
        mata_kuliah: processedMataKuliahArr[i],
        tanggal: tanggalArr[i],
        jam: jamArr[i],
        ruangan: ruanganArr[i],
        no_kursi: noKursiArr[i]
      };
      eventsArr.push(examDict);
    }
  }

  return eventsArr;
}

module.exports = {
  parseJenisUjian,
  parseNamaLengkap,
  parseNim,
  parseProdi,
  parseRows,
  parseMataKuliah,
  parseTanggal,
  parseJam,
  parseRuangan,
  parseNoKursi,
  makeDict
};