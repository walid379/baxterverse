// Migration ponctuelle de l'ancien ReadingGuide.vue vers un JSON editable hors du JAR.
// Ne remplace pas ReadingGuide.vue. Ne modifie jamais un JSON deja present.
// Usage depuis la racine du depot : node tools/migrate-reading-guides.cjs [ancien-ReadingGuide.vue]
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const root = path.resolve(__dirname, '..')
const sourcePath = path.resolve(process.argv[2] || path.join(root, 'komga-webui', 'src', 'views', 'ReadingGuide.vue'))
const targetDir = path.join(root, 'deployment', 'config')
const targetJson = path.join(targetDir, 'reading-guides.json')
const devDir = path.join(root, 'komga-webui', 'public')
const devJson = path.join(devDir, 'reading-guides.json')

function fail(message) {
  console.error(`ERREUR : ${message}`)
  process.exit(1)
}

if (!fs.existsSync(sourcePath)) fail(`Ancien fichier Vue introuvable : ${sourcePath}`)
if (fs.existsSync(targetJson)) {
  console.log('Le JSON existe deja : aucune migration ni suppression de tes modifications.')
  if (!fs.existsSync(devJson)) {
    fs.mkdirSync(devDir, {recursive: true})
    fs.copyFileSync(targetJson, devJson)
  }
  process.exit(0)
}

const source = fs.readFileSync(sourcePath, 'utf8')

// L'ancienne expression reguliere cherchait obligatoirement "] as ReadingGuideTimeline[]".
// Ici on trouve le debut du tableau, puis on retrouve le ] correspondant en tenant
// compte des crochets imbriques, des chaines, des templates et des commentaires.
function extractArray(text) {
  const starts = [
    /(?:^|[,{])\s*timelines\s*:\s*\[/gm,
    /^\s*(?:const|let|var)\s+timelines(?:\s*:\s*ReadingGuideTimeline\[\])?\s*=\s*\[/gm,
    /(?:^|[,{])\s*readingGuides\s*:\s*\[/gm,
    /(?:^|[,{])\s*guides\s*:\s*\[/gm,
  ]
  let firstBracket = -1
  for (const pattern of starts) {
    const match = pattern.exec(text)
    if (match) {
      firstBracket = match.index + match[0].lastIndexOf('[')
      break
    }
  }
  if (firstBracket < 0) return null

  let depth = 0
  let quote = null
  let lineComment = false
  let blockComment = false
  for (let i = firstBracket; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (lineComment) {
      if (ch === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i++ }
      continue
    }
    if (quote) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue }
    if (ch === '[') depth++
    if (ch === ']') {
      depth--
      if (depth === 0) return text.slice(firstBracket, i + 1)
    }
  }
  fail('Tableau timelines incomplet : aucun crochet fermant correspondant.')
}

const literal = extractArray(source)
if (!literal) {
  fail(`Aucun tableau statique "timelines: [...]" trouve dans ${sourcePath}. Verifie que tu fournis l'ancienne version de ReadingGuide.vue. Si elle a ete remplacee, relance apply.ps1 avec -LegacyReadingGuide "chemin\\vers\\sauvegarde\\ReadingGuide.vue".`)
}

let guides
try {
  guides = vm.runInNewContext(`(${literal})`, Object.create(null), {timeout: 1000})
} catch (error) {
  fail(`Impossible de lire le tableau des guides : ${error.message}. Envoie ton ReadingGuide.vue pour adapter l'extraction.`)
}
if (!Array.isArray(guides) || guides.length === 0) {
  fail('Le tableau des guides est vide ou invalide. Migration annulee pour eviter toute perte de donnees. Fournis une ancienne version avec tes guides, via -LegacyReadingGuide.')
}
for (let i = 0; i < guides.length; i++) {
  const guide = guides[i]
  if (!guide || !guide.id || !guide.name || !Array.isArray(guide.entries)) {
    fail(`Le guide a l'index ${i} n'a pas le format attendu (id, name, entries). Aucune modification effectuee.`)
  }
  if (guide.entries.some(entry => !entry || !entry.series || entry.number === undefined || entry.number === null)) {
    fail(`Une entree du guide "${guide.name}" est incomplete. Aucune modification effectuee.`)
  }
}
if (new Set(guides.map(g => String(g.id))).size !== guides.length) {
  fail('Plusieurs guides possedent le meme id. Corrige-les avant migration.')
}

fs.mkdirSync(targetDir, {recursive: true})
fs.mkdirSync(devDir, {recursive: true})
const prodImageDir = path.join(targetDir, 'guide-images')
const devImageDir = path.join(devDir, 'guide-images')
fs.mkdirSync(prodImageDir, {recursive: true})
fs.mkdirSync(devImageDir, {recursive: true})

const normalized = guides.map(guide => {
  let image = String(guide.image || '')
  if (image.startsWith('/img/reading-guide/')) {
    const basename = path.basename(image)
    const possibleSources = [
      path.join(devDir, 'img', 'reading-guide', basename),
      path.join(root, 'komga', 'src', 'main', 'resources', 'public', 'img', 'reading-guide', basename),
      path.join(root, 'komga', 'src', 'main', 'resources', 'public', 'reading-guide', basename),
    ]
    const original = possibleSources.find(p => fs.existsSync(p))
    if (original) {
      fs.copyFileSync(original, path.join(prodImageDir, basename))
      fs.copyFileSync(original, path.join(devImageDir, basename))
      image = `/guide-images/${basename}`
    } else {
      console.warn(`Image non trouvee : ${image}. URL d'origine conservee.`)
    }
  }
  return {
    id: String(guide.id),
    name: String(guide.name),
    description: String(guide.description || ''),
    image,
    entries: guide.entries.map(entry => ({series: String(entry.series), number: String(entry.number)})),
  }
})

const output = JSON.stringify({guides: normalized}, null, 2) + '\n'
// wx refuse d'ecraser un fichier cree entre le controle precedent et l'ecriture.
fs.writeFileSync(targetJson, output, {encoding: 'utf8', flag: 'wx'})
fs.writeFileSync(devJson, output, 'utf8')
console.log(`Migration reussie : ${normalized.length} guide(s), ${normalized.reduce((sum, g) => sum + g.entries.length, 0)} entree(s).`)
console.log(`Production : ${targetJson}`)
console.log(`Developpement : ${devJson}`)
