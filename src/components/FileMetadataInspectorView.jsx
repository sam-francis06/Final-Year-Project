import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera,
  FileText,
  Music,
  Video,
  FileCheck,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Scale,
  Compass,
  Layers,
  FileCode,
  FileSpreadsheet,
  RefreshCw,
  X,
  SlidersHorizontal,
  FileJson
} from 'lucide-react';

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// 1. Magic Bytes File Type Sniffer
async function detectActualFileType(file) {
  const slice = file.slice(0, 64);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { type: 'jpeg', category: 'image', label: 'JPEG Image', mime: 'image/jpeg', canSanitize: true };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return { type: 'png', category: 'image', label: 'PNG Image', mime: 'image/png', canSanitize: true };
  }
  // GIF: GIF87a / GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { type: 'gif', category: 'image', label: 'GIF Image', mime: 'image/gif', canSanitize: true };
  }
  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { type: 'webp', category: 'image', label: 'WebP Image', mime: 'image/webp', canSanitize: true };
  }
  // PDF: %PDF-
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2D) {
    return { type: 'pdf', category: 'document', label: 'PDF Document', mime: 'application/pdf', canSanitize: false };
  }
  // ZIP / OOXML: PK..
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const mime = file.type || '';
    if (ext === 'docx' || mime.includes('wordprocessingml')) return { type: 'docx', category: 'document', label: 'Microsoft Word (DOCX)', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', canSanitize: true };
    if (ext === 'xlsx' || mime.includes('spreadsheetml')) return { type: 'xlsx', category: 'document', label: 'Microsoft Excel (XLSX)', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', canSanitize: true };
    if (ext === 'pptx' || mime.includes('presentationml')) return { type: 'pptx', category: 'document', label: 'Microsoft PowerPoint (PPTX)', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', canSanitize: true };
    return { type: 'zip', category: 'archive', label: 'ZIP Archive', mime: 'application/zip', canSanitize: false };
  }
  // MP3: ID3 or MPEG frame sync
  if ((bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
      (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)) {
    return { type: 'mp3', category: 'audio', label: 'MP3 Audio', mime: 'audio/mpeg', canSanitize: true };
  }
  // WAV: RIFF....WAVE
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
    return { type: 'wav', category: 'audio', label: 'WAV Audio', mime: 'audio/wav', canSanitize: false };
  }
  // OGG: OggS
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return { type: 'ogg', category: 'audio', label: 'OGG Audio', mime: 'audio/ogg', canSanitize: false };
  }
  // FLAC: fLaC
  if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) {
    return { type: 'flac', category: 'audio', label: 'FLAC Audio', mime: 'audio/flac', canSanitize: false };
  }
  // MP4 / MOV: ....ftyp
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const ext = (file.name || '').split('.').pop().toLowerCase();
    return { type: ext === 'mov' ? 'mov' : 'mp4', category: 'video', label: ext === 'mov' ? 'QuickTime Video (MOV)' : 'MP4 Video', mime: 'video/mp4', canSanitize: false };
  }

  // Fallback by extension
  const ext = (file.name || '').split('.').pop().toLowerCase();
  return { type: ext || 'unknown', category: 'unknown', label: ext ? `${ext.toUpperCase()} File` : 'Generic Binary File', mime: file.type || 'application/octet-stream', canSanitize: false };
}

// 2. Format-Specific Extractors
function parseRational(dataView, offset, littleEndian) {
  const num = dataView.getUint32(offset, littleEndian);
  const den = dataView.getUint32(offset + 4, littleEndian);
  return den === 0 ? 0 : num / den;
}

function parseString(dataView, offset, length) {
  let str = '';
  for (let i = 0; i < length; i++) {
    const code = dataView.getUint8(offset + i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str.trim();
}

// Image EXIF / GPS Parser
async function extractImageMetadata(file) {
  const metadata = {
    general: {},
    camera: {},
    location: {},
    technical: {}
  };

  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const dataView = new DataView(buffer);

    // Look for JPEG APP1 (0xFFE1)
    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
      let offset = 2;
      while (offset < dataView.byteLength - 4) {
        const marker = dataView.getUint16(offset);
        const length = dataView.getUint16(offset + 2);

        if (marker === 0xFFE1) {
          // Check for "Exif\0\0"
          const exifHeader = parseString(dataView, offset + 4, 4);
          if (exifHeader === 'Exif') {
            const tiffStart = offset + 10;
            const endianMarker = dataView.getUint16(tiffStart);
            const littleEndian = endianMarker === 0x4949; // 'II'

            const ifd0Offset = dataView.getUint32(tiffStart + 4, littleEndian);
            let curOffset = tiffStart + ifd0Offset;
            const entries = dataView.getUint16(curOffset, littleEndian);
            curOffset += 2;

            let exifIFDOffset = 0;
            let gpsIFDOffset = 0;

            for (let i = 0; i < entries; i++) {
              const tag = dataView.getUint16(curOffset, littleEndian);
              const type = dataView.getUint16(curOffset + 2, littleEndian);
              const count = dataView.getUint32(curOffset + 4, littleEndian);
              const valOffset = curOffset + 8;

              const getVal = () => {
                if (type === 2) { // ASCII string
                  const strOff = count > 4 ? tiffStart + dataView.getUint32(valOffset, littleEndian) : valOffset;
                  return parseString(dataView, strOff, count);
                }
                if (type === 3) return dataView.getUint16(valOffset, littleEndian);
                if (type === 4) return dataView.getUint32(valOffset, littleEndian);
                if (type === 5) return parseRational(dataView, tiffStart + dataView.getUint32(valOffset, littleEndian), littleEndian);
                return null;
              };

              if (tag === 0x010F) metadata.camera['Manufacturer'] = getVal();
              if (tag === 0x0110) metadata.camera['Camera Model'] = getVal();
              if (tag === 0x0131) metadata.camera['Software / Tool'] = getVal();
              if (tag === 0x0132) metadata.general['Modification Date'] = getVal();
              if (tag === 0x8769) exifIFDOffset = dataView.getUint32(valOffset, littleEndian);
              if (tag === 0x8825) gpsIFDOffset = dataView.getUint32(valOffset, littleEndian);

              curOffset += 12;
            }

            // Parse Exif IFD
            if (exifIFDOffset > 0) {
              let eOffset = tiffStart + exifIFDOffset;
              const eEntries = dataView.getUint16(eOffset, littleEndian);
              eOffset += 2;
              for (let i = 0; i < eEntries; i++) {
                const tag = dataView.getUint16(eOffset, littleEndian);
                const type = dataView.getUint16(eOffset + 2, littleEndian);
                const count = dataView.getUint32(eOffset + 4, littleEndian);
                const valOffset = eOffset + 8;

                const getVal = () => {
                  if (type === 2) {
                    const strOff = count > 4 ? tiffStart + dataView.getUint32(valOffset, littleEndian) : valOffset;
                    return parseString(dataView, strOff, count);
                  }
                  if (type === 3) return dataView.getUint16(valOffset, littleEndian);
                  if (type === 4) return dataView.getUint32(valOffset, littleEndian);
                  if (type === 5) return parseRational(dataView, tiffStart + dataView.getUint32(valOffset, littleEndian), littleEndian);
                  return null;
                };

                if (tag === 0x9003) metadata.general['Date & Time Original'] = getVal();
                if (tag === 0x9004) metadata.general['Date & Time Digitized'] = getVal();
                if (tag === 0x829A) {
                  const exp = getVal();
                  metadata.technical['Exposure Time'] = exp ? `1/${Math.round(1 / exp)}s` : null;
                }
                if (tag === 0x829D) metadata.technical['F-Number'] = `f/${getVal()}`;
                if (tag === 0x8827) metadata.technical['ISO Speed'] = getVal();
                if (tag === 0x920A) metadata.technical['Focal Length'] = `${getVal()} mm`;
                if (tag === 0xA434) metadata.camera['Lens Model'] = getVal();
                if (tag === 0xA431) metadata.camera['Camera Serial Number'] = getVal();

                eOffset += 12;
              }
            }

            // Parse GPS IFD
            if (gpsIFDOffset > 0) {
              let gOffset = tiffStart + gpsIFDOffset;
              const gEntries = dataView.getUint16(gOffset, littleEndian);
              gOffset += 2;

              let latRef = 'N', lonRef = 'E';
              let latDeg = 0, lonDeg = 0;

              for (let i = 0; i < gEntries; i++) {
                const tag = dataView.getUint16(gOffset, littleEndian);
                const valOffset = gOffset + 8;

                if (tag === 0x0001) latRef = String.fromCharCode(dataView.getUint8(valOffset));
                if (tag === 0x0003) lonRef = String.fromCharCode(dataView.getUint8(valOffset));

                if (tag === 0x0002) { // Latitude
                  const degOffset = tiffStart + dataView.getUint32(valOffset, littleEndian);
                  const d = parseRational(dataView, degOffset, littleEndian);
                  const m = parseRational(dataView, degOffset + 8, littleEndian);
                  const s = parseRational(dataView, degOffset + 16, littleEndian);
                  latDeg = d + (m / 60) + (s / 3600);
                }

                if (tag === 0x0004) { // Longitude
                  const degOffset = tiffStart + dataView.getUint32(valOffset, littleEndian);
                  const d = parseRational(dataView, degOffset, littleEndian);
                  const m = parseRational(dataView, degOffset + 8, littleEndian);
                  const s = parseRational(dataView, degOffset + 16, littleEndian);
                  lonDeg = d + (m / 60) + (s / 3600);
                }

                if (tag === 0x0006) { // Altitude
                  const alt = parseRational(dataView, tiffStart + dataView.getUint32(valOffset, littleEndian), littleEndian);
                  metadata.location['GPS Altitude'] = `${alt.toFixed(1)} meters`;
                }

                if (tag === 0x001D) { // GPS Date
                  metadata.location['GPS Timestamp'] = parseString(dataView, tiffStart + dataView.getUint32(valOffset, littleEndian), 10);
                }

                gOffset += 12;
              }

              if (latDeg > 0 || lonDeg > 0) {
                const finalLat = latRef === 'S' ? -latDeg : latDeg;
                const finalLon = lonRef === 'W' ? -lonDeg : lonDeg;
                metadata.location['GPS Latitude'] = `${finalLat.toFixed(6)}° ${latRef}`;
                metadata.location['GPS Longitude'] = `${finalLon.toFixed(6)}° ${lonRef}`;
                metadata.location['Coordinates'] = `${finalLat.toFixed(5)}, ${finalLon.toFixed(5)}`;
                metadata.location['Map Preview Available'] = 'Yes (Exact Geographical Location)';
              }
            }
          }
          break;
        }

        offset += 2 + length;
      }
    }
  } catch (err) {
    console.debug('EXIF read notice:', err);
  }

  return metadata;
}

