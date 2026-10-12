// Universal HTML entity decoding & mojibake correction
export function decodeHtmlEntities(input?: string): string {
  if (!input) return '';

  let text = input;

  // 1. Decode numeric decimal entities: &#8221; &#8220; &#39; etc.
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    try {
      const code = parseInt(dec, 10);
      return String.fromCharCode(code);
    } catch {
      return _;
    }
  });

  // 2. Decode hex entities: &#x201D; &#x22; etc.
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    } catch {
      return _;
    }
  });

  // 3. Decode named HTML entities
  const entityMap: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&sbquo;': '‚',
    '&bdquo;': '„',
    '&laquo;': '«',
    '&raquo;': '»',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&bull;': '•',
    '&middot;': '·',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&deg;': '°',
    '&plusmn;': '±',
    '&sup2;': '²',
    '&sup3;': '³',
    '&micro;': 'µ',
    '&para;': '¶',
    '&ordm;': 'º',
    '&orda;': 'ª',
    '&frac14;': '¼',
    '&frac12;': '½',
    '&frac34;': '¾',
    '&times;': '×',
    '&divide;': '÷',
    // Accented vowels and consonants in Portuguese
    '&Aacute;': 'Á', '&aacute;': 'á',
    '&Acirc;': 'Â', '&acirc;': 'â',
    '&Agrave;': 'À', '&agrave;': 'à',
    '&Atilde;': 'Ã', '&atilde;': 'ã',
    '&Auml;': 'Ä', '&auml;': 'ä',
    '&Eacute;': 'É', '&eacute;': 'é',
    '&Ecirc;': 'Ê', '&ecirc;': 'ê',
    '&Egrave;': 'È', '&egrave;': 'è',
    '&Euml;': 'Ë', '&euml;': 'ë',
    '&Iacute;': 'Í', '&iacute;': 'í',
    '&Icirc;': 'Î', '&icirc;': 'î',
    '&Igrave;': 'Ì', '&igrave;': 'ì',
    '&Iuml;': 'Ï', '&iuml;': 'ï',
    '&Oacute;': 'Ó', '&oacute;': 'ó',
    '&Ocirc;': 'Ô', '&ocirc;': 'ô',
    '&Ograve;': 'Ò', '&ograve;': 'ò',
    '&Otilde;': 'Õ', '&otilde;': 'õ',
    '&Ouml;': 'Ö', '&ouml;': 'ö',
    '&Uacute;': 'Ú', '&uacute;': 'ú',
    '&Ucirc;': 'Û', '&ucirc;': 'û',
    '&Ugrave;': 'Ù', '&ugrave;': 'ù',
    '&Uuml;': 'Ü', '&uuml;': 'ü',
    '&Ccedil;': 'Ç', '&ccedil;': 'ç',
  };

  text = text.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    return entityMap[match] || match;
  });

  // 4. Fix common double-encoded UTF-8 mojibake
  text = text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã¢/g, 'â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã€/g, 'À')
    .replace(/Ã\s/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ãƒ/g, 'Ã')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/â€˜/g, '‘')
    .replace(/â€™/g, '’')
    .replace(/â€¦/g, '…');

  return text;
}

