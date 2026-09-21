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

async function buildCatalog() {
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
    await new Promise(r => setTimeout(r, 150)); // be polite to archive.org
  }
  return files;
}

function renderPage(files) {
  const template = fs.readFileSync('genericloops.template.html', 'utf8');
  const filesJson = JSON.stringify(files);
  const syncNote = files.length + ' assets — last synced ' + new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC';

  return template
    .replace('/*__FILES_JSON__*/[]', filesJson)
    .replace('<!--__SYNC_NOTE__-->', syncNote);
}

async function main() {
  const files = await buildCatalog();
  console.log('Found ' + files.length + ' audio file(s)');

  fs.writeFileSync('catalog.json', JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2));

  const html = renderPage(files);
  fs.writeFileSync('index.html', html);
  console.log('Wrote index.html');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