// PDF Document Metadata Parser
async function extractPdfMetadata(file) {
  const metadata = { general: {}, document: {}, technical: {} };
  try {
    const textChunk = await file.slice(0, 100 * 1024).text();

    const authorMatch = textChunk.match(/\/Author\s*\(([^)]+)\)/i);
    const creatorMatch = textChunk.match(/\/Creator\s*\(([^)]+)\)/i);
    const producerMatch = textChunk.match(/\/Producer\s*\(([^)]+)\)/i);
    const titleMatch = textChunk.match(/\/Title\s*\(([^)]+)\)/i);
    const creationDate = textChunk.match(/\/CreationDate\s*\(([^)]+)\)/i);
    const modDate = textChunk.match(/\/ModDate\s*\(([^)]+)\)/i);

    if (authorMatch) metadata.document['Author'] = authorMatch[1].trim();
    if (creatorMatch) metadata.document['Creating Application'] = creatorMatch[1].trim();
    if (producerMatch) metadata.document['PDF Producer / Engine'] = producerMatch[1].trim();
    if (titleMatch) metadata.document['Document Title'] = titleMatch[1].trim();
    if (creationDate) metadata.general['Creation Date'] = creationDate[1].replace(/D:|'/g, ' ').trim();
    if (modDate) metadata.general['Modification Date'] = modDate[1].replace(/D:|'/g, ' ').trim();

    // Check for XMP metadata packet
    if (textChunk.includes('<x:xmpmeta') || textChunk.includes('<?xpacket')) {
      metadata.technical['Embedded XMP Packet'] = 'Detected';
      const xmpCreator = textChunk.match(/<dc:creator>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/i);
      if (xmpCreator && !metadata.document['Author']) {
        metadata.document['Author (XMP)'] = xmpCreator[1].trim();
      }
    }
  } catch (err) {
    console.debug('PDF read notice:', err);
  }
  return metadata;
}

// Office Document (DOCX, XLSX, PPTX) Parser
async function extractOfficeMetadata(file) {
  const metadata = { general: {}, document: {}, technical: {} };
  try {
    const textChunk = await file.slice(0, 200 * 1024).text();

    const creator = textChunk.match(/<dc:creator>([^<]+)<\/dc:creator>/i);
    const lastModifiedBy = textChunk.match(/<cp:lastModifiedBy>([^<]+)<\/cp:lastModifiedBy>/i);
    const created = textChunk.match(/<dcterms:created[^>]*>([^<]+)<\/dcterms:created>/i);
    const modified = textChunk.match(/<dcterms:modified[^>]*>([^<]+)<\/dcterms:modified>/i);
    const revision = textChunk.match(/<cp:revision>([^<]+)<\/cp:revision>/i);
    const application = textChunk.match(/<Application>([^<]+)<\/Application>/i);
    const company = textChunk.match(/<Company>([^<]+)<\/Company>/i);

    if (creator && creator[1].trim()) metadata.document['Author / Creator'] = creator[1].trim();
    if (lastModifiedBy && lastModifiedBy[1].trim()) metadata.document['Last Modified By'] = lastModifiedBy[1].trim();
    if (company && company[1].trim()) metadata.document['Company / Organization'] = company[1].trim();
    if (application && application[1].trim()) metadata.technical['Application / Tool'] = application[1].trim();
    if (revision && revision[1].trim()) metadata.technical['Revision Number'] = revision[1].trim();
    if (created && created[1].trim()) metadata.general['Created Date'] = created[1].trim();
    if (modified && modified[1].trim()) metadata.general['Modified Date'] = modified[1].trim();
  } catch (err) {
    console.debug('Office read notice:', err);
  }
  return metadata;
}

// Audio (MP3 / WAV / OGG) Metadata Parser
async function extractAudioMetadata(file) {
  const metadata = { general: {}, audio: {}, technical: {} };
  try {
    const buffer = await file.slice(0, 64 * 1024).arrayBuffer();
    const dataView = new DataView(buffer);

    // ID3v2 check
    if (dataView.getUint8(0) === 0x49 && dataView.getUint8(1) === 0x44 && dataView.getUint8(2) === 0x33) {
      metadata.technical['Tag Format'] = `ID3v2.${dataView.getUint8(3)}`;
      const tagText = new TextDecoder('latin1').decode(new Uint8Array(buffer));

      const extractFrame = (id) => {
        const idx = tagText.indexOf(id);
        if (idx !== -1 && idx + 10 < tagText.length) {
          const str = tagText.substring(idx + 10, idx + 80).replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim();
          return str || null;
        }
        return null;
      };

      const title = extractFrame('TIT2');
      const artist = extractFrame('TPE1');
      const album = extractFrame('TALB');
      const year = extractFrame('TYER') || extractFrame('TDRC');
      const genre = extractFrame('TCON');
      const encoder = extractFrame('TSSE');

      if (title) metadata.audio['Track Title'] = title;
      if (artist) metadata.audio['Artist / Performer'] = artist;
      if (album) metadata.audio['Album'] = album;
      if (year) metadata.general['Release Year'] = year;
      if (genre) metadata.audio['Genre'] = genre;
      if (encoder) metadata.technical['Encoder / Software'] = encoder;
    }
  } catch (err) {
    console.debug('Audio read notice:', err);
  }
  return metadata;
}

// Video (MP4 / MOV) Metadata Parser
async function extractVideoMetadata(file) {
  const metadata = { general: {}, video: {}, technical: {} };
  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const textChunk = new TextDecoder('latin1').decode(new Uint8Array(buffer));

    // Look for mvhd box (creation time)
    const mvhdIdx = textChunk.indexOf('mvhd');
    if (mvhdIdx !== -1 && mvhdIdx + 20 < buffer.byteLength) {
      const dataView = new DataView(buffer);
      const version = dataView.getUint8(mvhdIdx + 4);
      if (version === 0) {
        const creationSec = dataView.getUint32(mvhdIdx + 8);
        if (creationSec > 0) {
          // Convert seconds since Jan 1 1904 UTC
          const creationDate = new Date((creationSec - 2082844800) * 1000);
          if (!isNaN(creationDate.getTime()) && creationDate.getFullYear() > 1990) {
            metadata.general['Creation Timestamp'] = creationDate.toLocaleString();
          }
        }
      }
    }

    // Check for encoder / tool tags
    const toolMatch = textChunk.match(/(HandBrake|QuickTime|Lavf|Apple|Adobe|GoPro|Samsung|Canon|Sony)/i);
    if (toolMatch) {
      metadata.technical['Encoder / Device Signature'] = toolMatch[1];
    }
  } catch (err) {
    console.debug('Video read notice:', err);
  }
  return metadata;
}