export function cleanTitle(titleInput?: string): string {
  if (!titleInput) return '';

  let title = decodeHtmlEntities(titleInput).trim();

  // Strip prefixes like "Agora no g1:", "g1:", "VÍDEOS:", "VÍDEO:", "AO VIVO:", "ASSISTA:"
  title = title
    .replace(/^agora\s+no\s+g1:?\s*/gi, '')
    .replace(/agora\s+no\s+g1:?\s*/gi, '')
    .replace(/^g1:?\s*/gi, '')
    .replace(/^v[ií]deos?:?\s*/gi, '')
    .replace(/^assista(\s+ao\s+vivo)?:?\s*/gi, '')
    .replace(/^ao\s+vivo:?\s*/gi, '')
    .replace(/\bao\s+vivo\b:?\s*/gi, '');

  // Strip trailing author or source tags
  title = title
    .replace(/[\-|\u2013\u2014]?\s*(ler|leia)\s+(a\s+)?(mat[eé]ria|reportagem)\s+completa(\s+no\s+g1)?\.?/gi, '')
    .replace(/[\-|\u2013\u2014]\s*g1(\s+par[aá])?\s*$/gi, '')
    .replace(/[\-|\u2013\u2014]\s*o\s+liberal\s*$/gi, '')
    .replace(/[\-|\u2013\u2014]\s*di[aá]rio\s+do\s+par[aá]\s*$/gi, '')
    .replace(/[\-|\u2013\u2014]\s*dol\s*$/gi, '')
    .replace(/\/\s*g1\b/gi, '')
    .replace(/,\s*g1\b/gi, '')
    .replace(/\bg1\s+par[aá]\b/gi, 'Portal News')
    .replace(/\bg1\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title;
}

export function isForbiddenVideoPost(rawTitle: string, rawContent: string): boolean {
  const title = (rawTitle || '').trim();
  const content = (rawContent || '').trim();

  // Allow if it contains an actual YouTube embed / link
  const hasYouTube = /youtube\.com|youtu\.be/i.test(content);
  if (hasYouTube) return false;

  // Check if title or content is purely a video broadcast / clip / telejornal
  const titleIsVideoBroadcast =
    /^(v[ií]deos?|assista|ao\s+vivo|transmiss[aã]o\s+ao\s+vivo|[ií]ntegra|Veja\s+v[ií]deo):/i.test(title) ||
    /v[ií]deos?:?\s*assista/i.test(title) ||
    /v[ií]deos?:?\s*veja/i.test(title) ||
    /assista\s+[aào]\s+([ií]ntegra|telejornal|transmiss[aã]o|v[ií]deo)/i.test(title) ||
    /v[ií]deos\s+do\s+(jl1|jl2|bom\s+dia|jornal|fant[aá]stico|globo\s+esporte|jornal\s+nacional)/i.test(title) ||
    /v[ií]deos\s+mais\s+(vistos|assistidos)/i.test(title) ||
    /v[ií]deos\s+da\s+(rede|tv|emissora)/i.test(title);

  if (titleIsVideoBroadcast) return true;

  // Check if content word count is very low and primarily prompts to watch non-YouTube video
  const cleanText = cleanFullNewsText(content);
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  if (wordCount < 25 && /v[ií]deo|assista|telejornal|[ií]ntegra/i.test(cleanText)) {
    return true;
  }

  return false;
}

export function cleanFullNewsText(input?: string): string {
  if (!input) return '';

  let text = input;

  // 1. Convert HTML structural tags into paragraph breaks or list bullets
  text = text
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '\n');

  // 2. Strip scripts, styles, figures, iframes (except youtube), images, video objects, video players
  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<iframe(?![^>]*youtube\.com)[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<video[\s\S]*?<\/video>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/<img[^>]*>/gi, '');

  // 3. Remove all remaining HTML tags
  text = text.replace(/<[^>]*>?/gm, '');

  // 4. Universal decode entities and mojibake
  text = decodeHtmlEntities(text);

  // 5. Remove Emojis, verification marks/badges, stickers, figurinhas
  text = text
    // Emojis & pictographs
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{200D}\u{FE0F}]/gu, '')
    // Verification marks and check symbols
    .replace(/[✔✓☑✅❌✖➕➖💡📌📢🔴🟢▶⏩▶️➡➡️📲💬👈👉🏼👇🏻👆🏼]/g, '')
    // Text badges
    .replace(/\[\s*(verificado|figurinha|sticker|v[ií]deo|player|media)\s*[^\]]*\]/gi, '')
    .replace(/\(\s*(verificado|figurinha|sticker|v[ií]deo|player|media)\s*[^)]*\)/gi, '');

  // Strip inline promotional sentences first before line splitting
  text = text
    .replace(/(?:acesse|siga|entre no|participe do|clique aqui para entrar no)\s+(?:nosso\s+)?(?:canal|grupo|comunidade)[^\.\n]*?(?:whatsapp|telegram)[^\.\n]*[\.\?!]?/gi, '')
    .replace(/siga\s+o\s+canal\s+[^\.\n]*?(?:no\s+)?whatsapp[\.\?!]?/gi, '')
    .replace(/canal\s+de\s+not[ií]cias\s+[^\.\n]*?no\s+whatsapp[\.\?!]?/gi, '');

  // 6. Filter lines
  const rawLines = text.split(/\r?\n/);
  const filteredLines: string[] = [];

  for (let line of rawLines) {
    let cleanLine = line.trim();
    if (!cleanLine) continue;

    // Pure WhatsApp/Telegram group join prompts (only skip isolated short lines)
    const isWhatsAppOrGroup =
      cleanLine.length < 160 &&
      /whatsapp|telegram|canal|grupo|comunidade/i.test(cleanLine) &&
      /clique|acesse|entre|participe|siga|inscreva|receba|faça parte|baixe/i.test(cleanLine);

    // Pure App download prompts (isolated short lines)
    const isAppDownload =
      cleanLine.length < 160 &&
      /aplicativo|app/i.test(cleanLine) &&
      /baixe|download|instale|clique aqui/i.test(cleanLine);

    // Pure click-here calls
    const isClickHere =
      cleanLine.length < 80 &&
      /clique\s+aqui\s+(para|e|no|na)/i.test(cleanLine);

    // "Veja mais" section headers
    const isVejaMaisSection =
      cleanLine.length < 80 &&
      /^(veja\s+tamb[eé]m|veja\s+mais|leia\s+tamb[eé]m|saiba\s+mais|confira\s+tamb[eé]m|veja\s+abaixo|leia\s+mais):?$/i.test(cleanLine);

    // Pure podcast or video broadcast promo lines
    const isVideoPromoLine =
      cleanLine.length < 140 &&
      (/^v[ií]deos?:?\s*assista\s+aos\s+v[ií]deos/i.test(cleanLine) ||
      /^assista\s+aos?\s+v[ií]deos?\s+da\s+rede/i.test(cleanLine) ||
      /^ou[cç]a\s+os\s+podcasts/i.test(cleanLine) ||
      /^siga\s+o\s+g1/i.test(cleanLine));

    if (isWhatsAppOrGroup || isAppDownload || isClickHere || isVejaMaisSection || isVideoPromoLine) {
      continue;
    }

    // Strip inline phrases & G1 references embedded inside normal sentences
    cleanLine = cleanLine
      .replace(/agora\s+no\s+g1:?\s*/gi, '')
      .replace(/(ler|leia|confira|veja)\s+(a\s+)?(mat[eé]ria|reportagem|not[ií]cia)?\s*(completa)?\s*(no|na)?\s*g1\.?/gi, '')
      .replace(/est[aá]\s+(reportagem|mat[eé]ria|not[ií]cia)?\s*em\s+atualiza[cç][aã]o\.?/gi, '')
      .replace(/por\s+[a-zà-ú]{2,20}\s+[a-zà-ú]{2,20}(,|\/)\s*(g1|o\s+liberal|dol|di[aá]rio\s+do\s+par[aá]|rede\s+clube|tv\s+globo)?/gi, '')
      .replace(/\/\s*g1\b/gi, '')
      .replace(/,\s*g1\b/gi, '')
      // Remove "ao vivo" occurrences
      .replace(/\bao\s+vivo\b/gi, '')
      // Video callouts in body
      .replace(/\(veja\s+v[ií]deo\s+acima\)/gi, '')
      .replace(/\(veja\s+o?\s*v[ií]deo\)/gi, '')
      .replace(/\(assista\s+ao\s+v[ií]deo\)/gi, '')
      .replace(/assista\s+no\s+v[ií]deo\s+acima/gi, '')
      .replace(/veja\s+no\s+v[ií]deo\s+acima/gi, '')
      .replace(/confira\s+no\s+v[ií]deo\s+acima/gi, '')
      .replace(/assista\s+ao\s+v[ií]deo\s+acima/gi, '')
      // Source brand cleanups
      .replace(/clique\s+aqui\s+para\s+entrar\s+no\s+grupo\s+do\s+whatsapp\.?/gi, '')
      .replace(/clique\s+aqui\s+para\s+saber\s+mais\.?/gi, '')
      .replace(/clique\s+aqui\.?/gi, '')
      .replace(/o\s+g1\s+tentou\s+contato/gi, 'a reportagem tentou contato')
      .replace(/o\s+g1\s+entrou\s+em\s+contato/gi, 'a reportagem entrou em contato')
      .replace(/o\s+g1\s+procurou/gi, 'a reportagem procurou')
      .replace(/segundo\s+o\s+g1/gi, 'segundo a reportagem')
      .replace(/ao\s+g1/gi, 'à reportagem')
      .replace(/pelo\s+g1/gi, 'pela reportagem')
      .replace(/do\s+g1/gi, 'da reportagem')
      .replace(/no\s+g1(\s+par[aá])?/gi, 'na reportagem')
      .replace(/\bg1\s+par[aá]\b/gi, 'Portal News')
      .replace(/\bg1\b/gi, '')
      .replace(/\bo\s+liberal\b/gi, 'Portal News')
      .replace(/\bdi[aá]rio\s+do\s+par[aá]\b/gi, 'Portal News')
      .replace(/\bcoluna\s+do\s+ct\b/gi, '')
      .replace(/\bcleber\s+toledo\b/gi, '')
      .replace(/\besporte\s+news\s+mundo\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanLine.length > 0) {
      filteredLines.push(cleanLine);
    }
  }

  let finalContent = filteredLines.join('\n\n').trim();

  // Normalize multiple spaces
  finalContent = finalContent.replace(/[ \t]+/g, ' ');

  // Safeguard: if filtering removed too much, fallback to raw stripped content
  if (finalContent.length < 40) {
    const rawFallback = decodeHtmlEntities(input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    if (rawFallback.length > finalContent.length) {
      return rawFallback;
    }
  }

  return finalContent;
}
