const fs = require('fs');

const UPLOADER_EMAIL = 'bramkoenings1@gmail.com';

function isAudioFile(name) {
  return /\.(wav|mp3|flac|aiff?|ogg|m4a)$/i.test(name);
}

function guessFormatLabel(name) {
  const ext = name.split('.').pop().toUpperCase();
  return 'Audio/' + ext;
}

async function fetchUploaderItems(email) {
  const q = `uploader:"${email}"`;
  const url =
    'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) +
    '&fl[]=identifier&fl[]=title&fl[]=addeddate' +
    '&sort[]=addeddate+desc&rows=1000&page=1&output=json';
  const res = await fetch(url);
  if (!res.ok) throw new Error('search failed: ' + res.status);
  const data = await res.json();
  return (data.response && data.response.docs) || [];
}

async function fetchItemAudioFiles(identifier) {
  const res = await fetch('https://archive.org/metadata/' + encodeURIComponent(identifier));
  if (!res.ok) throw new Error('metadata failed: ' + res.status);
  const data = await res.json();
  return (data.files || []).filter(f => f.source === 'original' && isAudioFile(f.name));
}

async function main() {
  const items = await fetchUploaderItems(UPLOADER_EMAIL);
  const files = [];

  for (const item of items) {
    try {
      const audioFiles = await fetchItemAudioFiles(item.identifier);
      for (const f of audioFiles) {
        files.push({
          name: f.name,
          url: 'https://archive.org/download/' + encodeURIComponent(item.identifier) + '/' + encodeURIComponent(f.name),
          format: guessFormatLabel(f.name),
          sizeBytes: parseInt(f.size || '0', 10) || 0,
          addeddate: item.addeddate || ''
        });
      }
    } catch (e) {
      console.error('Skipping ' + item.identifier + ': ' + e.message);
    }
    // be polite to archive.org's servers
    await new Promise(r => setTimeout(r, 150));
  }

  const out = { generatedAt: new Date().toISOString(), files };
  fs.writeFileSync('catalog.json', JSON.stringify(out, null, 2));
  console.log('Wrote catalog.json with ' + files.length + ' file(s)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