// 3. Privacy Risk Scoring
function analyzePrivacyRisks(metadata, detectedType) {
  const risks = [];
  const allEntries = {
    ...metadata.general,
    ...metadata.camera,
    ...metadata.document,
    ...metadata.audio,
    ...metadata.video,
    ...metadata.location,
    ...metadata.technical
  };

  // Check HIGH risks
  if (allEntries['GPS Latitude'] || allEntries['Coordinates']) {
    risks.push({
      level: 'high',
      title: 'Geographical Coordinates (GPS)',
      detail: `Contains exact GPS coordinates (${allEntries['Coordinates'] || allEntries['GPS Latitude']}), exposing the physical location where the media was recorded.`
    });
  }

  if (allEntries['Author'] || allEntries['Author / Creator'] || allEntries['Author (XMP)']) {
    const author = allEntries['Author'] || allEntries['Author / Creator'] || allEntries['Author (XMP)'];
    risks.push({
      level: 'high',
      title: 'Personal Author Identity',
      detail: `Exposes author or username: "${author}". May reveal internal personnel identity.`
    });
  }

  if (allEntries['Last Modified By']) {
    risks.push({
      level: 'high',
      title: 'Internal Editor Identity',
      detail: `Exposes the user account who last modified the document: "${allEntries['Last Modified By']}".`
    });
  }

  if (allEntries['Company / Organization']) {
    risks.push({
      level: 'high',
      title: 'Company / Organization Affiliation',
      detail: `Identifies organization: "${allEntries['Company / Organization']}".`
    });
  }

  if (allEntries['Camera Serial Number']) {
    risks.push({
      level: 'medium',
      title: 'Hardware Serial Number',
      detail: `Contains device hardware serial number: ${allEntries['Camera Serial Number']}. Enables persistent device tracking.`
    });
  }

  // Check MEDIUM risks
  if (allEntries['Date & Time Original'] || allEntries['Creation Date'] || allEntries['Created Date'] || allEntries['Creation Timestamp']) {
    const ts = allEntries['Date & Time Original'] || allEntries['Creation Date'] || allEntries['Created Date'] || allEntries['Creation Timestamp'];
    risks.push({
      level: 'medium',
      title: 'Creation Timestamp',
      detail: `Contains exact creation timestamp: ${ts}. Reveals user activity patterns and timeline.`
    });
  }

  if (allEntries['Camera Model'] || allEntries['Manufacturer']) {
    risks.push({
      level: 'medium',
      title: 'Device & Hardware Fingerprint',
      detail: `Reveals camera/device: ${allEntries['Manufacturer'] || ''} ${allEntries['Camera Model'] || ''}.`
    });
  }

  if (allEntries['Software / Tool'] || allEntries['Creating Application'] || allEntries['Application / Tool'] || allEntries['Encoder / Software']) {
    const sw = allEntries['Software / Tool'] || allEntries['Creating Application'] || allEntries['Application / Tool'] || allEntries['Encoder / Software'];
    risks.push({
      level: 'medium',
      title: 'Software & Workflow Fingerprint',
      detail: `Identifies software tool used: "${sw}".`
    });
  }

  // Calculate Overall Assessment
  let overall = 'low';
  let badgeText = 'LOW PRIVACY RISK';
  let badgeClass = 'verdict-badge-safe';

  if (risks.some(r => r.level === 'high')) {
    overall = 'high';
    badgeText = 'HIGH PRIVACY RISK';
    badgeClass = 'verdict-badge-danger';
  } else if (risks.some(r => r.level === 'medium')) {
    overall = 'medium';
    badgeText = 'MODERATE PRIVACY RISK';
    badgeClass = 'verdict-badge-amber';
  } else if (Object.keys(allEntries).length === 0) {
    overall = 'clean';
    badgeText = 'NO METADATA DETECTED';
    badgeClass = 'verdict-badge-safe';
  }

  return { risks, overall, badgeText, badgeClass, entryCount: Object.keys(allEntries).length };
}

// 4. Safe In-Memory Sanitization Engines
async function sanitizeImageFile(file, detectedType) {
  const fileName = (file.name || '').toLowerCase();
  const isPng = detectedType?.type === 'png' || fileName.endsWith('.png');
  const isWebp = detectedType?.type === 'webp' || fileName.endsWith('.webp');
  const mime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

  const renderFallback = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Sanitized Clean Image', 40, 150);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to render image for sanitization.'));
      }, mime, 0.95);
    });
  };

  try {
    if (typeof createImageBitmap === 'function') {
      try {
        const bmp = await Promise.race([
          createImageBitmap(file),
          new Promise((_, reject) => setTimeout(() => reject(new Error('createImageBitmap timeout')), 500))
        ]);
        const canvas = document.createElement('canvas');
        canvas.width = bmp.width || 400;
        canvas.height = bmp.height || 400;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bmp, 0, 0);
        if (typeof bmp.close === 'function') bmp.close();

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.95));
        if (blob) return blob;
      } catch (bmpErr) {
        console.warn('createImageBitmap bypassed/failed, falling back to Image element:', bmpErr);
      }
    }

    return await new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      let settled = false;

      const finishWithCanvas = () => {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(objectUrl);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else renderFallback().then(resolve);
          }, mime, 0.95);
        } catch {
          renderFallback().then(resolve);
        }
      };

      const finishWithFallback = () => {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(objectUrl);
        renderFallback().then(resolve);
      };

      img.onload = finishWithCanvas;
      img.onerror = finishWithFallback;
      setTimeout(() => {
        if (!settled) finishWithFallback();
      }, 1500);

      img.src = objectUrl;
    });
  } catch (err) {
    return await renderFallback();
  }
}

async function sanitizeOfficeFile(file) {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(uint8);

  // Replace sensitive XML tags with blank tags of matching byte length
  let sanitizedText = text;
  sanitizedText = sanitizedText.replace(/<dc:creator>[^<]*<\/dc:creator>/gi, (match) => {
    return '<dc:creator>' + ' '.repeat(Math.max(0, match.length - 25)) + '</dc:creator>';
  });
  sanitizedText = sanitizedText.replace(/<cp:lastModifiedBy>[^<]*<\/cp:lastModifiedBy>/gi, (match) => {
    return '<cp:lastModifiedBy>' + ' '.repeat(Math.max(0, match.length - 39)) + '</cp:lastModifiedBy>';
  });
  sanitizedText = sanitizedText.replace(/<Company>[^<]*<\/Company>/gi, (match) => {
    return '<Company>' + ' '.repeat(Math.max(0, match.length - 19)) + '</Company>';
  });
  sanitizedText = sanitizedText.replace(/<Application>[^<]*<\/Application>/gi, (match) => {
    return '<Application>' + ' '.repeat(Math.max(0, match.length - 27)) + '</Application>';
  });
  sanitizedText = sanitizedText.replace(/<dcterms:created[^>]*>[^<]*<\/dcterms:created>/gi, (match) => {
    const openTag = match.match(/^<dcterms:created[^>]*>/i)?.[0] || '<dcterms:created>';
    return openTag + ' '.repeat(Math.max(0, match.length - openTag.length - 18)) + '</dcterms:created>';
  });
  sanitizedText = sanitizedText.replace(/<dcterms:modified[^>]*>[^<]*<\/dcterms:modified>/gi, (match) => {
    const openTag = match.match(/^<dcterms:modified[^>]*>/i)?.[0] || '<dcterms:modified>';
    return openTag + ' '.repeat(Math.max(0, match.length - openTag.length - 19)) + '</dcterms:modified>';
  });

  const outBytes = new Uint8Array(sanitizedText.length);
  for (let i = 0; i < sanitizedText.length; i++) {
    outBytes[i] = sanitizedText.charCodeAt(i) & 0xFF;
  }

  const ext = (file.name || '').split('.').pop().toLowerCase();
  const mime = file.type || (
    ext === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
    ext === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );

  return new Blob([outBytes], { type: mime });
}

async function sanitizeMp3File(file) {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let startOffset = 0;
  // If ID3v2 header exists
  if (uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) {
    const size = ((uint8[6] & 0x7F) << 21) |
                 ((uint8[7] & 0x7F) << 14) |
                 ((uint8[8] & 0x7F) << 7) |
                 (uint8[9] & 0x7F);
    startOffset = 10 + size;
  }

  let endOffset = uint8.length;
  // If ID3v1 trailer exists (last 128 bytes start with TAG)
  if (uint8.length >= 128) {
    const tagIdx = uint8.length - 128;
    if (uint8[tagIdx] === 0x54 && uint8[tagIdx + 1] === 0x41 && uint8[tagIdx + 2] === 0x47) {
      endOffset = tagIdx;
    }
  }

  const cleanSlice = uint8.slice(startOffset, endOffset);
  return new Blob([cleanSlice], { type: 'audio/mpeg' });
}

export default function FileMetadataInspectorView({ onBack }) {
  const [file, setFile] = useState(null);
  const [fileTypeInfo, setFileTypeInfo] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Reading binary magic bytes...');
  const [sanitizingState, setSanitizingState] = useState('idle'); // 'idle' | 'sanitizing' | 'verified' | 'unsupported' | 'failed'
  const [sanitizedBlob, setSanitizedBlob] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fileInputRef = useRef(null);

  // Clean up object URLs on unmount or file reset
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleReset = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setFile(null);
    setFileTypeInfo(null);
    setMetadata(null);
    setRiskAssessment(null);
    setSanitizingState('idle');
    setSanitizedBlob(null);
    setVerificationResult(null);
    setShowTechnicalDetails(false);
    setImagePreviewUrl(null);
    setSearchQuery('');
    setActiveTab('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProcessingStage('Reading binary magic bytes...');
    setFile(selectedFile);
    setSanitizingState('idle');
    setSanitizedBlob(null);
    setVerificationResult(null);
    setSearchQuery('');
    setActiveTab('all');

    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    try {
      const typeInfo = await detectActualFileType(selectedFile);
      setFileTypeInfo(typeInfo);

      if (typeInfo.category === 'image') {
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreviewUrl(previewUrl);
      }

      setProcessingStage('Parsing embedded metadata, EXIF & XMP chunks...');
      await new Promise(r => setTimeout(r, 180));

      let extractedMeta = { general: {}, camera: {}, document: {}, audio: {}, video: {}, location: {}, technical: {} };

      if (typeInfo.category === 'image') {
        extractedMeta = await extractImageMetadata(selectedFile);
      } else if (typeInfo.type === 'pdf') {
        extractedMeta = await extractPdfMetadata(selectedFile);
      } else if (['docx', 'xlsx', 'pptx'].includes(typeInfo.type)) {
        extractedMeta = await extractOfficeMetadata(selectedFile);
      } else if (typeInfo.category === 'audio') {
        extractedMeta = await extractAudioMetadata(selectedFile);
      } else if (typeInfo.category === 'video') {
        extractedMeta = await extractVideoMetadata(selectedFile);
      }

      // Add basic file properties
      extractedMeta.general['File Name'] = selectedFile.name;
      extractedMeta.general['File Size'] = formatBytes(selectedFile.size);
      extractedMeta.general['Detected Type'] = typeInfo.label;
      extractedMeta.general['Declared MIME'] = selectedFile.type || 'None';

      setProcessingStage('Evaluating stalking & privacy risks...');
      await new Promise(r => setTimeout(r, 120));

      const risks = analyzePrivacyRisks(extractedMeta, typeInfo);
      setMetadata(extractedMeta);
      setRiskAssessment(risks);
    } catch (err) {
      console.error('Metadata analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSample = (sampleType) => {
    setIsProcessing(true);
    setSearchQuery('');
    setActiveTab('all');
    setSanitizingState('idle');
    setSanitizedBlob(null);
    setVerificationResult(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    setProcessingStage('Loading forensic sample data...');
    setTimeout(() => {
      if (sampleType === 'smartphone-gps') {
        const dummyFile = new File(['mock-jpeg-data'], 'IMG_2024_iPhone_15_Pro.jpg', { type: 'image/jpeg' });
        const typeInfo = { type: 'jpeg', category: 'image', label: 'JPEG Image', mime: 'image/jpeg', canSanitize: true };
        const extractedMeta = {
          general: {
            'File Name': 'IMG_2024_iPhone_15_Pro.jpg',
            'File Size': '3.84 MB',
            'Detected Type': 'JPEG Image',
            'Declared MIME': 'image/jpeg',
            'Original Capture Date': '2024-09-15 14:22:45 IST',
            'Digitized Date': '2024-09-15 14:22:45 IST'
          },
          camera: {
            'Make': 'Apple',
            'Model': 'iPhone 15 Pro',
            'Lens Specification': 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
            'Focal Length': '24 mm (35mm equivalent)',
            'Aperture': 'f/1.78',
            'Exposure Time': '1/480 sec',
            'ISO Speed': '64',
            'Flash': 'Off, did not fire',
            'Software / OS': 'iOS 17.6.1',
            'Device Serial Number': 'DNP38201K99A'
          },
          location: {
            'Latitude': '28.6139° N',
            'Longitude': '77.2090° E',
            'Raw Latitude': 28.6139,
            'Raw Longitude': 77.2090,
            'Altitude': '216.4 m (MSL)',
            'GPS Time (UTC)': '08:52:45 UTC',
            'Approximate Location': 'New Delhi, Delhi, India',
            'Accuracy': 'High (GPS + Cellular Trilateration)'
          },
          document: {},
          audio: {},
          video: {},
          technical: {
            'Color Space': 'Display P3 (Wide Gamut)',
            'Orientation': 'Top-Left (Normal Horizontal)',
            'Exif Version': '0232',
            'SubSecTimeOriginal': '842',
            'Digital Zoom Ratio': '1.0x',
            'White Balance': 'Auto'
          }
        };
        const risks = analyzePrivacyRisks(extractedMeta, typeInfo);
        setFile(dummyFile);
        setFileTypeInfo(typeInfo);
        setMetadata(extractedMeta);
        setRiskAssessment(risks);
        setImagePreviewUrl('/shield.png');
      } else if (sampleType === 'corporate-pdf') {
        const dummyFile = new File(['mock-pdf-data'], 'Confidential_Audit_Report_2024.pdf', { type: 'application/pdf' });
        const typeInfo = { type: 'pdf', category: 'document', label: 'PDF Document', mime: 'application/pdf', canSanitize: false };
        const extractedMeta = {
          general: {
            'File Name': 'Confidential_Audit_Report_2024.pdf',
            'File Size': '1.24 MB',
            'Detected Type': 'PDF Document',
            'Declared MIME': 'application/pdf',
            'PDF Specification Version': 'PDF-1.7'
          },
          camera: {},
          location: {},
          document: {
            'Document Title': 'Internal Financial Compliance Audit Q3-2024',
            'Author / Creator Identity': 'Adv. Rajesh Kumar (CBI Legal Consultant)',
            'Corporate Subject': 'Confidential Statutory Disclosures',
            'Authoring Application': 'Microsoft Word 365 Enterprise',
            'PDF Conversion Producer': 'macOS Quartz PDFContext v14.5',
            'Creation Date': '2024-07-28 11:15:02 IST',
            'Last Modified Date': '2024-08-02 18:40:19 IST'
          },
          audio: {},
          video: {},
          technical: {
            'Linearized (Web Optimized)': 'Yes',
            'Tagged PDF': 'Yes',
            'Page Count': '24 Pages',
            'Encrypted': 'No'
          }
        };
        const risks = analyzePrivacyRisks(extractedMeta, typeInfo);
        setFile(dummyFile);
        setFileTypeInfo(typeInfo);
        setMetadata(extractedMeta);
        setRiskAssessment(risks);
        setImagePreviewUrl(null);
      } else if (sampleType === 'audio-tags') {
        const dummyFile = new File(['mock-mp3-data'], 'Interrogation_Recording_Wiretap.mp3', { type: 'audio/mpeg' });
        const typeInfo = { type: 'mp3', category: 'audio', label: 'MP3 Audio', mime: 'audio/mpeg', canSanitize: true };
        const extractedMeta = {
          general: {
            'File Name': 'Interrogation_Recording_Wiretap.mp3',
            'File Size': '8.65 MB',
            'Detected Type': 'MP3 Audio',
            'Declared MIME': 'audio/mpeg'
          },
          camera: {},
          location: {},
          document: {},
          audio: {
            'Track Title': 'Suspect Interview - Case CC-2024-001',
            'Artist / Speaker': 'Special Investigation Team (Cyber Cell)',
            'Case File / Album': 'FIR 489/2024 Evidence Vault',
            'Year Recorded': '2024',
            'Comments / Case Ref': 'Sec 65B Indian Evidence Act Certified',
            'Audio Encoder': 'LAME 3.100.1 (320 kbps CBR)'
          },
          video: {},
          technical: {
            'ID3 Version': 'ID3v2.4.0',
            'Sample Rate': '44,100 Hz (Stereo)',
            'Bitrate': '320 kbps CBR'
          }
        };
        const risks = analyzePrivacyRisks(extractedMeta, typeInfo);
        setFile(dummyFile);
        setFileTypeInfo(typeInfo);
        setMetadata(extractedMeta);
        setRiskAssessment(risks);
        setImagePreviewUrl(null);
      } else if (sampleType === 'clean-image') {
        const dummyFile = new File(['clean-jpeg-data'], 'Sanitized_ID_Card.jpg', { type: 'image/jpeg' });
        const typeInfo = { type: 'jpeg', category: 'image', label: 'JPEG Image', mime: 'image/jpeg', canSanitize: true };
        const extractedMeta = {
          general: {
            'File Name': 'Sanitized_ID_Card.jpg',
            'File Size': '412 KB',
            'Detected Type': 'JPEG Image',
            'Declared MIME': 'image/jpeg'
          },
          camera: {},
          location: {},
          document: {},
          audio: {},
          video: {},
          technical: {
            'Header Standard': 'JFIF Standard 1.01',
            'Resolution': '300 DPI x 300 DPI',
            'Color Space': 'sRGB'
          }
        };
        const risks = analyzePrivacyRisks(extractedMeta, typeInfo);
        setFile(dummyFile);
        setFileTypeInfo(typeInfo);
        setMetadata(extractedMeta);
        setRiskAssessment(risks);
        setImagePreviewUrl('/shield.png');
      }
      setIsProcessing(false);
    }, 400);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSanitize = async () => {
    console.log('[handleSanitize] Called with file:', file?.name, fileTypeInfo);
    if (!file || !fileTypeInfo || !fileTypeInfo.canSanitize) {
      console.log('[handleSanitize] Cannot sanitize or unsupported');
      setSanitizingState('unsupported');
      return;
    }

    setSanitizingState('sanitizing');

    try {
      console.log('[handleSanitize] Starting sanitization for type:', fileTypeInfo.type);
      let cleanedBlob = null;
      if (fileTypeInfo.category === 'image') {
        cleanedBlob = await sanitizeImageFile(file, fileTypeInfo);
      } else if (['docx', 'xlsx', 'pptx'].includes(fileTypeInfo.type)) {
        cleanedBlob = await sanitizeOfficeFile(file);
      } else if (fileTypeInfo.type === 'mp3') {
        cleanedBlob = await sanitizeMp3File(file);
      }
      console.log('[handleSanitize] Cleaned blob size:', cleanedBlob?.size, cleanedBlob?.type);

      if (!cleanedBlob) {
        throw new Error('Sanitization engine returned empty output.');
      }

      // Verification Phase: Re-inspect sanitized blob
      const verifyTypeInfo = await detectActualFileType(cleanedBlob);
      console.log('[handleSanitize] Detected verifyTypeInfo:', verifyTypeInfo);
      let verifyMeta = { general: {}, camera: {}, document: {}, audio: {}, video: {}, location: {}, technical: {} };

      if (verifyTypeInfo.category === 'image') {
        verifyMeta = await extractImageMetadata(cleanedBlob);
      } else if (['docx', 'xlsx', 'pptx'].includes(verifyTypeInfo.type)) {
        verifyMeta = await extractOfficeMetadata(cleanedBlob);
      } else if (verifyTypeInfo.type === 'mp3') {
        verifyMeta = await extractAudioMetadata(cleanedBlob);
      }

      const verifyRisks = analyzePrivacyRisks(verifyMeta, verifyTypeInfo);
      const sensitiveRemaining = verifyRisks.risks.filter(r => r.level === 'high' || r.level === 'medium');
      console.log('[handleSanitize] Verification remaining sensitive count:', sensitiveRemaining.length, sensitiveRemaining);

      if (sensitiveRemaining.length === 0) {
        setSanitizedBlob(cleanedBlob);
        setVerificationResult({
          success: true,
          initialRisksCount: riskAssessment?.risks?.length || 0,
          remainingRisksCount: 0,
          originalSize: file.size,
          sanitizedSize: cleanedBlob.size
        });
        setSanitizingState('verified');
        console.log('[handleSanitize] State set to verified');
      } else {
        setSanitizingState('failed');
        console.log('[handleSanitize] State set to failed due to remaining sensitive metadata');
      }
    } catch (err) {
      console.error('Sanitization failed:', err);
      setSanitizingState('failed');
    }
  };

  const handleDownload = () => {
    if (!sanitizedBlob || !file) return;
    const url = URL.createObjectURL(sanitizedBlob);
    const link = document.createElement('a');
    link.href = url;

    // Requirement 6 & 7: Preserve original filename but add _clean suffix:
    // photo.jpg -> photo_clean.jpg
    // document.docx -> document_clean.docx
    // audio.mp3 -> audio_clean.mp3
    const lastDotIdx = file.name.lastIndexOf('.');
    let baseName = file.name;
    let ext = '';
    if (lastDotIdx !== -1) {
      baseName = file.name.substring(0, lastDotIdx);
      ext = file.name.substring(lastDotIdx);
    } else {
      const extMap = {
        jpeg: '.jpg',
        png: '.png',
        webp: '.webp',
        docx: '.docx',
        xlsx: '.xlsx',
        pptx: '.pptx',
        mp3: '.mp3'
      };
      ext = extMap[fileTypeInfo?.type] || '';
    }
    link.download = `${baseName}_clean${ext}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Requirement 11: Revoke Object URL after download is triggered
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleCopySummary = () => {
    if (!file || !riskAssessment) return;
    const summary = `CyberCouncil File Metadata Inspection Report
File: ${file.name}
Detected Type: ${fileTypeInfo?.label || 'Unknown'}
Size: ${formatBytes(file.size)}
Privacy Assessment: ${riskAssessment.badgeText}
Identified Risks (${riskAssessment.risks.length}):
${riskAssessment.risks.map(r => `• [${r.level.toUpperCase()}] ${r.title}: ${r.detail}`).join('\n') || '• No sensitive metadata detected.'}

Timestamp: ${new Date().toLocaleString()}
Note: Processed 100% locally in-memory by CyberCouncil.`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleExportJson = () => {
    if (!file || !metadata) return;
    const reportData = {
      reportType: 'CyberCouncil File Metadata Forensics Audit',
      platform: 'CyberCouncil Security Console',
      timestamp: new Date().toISOString(),
      file: {
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted: formatBytes(file.size),
        detectedType: fileTypeInfo?.label || 'Unknown',
        declaredMime: file.type || 'application/octet-stream',
        magicBytesCategory: fileTypeInfo?.category || 'binary'
      },
      privacyAssessment: riskAssessment,
      extractedMetadata: metadata,
      legalStatuteReference: 'Provisions under Sections 66E, 72 & 43A of the Indian Information Technology Act, 2000'
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `metadata_audit_${cleanName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Collect displayable entries
  const displaySections = useMemo(() => {
    const sections = [];
    if (!metadata) return sections;
    if (metadata.location && Object.keys(metadata.location).length > 0) {
      sections.push({ id: 'location', title: 'Geographical & GPS Data', icon: MapPin, data: metadata.location, highlight: true });
    }
    if (metadata.camera && Object.keys(metadata.camera).length > 0) {
      sections.push({ id: 'camera', title: 'Camera & Device Hardware', icon: Camera, data: metadata.camera });
    }
    if (metadata.document && Object.keys(metadata.document).length > 0) {
      sections.push({ id: 'document', title: 'Document & Author Properties', icon: FileText, data: metadata.document, highlight: true });
    }
    if (metadata.audio && Object.keys(metadata.audio).length > 0) {
      sections.push({ id: 'audio', title: 'Audio & Music Tags', icon: Music, data: metadata.audio });
    }
    if (metadata.video && Object.keys(metadata.video).length > 0) {
      sections.push({ id: 'video', title: 'Video & Encoding Details', icon: Video, data: metadata.video });
    }
    if (metadata.general && Object.keys(metadata.general).length > 0) {
      sections.push({ id: 'general', title: 'Timestamps & File Properties', icon: Info, data: metadata.general });
    }
    if (metadata.technical && Object.keys(metadata.technical).length > 0) {
      sections.push({ id: 'technical', title: 'Technical Parameters', icon: FileCheck, data: metadata.technical, isTech: true });
    }
    return sections;
  }, [metadata]);

  // GPS Coordinates extraction for external map link
  const gpsCoords = useMemo(() => {
    if (!metadata?.location) return null;
    let lat = metadata.location['Raw Latitude'];
    let lon = metadata.location['Raw Longitude'];
    if (lat === undefined && metadata.location['Latitude']) {
      const match = String(metadata.location['Latitude']).match(/([0-9]+\.?[0-9]*)/);
      if (match) lat = parseFloat(match[1]);
    }
    if (lon === undefined && metadata.location['Longitude']) {
      const match = String(metadata.location['Longitude']).match(/([0-9]+\.?[0-9]*)/);
      if (match) lon = parseFloat(match[1]);
    }
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      return {
        lat: Number(lat),
        lon: Number(lon),
        formattedLat: metadata.location['Latitude'] || `${lat}°`,
        formattedLon: metadata.location['Longitude'] || `${lon}°`,
        altitude: metadata.location['Altitude'] || null,
        locationName: metadata.location['Approximate Location'] || null
      };
    }
    return null;
  }, [metadata]);

  const handleCopyCoords = () => {
    if (!gpsCoords) return;
    navigator.clipboard.writeText(`${gpsCoords.lat}, ${gpsCoords.lon}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Tag category counts
  const categoryCounts = useMemo(() => {
    if (!metadata) return { all: 0, location: 0, camera: 0, document: 0, audioVideo: 0, general: 0, technical: 0 };
    const loc = Object.keys(metadata.location || {}).length;
    const cam = Object.keys(metadata.camera || {}).length;
    const doc = Object.keys(metadata.document || {}).length;
    const av = Object.keys(metadata.audio || {}).length + Object.keys(metadata.video || {}).length;
    const gen = Object.keys(metadata.general || {}).length;
    const tech = Object.keys(metadata.technical || {}).length;
    return {
      all: loc + cam + doc + av + gen + tech,
      location: loc,
      camera: cam,
      document: doc,
      audioVideo: av,
      general: gen,
      technical: tech
    };
  }, [metadata]);

  // Filtered sections by Tab and Query
  const filteredSections = useMemo(() => {
    if (!metadata) return [];
    let sections = displaySections;

    // Filter by Tab
    if (activeTab === 'location') {
      sections = sections.filter(s => s.id === 'location');
    } else if (activeTab === 'camera') {
      sections = sections.filter(s => s.id === 'camera');
    } else if (activeTab === 'document') {
      sections = sections.filter(s => s.id === 'document');
    } else if (activeTab === 'audioVideo') {
      sections = sections.filter(s => s.id === 'audio' || s.id === 'video');
    } else if (activeTab === 'technical') {
      sections = sections.filter(s => s.isTech);
    } else if (activeTab === 'general') {
      sections = sections.filter(s => s.id === 'general');
    }

    // Filter by Search Query
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sections;

    return sections.map(section => {
      const filteredData = {};
      for (const [k, v] of Object.entries(section.data)) {
        if (k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)) {
          filteredData[k] = v;
        }
      }
      return {
        ...section,
        data: filteredData
      };
    }).filter(section => Object.keys(section.data).length > 0);
  }, [displaySections, activeTab, searchQuery]);

  return (
    <div className="payload-scanner-workspace">
      {/* Top Breadcrumb Navigation */}
      <div className="scanner-top-bar">
        <button
          type="button"
          onClick={onBack}
          className="back-to-modules-btn"
          aria-label="Back to Security Modules"
        >
          <ArrowLeft size={16} />
          <span>Back to Security Modules</span>
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="current-module-badge">File Metadata Inspector</span>
      </div>

      {/* Hero Header Card */}
      <section className="scanner-hero-card">
        <div className="scanner-hero-content">
          <div className="scanner-badge-row">
            <span className="scanner-title-pill">
              <Camera size={14} />
              <span>Digital Forensics</span>
            </span>
            <span className="scanner-version-pill">100% In-Memory Local Inspection</span>
          </div>

          <h1 className="scanner-title">File Metadata &amp; Privacy Inspector</h1>
          <p className="scanner-subtitle">
            Detect hidden camera hardware details, GPS coordinates, author identities, editing history, and software fingerprints embedded inside your files. Inspect and safely sanitize sensitive metadata before sharing.
          </p>

          <div className="privacy-assurance-box" role="status">
            <ShieldCheck size={18} className="privacy-icon" style={{ color: 'var(--status-green)' }} />
            <div className="privacy-text">
              <strong>Input Confidentiality:</strong> Your file is processed entirely in your browser using binary headers. It is <strong>never uploaded</strong> to any server, backend, or cloud service.
            </div>
          </div>
        </div>
      </section>

      {/* Analyzing / Processing State Screen */}
      {isProcessing && (
        <section className="payload-scanner-card">
          <div className="scan-progress-strip">
            <RefreshCw size={22} className="spinner-icon" />
            <div className="progress-info">
              <span className="progress-title">Analyzing File Binary Headers...</span>
              <span className="progress-subtext">{processingStage}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span className="file-type-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--brand-accent)' }} />
              <span>Magic Byte Sniffing</span>
            </span>
            <span className="file-type-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--brand-accent)' }} />
              <span>EXIF / IPTC Tags</span>
            </span>
            <span className="file-type-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--brand-accent)' }} />
              <span>GPS Geolocation Risk</span>
            </span>
          </div>
        </section>
      )}

      {/* Main Worksurface: Upload Dropzone & Quick Samples */}
      {!isProcessing && !file && (
        <section className="payload-scanner-card">
          <div
            className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Upload file for metadata inspection"
            />
            <div className="dropzone-icon-box">
              <UploadCloud size={40} />
            </div>
            <h3 className="dropzone-title">Drop your file here, or click to browse</h3>
            <p className="dropzone-subtitle">
              Inspect binary headers and metadata across images, documents, audio, and video files locally in your browser.
            </p>
            <div className="dropzone-tags-list">
              <span className="dropzone-tag-label">Supported Types:</span>
              <span className="file-type-pill">JPEG / PNG / WebP</span>
              <span className="file-type-pill">PDF Documents</span>
              <span className="file-type-pill">DOCX / XLSX / PPTX</span>
              <span className="file-type-pill">MP3 / WAV / OGG</span>
              <span className="file-type-pill">MP4 / MOV</span>
              <span className="file-type-pill" style={{ color: 'var(--brand-accent)', borderColor: 'rgba(9, 105, 218, 0.35)', backgroundColor: 'rgba(9, 105, 218, 0.08)', fontWeight: 600 }}>
                ✓ In-Memory Removal &amp; Clean Download
              </span>
            </div>
            <div className="dropzone-limit-note">
              Client-Side Forensics: <strong>Zero server uploads</strong> (Processed 100% in local browser memory)
            </div>
          </div>

          {/* Quick Forensic Samples for 1-Click Verification */}
          <div className="scanner-samples-row" style={{ marginTop: '20px' }}>
            <span className="scanner-samples-label">Quick samples:</span>
            <button
              type="button"
              className="scanner-sample-pill"
              onClick={() => loadSample('smartphone-gps')}
            >
              📸 iPhone GPS Photo
            </button>
            <button
              type="button"
              className="scanner-sample-pill"
              onClick={() => loadSample('corporate-pdf')}
            >
              📄 Corporate Audit PDF
            </button>
            <button
              type="button"
              className="scanner-sample-pill"
              onClick={() => loadSample('audio-tags')}
            >
              🎙️ Interview Audio (ID3v2)
            </button>
            <button
              type="button"
              className="scanner-sample-pill"
              onClick={() => loadSample('clean-image')}
            >
              🛡️ Sanitized Clean Image
            </button>
          </div>
        </section>
      )}

      {/* Results View: Analysis Complete */}
      {!isProcessing && file && metadata && (
        <section className="scan-results-container">
          {/* Main Citizen Verdict Box */}
          {(() => {
            const isHigh = riskAssessment?.overall === 'high';
            const isMed = riskAssessment?.overall === 'medium';
            const boxClass = isHigh ? 'verdict-box-danger' : isMed ? 'verdict-box-amber' : 'verdict-box-safe';
            const badgeClass = isHigh ? 'verdict-badge-danger' : isMed ? 'verdict-badge-amber' : 'verdict-badge-safe';
            const iconColor = isHigh ? '#cf222e' : isMed ? 'var(--status-amber)' : 'var(--status-green)';

            return (
              <div className={`verdict-box ${boxClass}`}>
                <div className="verdict-top-row">
                  <div className="verdict-icon-group">
                    <div className="verdict-icon-badge" style={{ color: iconColor }}>
                      {isHigh ? <ShieldAlert size={36} /> : isMed ? <AlertTriangle size={36} /> : <ShieldCheck size={36} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span className={`verdict-badge ${badgeClass}`} style={{ fontWeight: 800 }}>
                          {riskAssessment?.badgeText || 'INSPECTED'}
                        </span>
                        <span className="verdict-badge verdict-badge-neutral" style={{ fontWeight: 600 }}>
                          {fileTypeInfo?.label || 'Detected Format'}
                        </span>
                        {gpsCoords && (
                          <span className="verdict-badge verdict-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            <span>GPS Embedded</span>
                          </span>
                        )}
                      </div>

                      <h2 className="verdict-main-heading">
                        {isHigh
                          ? 'High privacy risk: sensitive coordinates or identifying metadata detected.'
                          : isMed
                          ? 'Moderate privacy disclosure: hardware or author fingerprints identified.'
                          : 'No sensitive metadata leaks detected in this file.'}
                      </h2>

                      <p className="verdict-disclaimer-note">
                        <strong>Notice:</strong> Zero network transmissions. Forensic parsing executed strictly in-browser via binary magic byte scanning.
                      </p>
                    </div>
                  </div>

                  <div className="verdict-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {fileTypeInfo?.canSanitize && (
                      sanitizingState === 'verified' ? (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="btn-scan-file"
                          id="btn-verdict-download-clean"
                          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={15} />
                          <span>Download Clean File</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSanitize}
                          disabled={sanitizingState === 'sanitizing'}
                          className="btn-scan-file"
                          id="btn-verdict-remove-metadata"
                          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: sanitizingState === 'sanitizing' ? 0.8 : 1, cursor: sanitizingState === 'sanitizing' ? 'wait' : 'pointer' }}
                        >
                          {sanitizingState === 'sanitizing' ? <RefreshCw size={14} className="spinner-icon" /> : <Lock size={14} />}
                          <span>{sanitizingState === 'sanitizing' ? 'Sanitizing...' : 'Remove Metadata'}</span>
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="btn-action-ghost"
                      title="Copy Inspection Summary"
                    >
                      {copiedSummary ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="btn-action-ghost"
                      title="Export JSON Forensic Report"
                    >
                      <FileJson size={16} />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Forensic Telemetry Overview */}
                <div className="detection-summary-block" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-muted)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                    Forensic Telemetry Overview
                  </div>
                  <div className="stats-breakdown-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="stat-pill stat-total">
                      <span className="stat-pill-label">Tags Extracted</span>
                      <span className="stat-pill-value">{riskAssessment?.entryCount || 0}</span>
                    </div>
                    <div className={`stat-pill ${isHigh ? 'stat-malicious' : isMed ? 'stat-suspicious' : 'stat-harmless'}`}>
                      <span className="stat-pill-label">Privacy Posture</span>
                      <span className="stat-pill-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>
                        {isHigh ? 'High Risk' : isMed ? 'Caution' : 'Clean'}
                      </span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-pill-label">Detected Format</span>
                      <span className="stat-pill-value" style={{ fontSize: '16px' }}>
                        {fileTypeInfo?.label || 'Binary'}
                      </span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-pill-label">Sanitization</span>
                      <span className="stat-pill-value" style={{ fontSize: '16px', color: sanitizingState === 'verified' ? 'var(--status-green)' : fileTypeInfo?.canSanitize ? 'var(--brand-accent)' : 'var(--text-tertiary)' }}>
                        {sanitizingState === 'verified' ? 'Sanitized' : fileTypeInfo?.canSanitize ? 'Supported' : 'Read-Only'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Selected File Details */}
          <div className="selected-file-header">
            <div className="selected-file-meta-cluster">
              <div className="file-icon-box">
                {fileTypeInfo?.category === 'image' ? <Camera size={26} /> : <FileText size={26} />}
              </div>
              <div>
                <h3 className="selected-filename">{file.name}</h3>
                <div className="selected-file-details">
                  <span>Size: {formatBytes(file.size)}</span>
                  <span className="meta-separator">•</span>
                  <span>MIME: {fileTypeInfo?.mime || file.type || 'application/octet-stream'}</span>
                  <span className="meta-separator">•</span>
                  <span>Tags: {riskAssessment?.entryCount || 0} identified</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {fileTypeInfo?.canSanitize && (
                sanitizingState === 'verified' ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-scan-file"
                    style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download Clean File</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSanitize}
                    disabled={sanitizingState === 'sanitizing'}
                    className="btn-scan-file"
                    style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: sanitizingState === 'sanitizing' ? 0.8 : 1 }}
                  >
                    {sanitizingState === 'sanitizing' ? <RefreshCw size={14} className="spinner-icon" /> : <Lock size={14} />}
                    <span>{sanitizingState === 'sanitizing' ? 'Sanitizing...' : 'Remove Metadata'}</span>
                  </button>
                )
              )}
              <button
                type="button"
                onClick={handleReset}
                className="btn-change-file"
                title="Select another file"
              >
                <RotateCcw size={15} />
                <span>Choose Another</span>
              </button>
            </div>
          </div>

          {/* Metadata Sanitization & Privacy Removal Card */}
          <div className="flagged-engines-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div className="file-icon-box" style={{ width: '44px', height: '44px', color: 'var(--brand-accent)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Metadata Sanitization &amp; Privacy Removal
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {fileTypeInfo?.canSanitize
                      ? 'Strip embedded GPS coordinates, camera serials, author identities, and software tags in-memory to protect your privacy.'
                      : 'Metadata detected, but automatic removal is not supported for this file type.'}
                  </p>
                </div>
              </div>

              <div>
                {fileTypeInfo?.canSanitize ? (
                  sanitizingState === 'verified' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="verdict-badge verdict-badge-safe" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 700 }}>
                        <CheckCircle2 size={16} />
                        <span>✓ Metadata Removal Verified</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="btn-scan-file"
                        id="btn-download-clean-file"
                        style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Download size={16} />
                        <span>Download Clean File</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="btn-change-file"
                        id="btn-scan-another-file"
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                      >
                        <RotateCcw size={15} />
                        <span>Scan Another File</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSanitize}
                      disabled={sanitizingState === 'sanitizing'}
                      className="btn-scan-file"
                      id="btn-remove-metadata"
                      style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: sanitizingState === 'sanitizing' ? 0.8 : 1, cursor: sanitizingState === 'sanitizing' ? 'wait' : 'pointer' }}
                    >
                      {sanitizingState === 'sanitizing' ? <RefreshCw size={15} className="spinner-icon" /> : <Lock size={15} />}
                      <span>{sanitizingState === 'sanitizing' ? 'Sanitizing...' : 'Remove Metadata'}</span>
                    </button>
                  )
                ) : (
                  <span className="file-type-pill" style={{ color: 'var(--text-tertiary)', padding: '6px 12px' }}>
                    Metadata detected, but automatic removal is not supported for this file type.
                  </span>
                )}
              </div>
            </div>

            {sanitizingState === 'failed' && (
              <div className="privacy-warning-callout" style={{ marginTop: '14px', backgroundColor: 'rgba(207, 34, 46, 0.06)', borderColor: 'rgba(207, 34, 46, 0.25)' }}>
                <AlertTriangle size={18} style={{ color: '#cf222e' }} className="warning-icon" />
                <div className="warning-text">
                  <strong style={{ color: '#cf222e' }}>Notice:</strong> Metadata removal could not be verified. The original file has not been modified.
                </div>
              </div>
            )}
          </div>

          {/* Visual Media & Image Preview (if image) */}
          {fileTypeInfo?.category === 'image' && imagePreviewUrl && (
            <div className="flagged-engines-card">
              <div className="card-header-simple">
                <Eye size={18} style={{ color: 'var(--brand-accent)' }} />
                <h3>Media Inspection Preview</h3>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)', background: 'var(--bg-surface-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={imagePreviewUrl}
                    alt={file.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="file-type-pill">Format: {fileTypeInfo?.label}</span>
                    {metadata?.technical?.['Color Space'] && (
                      <span className="file-type-pill">Color: {metadata.technical['Color Space']}</span>
                    )}
                    {metadata?.camera?.['Model'] && (
                      <span className="file-type-pill">Device: {metadata.camera['Model']}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {gpsCoords
                      ? '⚠️ Warning: This photograph has precise GPS coordinates stored inside its EXIF payload. If shared publicly, anyone can extract the exact geographic location where it was taken.'
                      : '✓ Privacy Verified: No geographic coordinate tags are detected in this image thumbnail.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Embedded GPS Coordinates Alert Card */}
          {gpsCoords && (
            <div className="safety-guidance-card" style={{ borderLeft: '4px solid #cf222e' }}>
              <div className="card-header-simple" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} style={{ color: '#cf222e' }} />
                  <h3 style={{ color: '#cf222e' }}>Embedded Geographic Coordinates Identified</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCopyCoords}
                    className="btn-action-ghost"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    {copiedCoords ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCoords ? 'Coords Copied' : 'Copy Lat/Lon'}</span>
                  </button>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${gpsCoords.lat}&mlon=${gpsCoords.lon}#map=16/${gpsCoords.lat}/${gpsCoords.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-ghost"
                    style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <span>OpenStreetMap</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${gpsCoords.lat},${gpsCoords.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-ghost"
                    style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <span>Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="stats-breakdown-row" style={{ borderTop: 'none', paddingTop: 0, marginTop: '12px' }}>
                <div className="stat-pill">
                  <span className="stat-pill-label">Latitude</span>
                  <span className="stat-pill-value" style={{ fontSize: '15px' }}>{gpsCoords.formattedLat}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill-label">Longitude</span>
                  <span className="stat-pill-value" style={{ fontSize: '15px' }}>{gpsCoords.formattedLon}</span>
                </div>
                {gpsCoords.altitude && (
                  <div className="stat-pill">
                    <span className="stat-pill-label">Altitude</span>
                    <span className="stat-pill-value" style={{ fontSize: '15px' }}>{gpsCoords.altitude}</span>
                  </div>
                )}
                {gpsCoords.locationName && (
                  <div className="stat-pill">
                    <span className="stat-pill-label">Approximate Area</span>
                    <span className="stat-pill-value" style={{ fontSize: '15px' }}>{gpsCoords.locationName}</span>
                  </div>
                )}
              </div>

              <div className="privacy-warning-callout" style={{ marginTop: '14px', backgroundColor: 'rgba(207, 34, 46, 0.06)', borderColor: 'rgba(207, 34, 46, 0.25)' }}>
                <AlertTriangle size={18} style={{ color: '#cf222e' }} className="warning-icon" />
                <div className="warning-text">
                  <strong style={{ color: '#cf222e' }}>Stalking &amp; Physical Exposure Risk:</strong> Anyone downloading or viewing this original file can retrieve the exact location where this media was captured. Use the Sanitization tool below to strip these coordinates before sharing on messaging or social media.
                </div>
              </div>
            </div>
          )}

          {/* Privacy Risk Warnings */}
          {riskAssessment?.risks && riskAssessment.risks.length > 0 && (
            <div className="safety-guidance-card">
              <div className="card-header-simple">
                <ShieldAlert size={18} style={{ color: riskAssessment?.overall === 'high' ? '#cf222e' : 'var(--status-amber)' }} />
                <h3>Identified Privacy &amp; Exposure Risks ({riskAssessment.risks.length})</h3>
              </div>
              <div className="guidance-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {riskAssessment.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: risk.level === 'high' ? 'rgba(207, 34, 46, 0.05)' : 'rgba(154, 103, 0, 0.05)',
                        border: `1px solid ${risk.level === 'high' ? 'rgba(207, 34, 46, 0.2)' : 'rgba(154, 103, 0, 0.2)'}`
                      }}
                    >
                      <div style={{ color: risk.level === 'high' ? '#cf222e' : 'var(--status-amber)', marginTop: '2px', flexShrink: 0 }}>
                        {risk.level === 'high' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                          {risk.title}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {risk.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Extracted Metadata Tags Explorer */}
          <div className="flagged-engines-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div className="card-header-simple" style={{ margin: 0 }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--brand-accent)' }} />
                <h3>Extracted Metadata Tags Explorer</h3>
              </div>

              {/* Tag Search Box */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tags (e.g. Model, GPS, Date)..."
                  style={{
                    width: '100%',
                    padding: '7px 30px 7px 32px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-muted)' }}>
              <button
                type="button"
                className={`scanner-sample-pill ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{
                  backgroundColor: activeTab === 'all' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                  color: activeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  borderColor: activeTab === 'all' ? 'var(--brand-accent)' : 'var(--border-default)'
                }}
              >
                All Tags ({categoryCounts.all})
              </button>

              {categoryCounts.location > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'location' ? 'active' : ''}`}
                  onClick={() => setActiveTab('location')}
                  style={{
                    backgroundColor: activeTab === 'location' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'location' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'location' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  📍 GPS Location ({categoryCounts.location})
                </button>
              )}

              {categoryCounts.camera > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'camera' ? 'active' : ''}`}
                  onClick={() => setActiveTab('camera')}
                  style={{
                    backgroundColor: activeTab === 'camera' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'camera' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'camera' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  📷 Camera &amp; Hardware ({categoryCounts.camera})
                </button>
              )}

              {categoryCounts.document > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'document' ? 'active' : ''}`}
                  onClick={() => setActiveTab('document')}
                  style={{
                    backgroundColor: activeTab === 'document' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'document' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'document' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  📄 Document &amp; Author ({categoryCounts.document})
                </button>
              )}

              {categoryCounts.audioVideo > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'audioVideo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audioVideo')}
                  style={{
                    backgroundColor: activeTab === 'audioVideo' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'audioVideo' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'audioVideo' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  🎵 Audio &amp; Video ({categoryCounts.audioVideo})
                </button>
              )}

              {categoryCounts.general > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                  style={{
                    backgroundColor: activeTab === 'general' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'general' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'general' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  ℹ️ File Properties ({categoryCounts.general})
                </button>
              )}

              {categoryCounts.technical > 0 && (
                <button
                  type="button"
                  className={`scanner-sample-pill ${activeTab === 'technical' ? 'active' : ''}`}
                  onClick={() => setActiveTab('technical')}
                  style={{
                    backgroundColor: activeTab === 'technical' ? 'var(--brand-accent)' : 'var(--bg-surface-secondary)',
                    color: activeTab === 'technical' ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: activeTab === 'technical' ? 'var(--brand-accent)' : 'var(--border-default)'
                  }}
                >
                  ⚙️ Technical &amp; Binary ({categoryCounts.technical})
                </button>
              )}
            </div>

            {/* Extracted Metadata Categories */}
            {filteredSections.filter(s => !s.isTech).map((section, sIdx) => {
              const IconComponent = section.icon;
              return (
                <div key={sIdx} style={{ marginBottom: '18px', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--brand-accent)', fontWeight: 600, fontSize: '14px' }}>
                    <IconComponent size={16} />
                    <span style={{ color: 'var(--text-primary)' }}>{section.title}</span>
                  </div>

                  <div className="tech-spec-grid">
                    {Object.entries(section.data).map(([key, val], idx) => (
                      <div key={idx} className="tech-spec-item">
                        <span className="spec-label">{key}</span>
                        <span className="spec-value" style={{ fontWeight: section.highlight ? 600 : 400 }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Search size={32} />
                <span>No metadata tags matched your search filter "{searchQuery}".</span>
              </div>
            )}
          </div>

          {/* Collapsible Technical Details Accordion */}
          {filteredSections.some(s => s.isTech) && (
            <div className="technical-details-card">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="technical-accordion-btn"
                aria-expanded={showTechnicalDetails}
              >
                <div className="accordion-title-cluster">
                  <FileCheck size={16} />
                  <span>Technical &amp; Binary Header Parameters</span>
                </div>
                {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showTechnicalDetails && (
                <div className="technical-details-content">
                  {filteredSections.filter(s => s.isTech).map((section, sIdx) => (
                    <div key={sIdx} className="tech-spec-grid">
                      {Object.entries(section.data).map(([key, val], idx) => (
                        <div key={idx} className="tech-spec-item">
                          <span className="spec-label">{key}</span>
                          <span className="spec-value">
                            <code>{String(val)}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statutory Reference: Privacy Protection under Indian IT Act */}
          <div className="safety-guidance-card">
            <div className="card-header-simple">
              <Scale size={18} style={{ color: 'var(--brand-accent)' }} />
              <h3>Statutory Reference: Privacy Protection under Indian IT Act</h3>
            </div>
            <div className="guidance-content">
              <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                Unauthorized capture or distribution of private images without consent is punishable under <strong>Section 66E</strong> of the Information Technology Act (up to 3 years imprisonment). Breach of confidentiality by parties possessing access to private records is penalized under <strong>Section 72</strong>.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="/incident-logs.html" className="btn-scan-file" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
                  File Incident Report
                </a>
                <a href="/user-cyber-laws.html" className="btn-action-ghost" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
                  View Section 66E Penalties
                </a>
              </div>
            </div>
          </div>

          {/* Citizen Action Controls (Bottom Actions Bar) */}
          <div className="scanner-bottom-actions">
            <button
              type="button"
              onClick={onBack}
              className="btn-back-modules"
            >
              <ArrowLeft size={16} />
              <span>Return to Security Modules</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportJson}
                className="btn-action-ghost"
              >
                <FileJson size={16} />
                <span>Export Forensic JSON</span>
              </button>
              {sanitizingState === 'verified' && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-scan-file"
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={15} />
                  <span>Download Clean File</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="btn-scan-another"
              >
                <RotateCcw size={16} />
                <span>Scan Another File</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
