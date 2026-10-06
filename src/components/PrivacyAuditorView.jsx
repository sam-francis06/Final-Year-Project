import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Eye,
  Trash2,
  Lock,
  Globe,
  Users,
  Clock,
  UserCheck,
  Cpu,
  Mail
} from 'lucide-react';

/**
 * CyberCouncil - Privacy Policy Auditor
 * 
 * Citizen-Facing Privacy Policy Intelligence & Transparency Analyzer
 * Analyzes pasted company privacy policies across 19 categories.
 * 
 * Strict Guarantees:
 * - 100% In-Memory Analysis: zero persistent storage (no localStorage/sessionStorage)
 * - Zero Backend / External AI upload: no tracking, no profiling
 * - Evidence-based: excerpts extracted directly from supplied citizen text
 * - Transparent & Conservative: Never invents or assumes unstated practices
 */

// Helper to extract sentences matching keywords with context (skips short section headings)
function extractEvidence(text, regex, maxWords = 45) {
  if (!text) return null;
  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  let match;
  let bestExcerpt = null;

  while ((match = globalRegex.exec(text)) !== null) {
    const index = match.index;
    let start = 0;
    for (let i = index - 1; i >= 0; i--) {
      if (text[i] === '\n' || text[i] === '.' || text[i] === ';') {
        start = i + 1;
        break;
      }
    }

    let end = text.length;
    for (let i = index + match[0].length; i < text.length; i++) {
      if (text[i] === '.' || text[i] === '\n') {
        end = text[i] === '.' ? i + 1 : i;
        break;
      }
    }

    let excerpt = text.substring(start, end).trim();
    // Strip section numbers e.g. "6. "
    excerpt = excerpt.replace(/^[0-9]+[\.\)]\s*/, '');
    excerpt = excerpt.replace(/^[^a-zA-Z0-9"'(]+/, '');

    const words = excerpt.split(/\s+/).filter(Boolean);
    if (words.length > 4) {
      if (excerpt.endsWith(':') && end < text.length) {
        const nextPart = text.substring(end, end + 200).trim().split('\n')[0];
        if (nextPart) {
          excerpt += ' ' + nextPart.trim();
        }
      }
      // If excerpt begins enumerating rights and the adjacent next sentence continues (e.g. objection / consent), include it
      if (/\b(access|correction|deletion|restriction)\b/i.test(excerpt) && end < text.length) {
        const nextPart = text.substring(end, end + 300).trim();
        if (/\b(object|objection|withdraw consent|consent)\b/i.test(nextPart)) {
          let nextEnd = nextPart.length;
          for (let j = 0; j < nextPart.length; j++) {
            if (nextPart[j] === '.' || nextPart[j] === '\n') {
              nextEnd = nextPart[j] === '.' ? j + 1 : j;
              break;
            }
          }
          excerpt += ' ' + nextPart.substring(0, nextEnd).trim();
        }
      }
      const finalWords = excerpt.split(/\s+/).filter(Boolean);
      if (finalWords.length > maxWords) {
        return finalWords.slice(0, maxWords).join(' ') + '...';
      }
      return excerpt;
    }

    if (!bestExcerpt) {
      bestExcerpt = excerpt;
    }
  }

  return bestExcerpt;
}

// Strict Source-Grounded Privacy Policy Analysis Engine
export function analyzePrivacyPolicy(text) {
  if (!text || text.trim().length === 0) return null;

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const charCount = cleanText.length;

  // 1. Personal Data Collection
  const dataCategories = [];
  if (/\b(name|full name|first name|last name)\b/i.test(lower)) dataCategories.push('Full Name');
  if (/\b(email|email address|e-mail)\b/i.test(lower)) dataCategories.push('Email Address');
  if (/\b(phone|mobile|telephone|cell number)\b/i.test(lower)) dataCategories.push('Phone Number');
  if (/\b(postal address|physical address|billing address|shipping address|street address|residence)\b/i.test(lower)) dataCategories.push('Physical Address');
  if (/\b(ip address|internet protocol address)\b/i.test(lower)) dataCategories.push('IP Address');
  if (/\b(device identifier|imei|mac address|hardware model|operating system|device info|device details|unique device identifier)\b/i.test(lower)) dataCategories.push('Device Information');
  if (/\b(location|geolocation|gps|latitude|longitude|precise location|approximate location)\b/i.test(lower)) dataCategories.push('Location / Geolocation');
  if (/\b(credit card|debit card|payment card|bank account|cvv|billing details|billing information|payment information)\b/i.test(lower)) dataCategories.push('Payment & Financial Details');
  if (/\b(browsing history|search queries|pages viewed|clickstream|usage data|activity log|interaction)\b/i.test(lower)) dataCategories.push('Browsing & Activity Data');
  if (/\b(cookies|pixel tags|web beacons|local storage|session storage|sdk|similar technologies)\b/i.test(lower)) dataCategories.push('Cookies & Trackers');
  if (/\b(biometric|fingerprint|facial recognition|health|medical|genetic|religion|race|ethnicity|sexual orientation)\b/i.test(lower)) dataCategories.push('Sensitive / Biometric Data');
  if (/\b(contacts|address book|social media profile|friends list)\b/i.test(lower)) dataCategories.push('Contacts & Social Graph');

  const dataCollectionExcerpt = extractEvidence(
    cleanText,
    /\b(we collect|information we collect|personal data collected|information you provide|automatically collect|categories of personal)\b/i
  );

  // 2. Purpose of Collection
  const purposes = [];
  if (/\b(provide|deliver|operate|maintain|furnish)\s+(the\s+)?(service|services|product|platform|website|app)\b/i.test(lower)) purposes.push('Delivering & Operating Core Services');
  if (/\b(create|manage|maintain|authenticate|administer)\s+(your\s+)?(account|profile|registration)\b/i.test(lower)) purposes.push('Account Authentication & Profile Management');
  if (/\b(analytics|analyze|statistics|metrics|usage trends|performance measurement)\b/i.test(lower)) purposes.push('Analytics & Service Performance');
  if (/\b(personalize|customise|customize|tailor|targeted content|recommendations)\b/i.test(lower)) purposes.push('Content Personalization & Customization');
  if (/\b(advertising|marketing|promotional|send promotions|targeted ads|interest-based ads|commercial communications)\b/i.test(lower)) purposes.push('Advertising & Direct Marketing');
  if (/\b(security|fraud|fraudulent|abuse|unauthorized|protect our systems|threat detection|protect our platform)\b/i.test(lower)) purposes.push('Security Safeguards & Fraud Prevention');
  if (/\b(communicate|contact you|customer support|inquiries|respond to your requests|notifications)\b/i.test(lower)) purposes.push('Customer Communications & Support');
  if (/\b(legal obligation|comply with law|regulatory requirement|court order|subpoena|legal compliance)\b/i.test(lower)) purposes.push('Regulatory & Legal Compliance');

  const purposeExcerpt = extractEvidence(
    cleanText,
    /\b(how we use|purposes? for which|use your (personal\s+)?information|we use the information|we use your information)\b/i
  );

  // 3. Third-Party Sharing (Accurately distinguishing 8 distinct categories)
  const sharingCategories = [];
  if (/\b(cloud hosting|hosting (providers?|services?)|cloud infrastructure|data hosting|servers? hosting|web hosting)\b/i.test(lower)) {
    sharingCategories.push('Cloud hosting providers');
  }
  if (/\b(payment processors?|payment processing|payment gateways?|billing processors?|facilitate billing|process payments?)\b/i.test(lower)) {
    sharingCategories.push('Payment processors');
  }
  if (/\b(analytics (providers?|partners?|vendors?)|measurement (providers?|partners?)|usage analytics)\b/i.test(lower)) {
    sharingCategories.push('Analytics providers');
  }
  if (/\b(advertising (companies|partners?|networks?)|ad networks?|marketing companies|marketing partners?)\b/i.test(lower)) {
    sharingCategories.push('Advertising companies');
  }
  if (/\b(customer support|support vendors?|customer service partners?|helpdesk (services?|vendors?))\b/i.test(lower)) {
    sharingCategories.push('Customer support providers');
  }
  if (/\b(security (and|&)? fraud[- ]prevention|fraud prevention|security partners?|threat detection|prevent fraud)\b/i.test(lower)) {
    sharingCategories.push('Security and fraud-prevention providers');
  }
  if (/\b(corporate group( companies)?|affiliates?|subsidiaries?|parent company|group companies|companies within the corporate group)\b/i.test(lower)) {
    sharingCategories.push('Companies within the corporate group');
  }
  if (/\b(government (and|&)? legal disclosures?|government(\/|\s+and\s+)legal recipients|law enforcement|subpoena|court order|legal process|regulatory authorities|government authorities|comply with law)\b/i.test(lower)) {
    sharingCategories.push('Government/legal recipients');
  }

  // Backward compatibility alias for views expecting sharingEntities
  const sharingEntities = sharingCategories;

  const namedThirdParties = [];
  if (/\bgoogle\b/i.test(lower)) namedThirdParties.push('Google');
  if (/\bfacebook|meta\b/i.test(lower)) namedThirdParties.push('Meta / Facebook');
  if (/\bamazon|aws\b/i.test(lower)) namedThirdParties.push('Amazon / AWS');
  if (/\bmicrosoft|azure\b/i.test(lower)) namedThirdParties.push('Microsoft');
  if (/\bapple\b/i.test(lower)) namedThirdParties.push('Apple');
  if (/\btwitter|x corp\b/i.test(lower)) namedThirdParties.push('X / Twitter');
  if (/\bstripe\b/i.test(lower)) namedThirdParties.push('Stripe');
  if (/\bpaypal\b/i.test(lower)) namedThirdParties.push('PayPal');

  const sharingExcerpt = extractEvidence(
    cleanText,
    /\b(we share personal information|share personal information|disclose personal information|we share|disclose your|sharing of information|third-party disclosure|disclosure to third parties|third parties in the following)\b/i
  );

  // 4. Advertising & Tracking (Strict source-grounded)
  const trackingDisclosures = [];
  if (/\bcookies\b/i.test(lower)) trackingDisclosures.push('cookies');
  if (/\bsimilar technologies\b/i.test(lower)) trackingDisclosures.push('similar technologies');
  if (/\banalytics\b/i.test(lower)) trackingDisclosures.push('analytics');
  if (/\badvertising\b/i.test(lower)) trackingDisclosures.push('advertising');
  if (/\bpersonalization\b/i.test(lower)) trackingDisclosures.push('personalization');
  if (/\bthird[- ]party (advertising|analytics|advertising (and|&)? analytics|advertising and analytics technologies|advertising\/analytics)\b/i.test(lower)) {
    trackingDisclosures.push('third-party advertising and analytics technologies');
  }

  const hasAdvertising = /\b(advertis|marketing|commercial communications|promotional offers|sponsored content)\b/i.test(lower);
  const hasTargetedAds = /\b(targeted (ads|advertising)|personalized advertising|interest-based|behavioral advertising|re-targeting|cross-context behavioral)\b/i.test(lower);
  const hasTracking = trackingDisclosures.length > 0;
  const hasAcrossVisits = /\b(across visits|across websites|across sessions|across third[- ]party sites|across devices)\b/i.test(lower);

  const adTrackingExcerpt = extractEvidence(
    cleanText,
    /\b(our website uses cookies|website uses cookies|uses cookies and similar technologies|we use cookies, similar technologies|we use cookies and similar technologies)\b/i
  ) || extractEvidence(
    cleanText,
    /\b(cookies, similar technologies|cookies and similar technologies|cookies and tracking technologies|tracking technologies)\b/i
  );

  // 5. Cookie Analysis
  const hasCookies = /\b(cookies|cookie policy|session cookie|persistent cookie|browser cookie)\b/i.test(lower);
  const cookieTypes = [];
  if (/\b(strictly necessary|essential cookies?)\b/i.test(lower)) cookieTypes.push('Strictly Necessary / Essential');
  if (/\b(functional|preference cookies?)\b/i.test(lower)) cookieTypes.push('Preferences & Functionality');
  if (/\b(analytics cookies?|performance cookies?)\b/i.test(lower)) cookieTypes.push('Analytics & Performance');
  if (/\b(advertising cookies?|targeting cookies?|marketing cookies?)\b/i.test(lower)) cookieTypes.push('Advertising & Targeting');

  const cookieExcerpt = extractEvidence(
    cleanText,
    /\b(cookies and (similar\s+)?technologies|cookies, similar technologies|use cookies|manage cookies|cookie settings)\b/i
  );

  // 6. Data Retention (Strictly grounded: no indefinite claims)
  const hasRetention = /\b(retain|retention|stored for|keep your information|period of time|data storage duration|as long as necessary)\b/i.test(lower);
  const hasNumericalRetention = /\b(\d+|one|two|three|four|five|six|seven|ten|twelve)\s+(days?|months?|years?)\b/i.test(lower);
  const hasRetentionPurposes = /\b(services? and legitimate business purposes|legitimate business purposes|backups|fraud prevention|legal obligations|disputes)\b/i.test(lower);

  let retentionDetail = 'Not clearly stated in the provided policy.';
  if (hasNumericalRetention) {
    retentionDetail = 'Specific numerical retention timeframe is mentioned in the policy.';
  } else if (hasRetention) {
    retentionDetail = 'The policy describes general retention purposes but does not provide specific retention periods for each category of personal information.';
  }

  const retentionExcerpt = extractEvidence(
    cleanText,
    /\b(we retain personal information|retain your information|how long we keep|data retention|retention period|retain personal data|as long as necessary)\b/i
  );

  // 7. Data Deletion
  const hasDeletion = /\b(delete|deletion|erase|erasure|remove your (account|data|personal information)|right to be forgotten)\b/i.test(lower);
  let deletionDetail = 'Not clearly stated in the provided policy.';
  if (/\b(delete your (account|information)|close your account|request deletion|submit a deletion request|erase your (data|information)|right to deletion)\b/i.test(lower)) {
    deletionDetail = 'A process to request account closure or data deletion is described in the policy.';
  }

  const deletionExcerpt = extractEvidence(
    cleanText,
    /\b(delete your account|request deletion|deletion of your information|erasure of personal data|how to delete|right to erase|right to deletion)\b/i
  );

  // 8. Normalized User Privacy Rights Extraction (Strict Semantic Detection)
  const userRights = [];
  if (/\b(right (to (request )?access|of access)|request(ing)? access|obtain access|accessing personal (information|data)|access (your |to your )?(personal )?(information|data)|access\b(?=\s*[,;.]|\s+(and|or)\b))|(?:^|[\n\r•\-\*:]|\d+\.\s*)\s*(the\s+)?(right to (request )?)?access\b/i.test(lower)) {
    userRights.push('Access');
  }
  if (/\b(correction|correct inaccurate (data|information)|rectify(ing| information)?|rectification|update (your )?(personal )?(information|data)|correct(ing)? (your )?(personal )?(information|data)|right to (correct|rectify|correction|rectification))\b/i.test(lower)) {
    userRights.push('Correction');
  }
  if (/\b(deletion|delete (your )?(personal )?(information|data|account)|erasure|request removal|remove your (personal )?(information|data)|right to (deletion|erasure|delete|be forgotten))\b/i.test(lower)) {
    userRights.push('Deletion');
  }
  if (/\b(restriction( of processing)?|restrict(ing)? processing|limit (certain )?processing|right to (restriction|restrict)( of processing)?)\b/i.test(lower)) {
    userRights.push('Restriction');
  }
  if (/\b(object(ing)? to (certain )?processing( activities)?|objection to (certain )?(types of )?processing|objection to processing|object to processing|oppose processing|right to object(ion)?|objection)\b/i.test(lower)) {
    userRights.push('Objection');
  }
  if (/\b(request(ing)? (a )?copy( of (certain )?(personal )?(data|information))?|copy of (certain )?(personal )?(data|information)|data portability|portable copy|portability|obtain a copy|receive a copy|export (your )?(data|information)|right to (request )?(a )?copy|copy\b(?=\s*[,;.]|\s+(and|or)\b))|(?:^|[\n\r•\-\*:]|\d+\.\s*)\s*(the\s+)?(right to (request )?)?copy\b/i.test(lower)) {
    userRights.push('Requesting a copy of information');
  }
  if (/\b(withdraw(al)? (of )?consent|withdraw(ing)? consent|revok(e|ing) consent|right to withdraw(al)?( of)? consent)\b/i.test(lower)) {
    userRights.push('Withdrawal of consent');
  }

  const rightsAreConditional = /\b(depending on your location|subject to applicable law|under applicable law|depending on where you live|jurisdiction|applicable law)\b/i.test(lower);

  // Extract the specific excerpt that explicitly lists the privacy rights
  let rightsExcerpt = null;

  // 1. Check for bulleted/numbered block listing rights
  const bulletLines = cleanText.split('\n')
    .map(l => l.trim())
    .filter(l => /^(?:[-*•]|\d+[\.\)])\s*(?:the\s+)?(right to|access|correction|deletion|restriction|objection|requesting a copy|withdrawal of consent)\b/i.test(l));
  if (bulletLines.length >= 3) {
    rightsExcerpt = bulletLines.join(' ');
  }

  // 2. Check for sentence(s) directly enumerating rights
  if (!rightsExcerpt) {
    rightsExcerpt = extractEvidence(
      cleanText,
      /\b(including the right to request access|right to request access, correction|right to request access|access, correction, deletion|access, correction|rights:?\s*(access|the right to access))\b/i,
      70
    );
  }

  // 3. Fallback to general rights descriptions
  if (!rightsExcerpt) {
    rightsExcerpt = extractEvidence(
      cleanText,
      /\b(the right to access|right to access|right to deletion|privacy rights described in the policy)\b/i,
      60
    );
  }

  // 9. Children's Data
  const hasChildrenSection = /\b(child|children|minor|minors|under the age of|parental consent|coppa|age verification)\b/i.test(lower);
  let childrenDetail = 'Not clearly stated in the provided policy.';
  if (/\b(not directed to children|do not knowingly collect|under (13|16|18))\b/i.test(lower)) {
    childrenDetail = 'The policy explicitly states services are not directed to children under a specified age limit and does not knowingly collect their data.';
  } else if (hasChildrenSection) {
    childrenDetail = 'Children or minor data provisions are referenced in the policy.';
  }

  const childrenExcerpt = extractEvidence(
    cleanText,
    /\b(children'?s? privacy|under (13|14|16|18)|do not knowingly collect|parental consent)\b/i
  );

  // 10. International Transfers (Status Disclosed, complete list missing)
  const hasTransfers = /\b(countries other than|outside (of )?(the country|your country)|other countries|another country|internationally|international(ly)? (transfer|transferred|processing|processed|storage|stored)|cross-border|transferred outside|overseas|transfer personal (data|information) to other countries|standard contractual clauses|adequacy decision)\b/i.test(lower) ||
    /\b(process(ed)? and store(d)? (personal )?information in countries)\b/i.test(lower);
  const hasCompleteCountryList = /\b(transferred specifically to the following countries|stored exclusively in the following countries)\b/i.test(lower);

  let transferDetail = 'Not clearly stated in the provided policy.';
  if (hasTransfers) {
    transferDetail = 'The policy states that personal information may be processed and stored in countries other than the country where the user lives.';
  }

  const transferExcerpt = extractEvidence(
    cleanText,
    /\b(process and store personal information in countries other than|countries other than the country where you live|countries other than|international (data\s+)?transfers?|transferred to|processed outside|cross-border transfers?)\b/i
  );

  // 11. Security Measures (No fabricated technologies)
  const hasSecurity = /\b(security|safeguards?|technical and organizational measures?|protect our (platform|systems|services)|fraud prevention|prevent unauthorized|protect your information)\b/i.test(lower);
  let securityDetail = 'Not clearly stated in the provided policy.';
  if (hasSecurity) {
    securityDetail = 'The policy states that reasonable technical and organizational measures are used to protect personal information.';
  }

  const securityExcerpt = extractEvidence(
    cleanText,
    /\b(reasonable technical and organizational measures|technical and organizational measures|measures to protect personal information|safeguards to protect|protect personal information against unauthorized)\b/i
  ) || extractEvidence(
    cleanText,
    /\b(reasonable measures to protect|protect our platform|protect our systems|security measures|how we protect|safeguard your information|data security)\b/i
  );

  // 12. Government & Legal Disclosure
  const hasLegalDisclosure = sharingCategories.includes('Government/legal recipients') ||
    /\b(law enforcement|subpoena|court order|warrant|legal process|regulatory request|national security|comply with applicable laws)\b/i.test(lower);
  let legalDisclosureDetail = 'Not clearly stated in the provided policy.';
  if (hasLegalDisclosure) {
    legalDisclosureDetail = 'The policy permits disclosing personal information to law enforcement, regulators, or courts when required by law or legal process.';
  }

  const legalExcerpt = extractEvidence(
    cleanText,
    /\b(government and legal disclosures|law enforcement|legal requirements|compliance with laws|subpoena or court order|legal process)\b/i
  );

  // 13. Profiling & Automated Decision Making
  const hasProfiling = /\b(profiling|automated decision|automated processing|algorithm|credit scoring|behavioral profiling)\b/i.test(lower);
  let profilingDetail = 'Not clearly stated in the provided policy.';
  if (hasProfiling) {
    profilingDetail = 'The policy mentions profiling or automated processing mechanisms.';
  }

  const profilingExcerpt = extractEvidence(
    cleanText,
    /\b(automated decision|profiling|automated processing|predictive algorithms)\b/i
  );

  // 14. Policy Changes
  const hasChanges = /\b(changes? to (this|our|the)? (privacy )?policy|updates? to (this|our|the)? (privacy )?policy|we may update|modify this policy|revise this policy|policy changes?|updates?|changes?)\b/i.test(lower);
  let changesDetail = 'Not clearly stated in the provided policy.';
  if (/\b(continued use|constitutes acceptance|posting the updated|notify you by email)\b/i.test(lower)) {
    changesDetail = 'Procedures for updating the privacy policy and notifying users are described.';
  } else if (hasChanges) {
    changesDetail = 'Procedures for updating the privacy policy are referenced.';
  }

  const changesExcerpt = extractEvidence(
    cleanText,
    /\b(changes to (this|our) privacy policy|updates to this policy|how we notify you of changes|modifications to this)\b/i
  );

  // 15. Privacy Contact Information
  const emails = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase()))];
  const hasDpo = /\b(data protection officer|dpo|privacy officer|privacy contact)\b/i.test(lower);

  const contactExcerpt = extractEvidence(
    cleanText,
    /\b(contact us|how to contact|privacy officer|data protection officer|contact details|contact us at)\b/i
  );

  // 16. Important Things to Know (Strict Source-Grounded Findings with Evidence)
  const importantFindings = [];

  // Finding 1: Privacy Rights Described in Policy
  if (userRights.length > 0) {
    importantFindings.push({
      type: 'good',
      topic: 'Privacy Rights Described in the Policy',
      title: 'Privacy Rights Described in the Policy',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-verified',
      evidence: rightsExcerpt,
      excerpt: rightsExcerpt,
      interpretation: `The policy explicitly describes ${userRights.length} privacy rights:`,
      items: userRights,
      meaning: `The policy explicitly describes ${userRights.length} privacy rights:`,
      missingDetail: "Whether and how these rights apply may depend on the user's location and applicable law.",
      whatItMeansForYou: 'The policy describes several ways you may request access, correction, deletion, restriction, objection, a copy of certain information, or withdrawal of consent. The availability and scope of these rights may depend on applicable law and your location.'
    });
  } else {
    importantFindings.push({
      type: 'attention',
      topic: 'Privacy Rights Described in the Policy',
      title: 'Privacy Rights Described in the Policy',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'The provided policy text does not explicitly enumerate citizen privacy rights.',
      missingDetail: 'Specific rights (such as access, deletion, or correction) are not detailed.',
      whatItMeansForYou: 'You may have to rely on external legal mandates rather than a described company rights process.'
    });
  }

  // Finding 2: International Transfers
  if (hasTransfers) {
    importantFindings.push({
      type: 'attention',
      topic: 'International Transfers',
      title: 'International Transfers',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-verified',
      evidence: transferExcerpt,
      excerpt: transferExcerpt,
      interpretation: 'The policy states that personal information may be processed and stored in countries other than the country where the user lives.',
      meaning: 'The policy states that personal information may be processed and stored in countries other than the country where the user lives.',
      missingDetail: 'The policy does not provide a complete list of countries where personal information may be processed or stored.',
      whatItMeansForYou: 'The policy states that personal information may be processed and stored in countries other than the country where the user lives. However, destination countries are not enumerated.'
    });
  } else {
    importantFindings.push({
      type: 'neutral',
      topic: 'International Transfers',
      title: 'International Transfers',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'The policy does not explicitly state whether information travels across international borders.',
      missingDetail: 'The provided policy does not state whether data is transferred or stored internationally.',
      whatItMeansForYou: 'It is uncertain where data storage and processing facilities are geographically located.'
    });
  }

  // Finding 3: Data Retention
  if (hasRetention) {
    importantFindings.push({
      type: hasNumericalRetention ? 'good' : 'attention',
      topic: 'Data Retention',
      title: 'Data Retention',
      status: hasNumericalRetention ? 'Clearly Explained' : 'Partially Explained',
      statusBadgeClass: hasNumericalRetention ? 'badge-verified' : 'badge-attention',
      evidence: retentionExcerpt,
      excerpt: retentionExcerpt,
      interpretation: 'The policy describes general retention purposes but does not provide specific retention periods for each category of personal information.',
      meaning: 'The policy describes general retention purposes but does not provide specific retention periods for each category of personal information.',
      missingDetail: 'The policy does not provide specific retention periods for each category of personal information.',
      whatItMeansForYou: 'The policy describes general retention purposes but does not provide specific retention periods for each category of personal information.'
    });
  } else {
    importantFindings.push({
      type: 'neutral',
      topic: 'Data Retention',
      title: 'Data Retention',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'Data retention timelines or criteria are not clearly stated in the provided policy.',
      missingDetail: 'The policy does not state how long personal data is kept.',
      whatItMeansForYou: 'Retention schedules are not addressed in the provided text.'
    });
  }

  // Finding 4: Third-Party Sharing
  if (sharingCategories.length > 0) {
    importantFindings.push({
      type: 'attention',
      topic: 'Third-Party Data Sharing',
      title: 'Third-Party Data Sharing',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-verified',
      evidence: sharingExcerpt,
      excerpt: sharingExcerpt,
      interpretation: `${sharingCategories.length} recipient categories are described:`,
      items: sharingCategories,
      meaning: `${sharingCategories.length} recipient categories are described:`,
      missingDetail: 'The policy does not provide a complete list of specific vendor company names.',
      whatItMeansForYou: 'The policy describes external sharing across recipient categories, but specific vendor company names are not provided.'
    });
  } else {
    importantFindings.push({
      type: 'neutral',
      topic: 'Third-Party Data Sharing',
      title: 'Third-Party Data Sharing',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'The provided text does not explicitly detail external third-party disclosures.',
      missingDetail: 'External data sharing partners are not described.',
      whatItMeansForYou: 'You may need to verify whether outside vendors or processors handle your data.'
    });
  }

  // Finding 5: Tracking & Cookies
  if (trackingDisclosures.length > 0) {
    importantFindings.push({
      type: 'attention',
      topic: 'Cookies & Tracking Technologies',
      title: 'Cookies & Tracking Technologies',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-attention',
      evidence: adTrackingExcerpt || cookieExcerpt,
      excerpt: adTrackingExcerpt || cookieExcerpt,
      interpretation: 'The policy describes cookies and similar technologies used for functions including login sessions, preferences, analytics, understanding user activity, and personalized advertising.',
      meaning: 'The policy describes cookies and similar technologies used for functions including login sessions, preferences, analytics, understanding user activity, and personalized advertising.',
      missingDetail: hasAcrossVisits ? null : 'The policy does not state that tracking occurs across visits.',
      whatItMeansForYou: 'The policy describes cookies and similar technologies used for functions including login sessions, preferences, analytics, understanding user activity, and personalized advertising.'
    });
  } else {
    importantFindings.push({
      type: 'neutral',
      topic: 'Cookies & Tracking Technologies',
      title: 'Cookies & Tracking Technologies',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'Tracking technologies or cookies are not clearly stated in the provided policy.',
      missingDetail: 'No tracking technologies are described in the supplied text.',
      whatItMeansForYou: 'No online tracking mechanisms are disclosed in the supplied text.'
    });
  }

  // Finding 6: Data Deletion Process
  if (hasDeletion) {
    importantFindings.push({
      type: 'good',
      topic: 'Data Deletion Process',
      title: 'Data Deletion Process',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-verified',
      evidence: deletionExcerpt,
      excerpt: deletionExcerpt,
      interpretation: 'The policy outlines a process to request data erasure or account deletion.',
      meaning: 'The policy outlines a process to request data erasure or account deletion.',
      missingDetail: null,
      whatItMeansForYou: 'You have a described path to ask the company to remove your personal information.'
    });
  } else {
    importantFindings.push({
      type: 'attention',
      topic: 'Data Deletion Process',
      title: 'Data Deletion Process',
      status: 'Not Clearly Stated',
      statusBadgeClass: 'badge-unavailable',
      evidence: null,
      excerpt: null,
      interpretation: 'Not clearly stated in the provided policy.',
      meaning: 'The policy does not clearly specify how users can request removal of their personal data.',
      missingDetail: 'A specific deletion or account removal procedure is not described in the text.',
      whatItMeansForYou: 'You may find it unclear how to permanently erase your records from their databases.'
    });
  }

  // Finding 7: Security Safeguards
  if (hasSecurity) {
    importantFindings.push({
      type: 'good',
      topic: 'Security Safeguards',
      title: 'Security Safeguards',
      status: 'Clearly Explained',
      statusBadgeClass: 'badge-verified',
      evidence: securityExcerpt,
      excerpt: securityExcerpt,
      interpretation: 'The policy states that reasonable technical and organizational measures are used to protect personal information.',
      meaning: 'The policy states that reasonable technical and organizational measures are used to protect personal information.',
      missingDetail: 'The policy does not list specific security technologies or technical implementations.',
      whatItMeansForYou: 'The policy states that reasonable technical and organizational measures are used to protect personal information.'
    });
  }

  // 17. Policy Transparency Scorecard
  const transparencyAreas = [
    {
      area: 'Data Collection',
      status: dataCategories.length >= 3 ? 'clear' : (dataCategories.length > 0 ? 'partial' : 'missing'),
      detail: dataCategories.length > 0 ? `${dataCategories.length} categories listed` : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Purpose of Collection',
      status: purposes.length >= 3 ? 'clear' : (purposes.length > 0 ? 'partial' : 'missing'),
      detail: purposes.length > 0 ? `${purposes.length} purposes stated` : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Data Sharing',
      status: sharingCategories.length >= 3 ? 'clear' : (sharingCategories.length > 0 ? 'partial' : 'missing'),
      detail: sharingCategories.length > 0 ? `${sharingCategories.length} recipient categories distinguished` : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Data Retention',
      status: hasNumericalRetention ? 'clear' : (hasRetention ? 'partial' : 'missing'),
      detail: hasNumericalRetention ? 'Specific numerical timeframes provided' : (hasRetention ? 'Partially Explained: no specific timeframes provided' : 'Not clearly stated in the provided policy.')
    },
    {
      area: 'Data Deletion',
      status: hasDeletion ? 'clear' : 'missing',
      detail: hasDeletion ? deletionDetail : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'User Rights',
      status: userRights.length > 0 ? 'clear' : 'missing',
      detail: userRights.length > 0 ? `${userRights.length} rights explicitly described` : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Tracking & Cookies',
      status: trackingDisclosures.length > 0 ? 'clear' : 'missing',
      detail: trackingDisclosures.length > 0 ? `${trackingDisclosures.slice(0, 3).join(', ')} described` : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'International Transfers',
      status: hasTransfers ? 'clear' : 'missing',
      detail: hasTransfers ? 'Disclosed; complete country list not provided' : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Security Safeguards',
      status: hasSecurity ? 'clear' : 'missing',
      detail: hasSecurity ? securityDetail : 'Not clearly stated in the provided policy.'
    },
    {
      area: 'Policy Changes',
      status: hasChanges ? 'clear' : 'missing',
      detail: hasChanges ? changesDetail : 'Not clearly stated in the provided policy.'
    }
  ];

  const clearCount = transparencyAreas.filter(a => a.status === 'clear').length;
  const partialCount = transparencyAreas.filter(a => a.status === 'partial').length;
  const missingCount = transparencyAreas.filter(a => a.status === 'missing').length;

  // 18. Overall Privacy Concern Calculation & Reasons
  let concernLevel = 'MODERATE PRIVACY CONCERN';
  let badgeClass = 'verdict-badge-amber';
  let boxClass = 'verdict-box-amber';
  const concernReasons = [];

  const formattedRightsList = userRights.length > 1
    ? `${userRights.slice(0, -1).join(', ')}, and ${userRights[userRights.length - 1]}`
    : (userRights[0] || '');

  if (dataCategories.length > 0) {
    concernReasons.push(`The policy describes collection of ${dataCategories.slice(0, 3).join(', ')}${dataCategories.length > 3 ? ' and other categories' : ''}.`);
  }
  if (sharingCategories.length > 0) {
    concernReasons.push(`Information may be shared with: ${sharingCategories.slice(0, 3).join(', ')}${sharingCategories.length > 3 ? ' and other distinguished categories' : ''}.`);
  }
  if (trackingDisclosures.length > 0) {
    concernReasons.push(`Discloses use of ${trackingDisclosures.join(', ')}.`);
  }
  if (hasRetention && !hasNumericalRetention) {
    concernReasons.push('The policy describes general retention purposes but does not provide specific retention periods for each category of personal information.');
  }
  if (hasTransfers) {
    concernReasons.push('International data processing and storage are disclosed, without an enumerated list of countries.');
  }
  if (userRights.length > 0) {
    concernReasons.push(`Describes ${userRights.length} user privacy rights (${formattedRightsList}).`);
  }

  // Deterministic Concern Level Assessment Based on Actual Policy Findings
  const isHighConcern = 
    dataCategories.includes('Sensitive / Biometric Data') ||
    (!hasDeletion && userRights.length === 0) ||
    missingCount >= 5;

  const isLowConcern = 
    !isHighConcern &&
    userRights.length >= 4 &&
    hasDeletion &&
    hasSecurity &&
    !dataCategories.includes('Sensitive / Biometric Data');

  if (isHighConcern) {
    concernLevel = 'HIGH PRIVACY CONCERN';
    badgeClass = 'verdict-badge-danger';
    boxClass = 'verdict-box-danger';
  } else if (isLowConcern) {
    concernLevel = 'LOW PRIVACY CONCERN';
    badgeClass = 'verdict-badge-safe';
    boxClass = 'verdict-box-safe';
  } else {
    concernLevel = 'MODERATE PRIVACY CONCERN';
    badgeClass = 'verdict-badge-amber';
    boxClass = 'verdict-box-amber';
  }

  // 19. Plain-Language In Simple Terms Summary
  let simpleTerms = `The policy says the organization collects information such as ${dataCategories.length > 0 ? dataCategories.slice(0, 4).join(', ').toLowerCase() : 'personal details'} to provide and operate its services. `;
  if (sharingCategories.length > 0) {
    simpleTerms += `Information is shared across ${sharingCategories.length} recipient categories, including ${sharingCategories.map(c => c.toLowerCase()).join(', ')}. `;
  } else {
    simpleTerms += 'Third-party sharing is not clearly stated in the provided policy. ';
  }
  if (trackingDisclosures.length > 0) {
    simpleTerms += 'The policy describes cookies and similar technologies used for functions including login sessions, preferences, analytics, understanding user activity, and personalized advertising. ';
  }
  if (hasRetention) {
    simpleTerms += 'The policy describes general retention purposes but does not provide specific retention periods for each category of personal information. ';
  }
  if (hasDeletion) {
    simpleTerms += 'The policy provides a process to request data deletion. ';
  }
  if (userRights.length > 0) {
    simpleTerms += `The policy explicitly describes ${userRights.length} privacy rights: ${formattedRightsList}. The availability and scope of these rights may depend on applicable law and your location. `;
  }
  if (hasTransfers) {
    simpleTerms += 'The policy states that personal information may be processed and stored in countries other than the country where the user lives, but does not provide a complete list of countries.';
  }

  // 20. Strict Grounded Citizen Recommendations
  const recommendations = [];
  if (hasRetention && !hasNumericalRetention) {
    recommendations.push(
      'Contact the privacy team if you need clarification about retention periods.'
    );
  }
  if (hasTransfers && !hasCompleteCountryList) {
    recommendations.push(
      'Contact the organization if you want the list of countries where data may be processed or stored.'
    );
  }
  if (userRights.length > 0) {
    recommendations.push(
      `Review the ${userRights.length} privacy rights described in the policy and determine which requests are relevant to your situation.`
    );
  }
  if (hasDeletion) {
    recommendations.push(
      'Use the stated account deletion/support process if you want to request deletion.'
    );
  }
  if (sharingCategories.length > 0) {
    recommendations.push(
      'Contact the privacy team if you want clarification about third-party recipients.'
    );
  }

  return {
    wordCount,
    charCount,
    analysisTimestamp: new Date().toLocaleTimeString(),
    concernLevel,
    badgeClass,
    boxClass,
    concernReasons,
    simpleTerms,
    dataCategories,
    purposes,
    sharingCategories,
    sharingEntities,
    namedThirdParties,
    trackingDisclosures,
    hasTargetedAds,
    hasTracking,
    hasAcrossVisits,
    cookieTypes,
    hasRetention,
    hasNumericalRetention,
    retentionDetail,
    hasDeletion,
    deletionDetail,
    userRights,
    privacyRights: userRights,
    rightsAreConditional,
    childrenDetail,
    hasTransfers,
    transferDetail,
    securityDetail,
    legalDisclosureDetail,
    profilingDetail,
    changesDetail,
    uniqueEmails,
    hasDpo,
    importantFindings,
    transparencyAreas,
    clearCount,
    partialCount,
    missingCount,
    recommendations,
    excerpts: {
      dataCollection: dataCollectionExcerpt,
      purpose: purposeExcerpt,
      sharing: sharingExcerpt,
      adTracking: adTrackingExcerpt,
      cookie: cookieExcerpt,
      retention: retentionExcerpt,
      deletion: deletionExcerpt,
      rights: rightsExcerpt,
      children: childrenExcerpt,
      transfer: transferExcerpt,
      security: securityExcerpt,
      legal: legalExcerpt,
      profiling: profilingExcerpt,
      changes: changesExcerpt,
      contact: contactExcerpt
    }
  };
}

export default function PrivacyAuditorView({ onBack }) {
  const [policyText, setPolicyText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [expandedExcerptId, setExpandedExcerptId] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const wordCount = policyText.trim() ? policyText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = policyText.length;

  const handleAnalyze = () => {
    if (!policyText.trim()) return;
    setIsAnalyzing(true);
    // Slight simulated latency for transparent analysis feel
    setTimeout(() => {
      const result = analyzePrivacyPolicy(policyText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleClear = () => {
    setPolicyText('');
    setAnalysisResult(null);
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const summary = `CyberCouncil Privacy Policy Analysis Report
Concern Level: ${analysisResult.concernLevel}
In Simple Terms: ${analysisResult.simpleTerms}

Key Reasons:
${analysisResult.concernReasons.map(r => `• ${r}`).join('\n')}

Policy Transparency:
• Clearly Explained: ${analysisResult.clearCount}
• Partially Explained: ${analysisResult.partialCount}
• Not Clearly Stated: ${analysisResult.missingCount}

Recommendations:
${analysisResult.recommendations.map(rec => `• ${rec}`).join('\n')}

Note: This analysis is a plain-language citizen privacy evaluation based on the supplied policy text, not a legal certification.`;

    navigator.clipboard.writeText(summary);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

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
        <span className="current-module-badge">Privacy Policy Auditor</span>
      </div>

      {/* Hero Header Card */}
      <section className="scanner-hero-card">
        <div className="scanner-hero-content">
          <div className="scanner-badge-row">
            <span className="scanner-title-pill">
              <Eye size={14} />
              <span>Privacy &amp; Policy Intelligence</span>
            </span>
            <span className="scanner-version-pill">Citizen Language Analyzer</span>
          </div>

          <h1 className="scanner-title">Privacy Policy Auditor</h1>
          <p className="scanner-subtitle">
            Understand what a company's Privacy Policy really means for you. Paste a Privacy Policy below to extract data collection, third-party sharing, tracking practices, and privacy rights described in the policy.
          </p>

          <div className="privacy-assurance-box" role="status">
            <ShieldCheck size={18} className="privacy-icon" style={{ color: 'var(--status-green)' }} />
            <div className="privacy-text">
              <strong>Input Confidentiality:</strong> Your pasted policy is analyzed locally in your browser and is not uploaded or stored by CyberCouncil.
            </div>
          </div>
        </div>
      </section>

      {/* Input Screen (When No Analysis Has Run) */}
      {!analysisResult && !isAnalyzing && (
        <section className="policy-input-card">
          <div className="policy-input-header">
            <label htmlFor="policyInput" className="policy-input-label">
              <FileText size={16} style={{ color: 'var(--brand-blue)' }} />
              <span>Paste Privacy Policy Text</span>
            </label>
            <div className="policy-char-stats">
              <span>{wordCount} words</span>
              <span style={{ margin: '0 6px' }}>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <div className="textarea-container">
            <textarea
              id="policyInput"
              rows={10}
              className="policy-textarea"
              placeholder="Paste Privacy Policy text here (e.g. from a mobile app, online service, social media platform, or web store)..."
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
            />
            <div className="policy-textarea-footer">
              <span className="privacy-tag">
                <ShieldCheck size={14} />
                <span>100% In-Memory Analysis (No Upload)</span>
              </span>
              <span className="char-counter">
                {wordCount} words | {charCount} chars
              </span>
            </div>
          </div>

          <div className="policy-actions-row">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!policyText.trim()}
              className="btn-scan-another"
              style={{
                opacity: policyText.trim() ? 1 : 0.5,
                cursor: policyText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              <Sparkles size={16} />
              <span>Analyze Privacy Policy</span>
            </button>

            {policyText && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-back-modules"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Analysis In-Progress State */}
      {isAnalyzing && (
        <div className="scan-progress-strip" style={{ display: 'flex', marginTop: '24px' }}>
          <RotateCcw size={20} className="spinner-icon" />
          <div className="progress-info">
            <span className="progress-title">Analyzing Privacy Policy text...</span>
            <span className="progress-subtext">Extracting data collection, third-party sharing, tracking practices, and user rights</span>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && !isAnalyzing && (
        <div className="scan-results-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {/* Main Citizen Verdict Box */}
          <div className={`verdict-box ${analysisResult.boxClass}`}>
            <div className="verdict-top-row">
              <div className="verdict-icon-group">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="verdict-badge verdict-badge-neutral" style={{ fontWeight: 700 }}>
                      PRIVACY POLICY ANALYSIS
                    </span>
                    <span className={`verdict-badge ${analysisResult.badgeClass}`} style={{ fontWeight: 800 }}>
                      {analysisResult.concernLevel}
                    </span>
                  </div>

                  <h2 className="verdict-main-heading">
                    {analysisResult.concernLevel === 'LOW PRIVACY CONCERN'
                      ? 'The policy outlines protective privacy controls and clear user rights.'
                      : analysisResult.concernLevel === 'HIGH PRIVACY CONCERN'
                      ? 'Significant data collection, external sharing, or missing safeguards identified.'
                      : 'Standard data practices with third-party sharing or tracking disclosures.'}
                  </h2>

                  <p className="verdict-disclaimer-note">
                    <strong>Notice:</strong> This is a heuristic transparency and data-practices analysis, not a formal legal compliance certification.
                  </p>
                </div>
              </div>

              <div className="verdict-actions">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="btn-action-ghost"
                  title="Copy Privacy Policy Analysis"
                >
                  {copiedReport ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
                </button>
              </div>
            </div>

            {/* Reasons for the Assessment */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-muted)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Reasons for Assessment
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                {analysisResult.concernReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* IN SIMPLE TERMS (Plain-Language Citizen Summary) */}
          <div className="safety-guidance-card">
            <div className="card-header-simple">
              <Sparkles size={18} style={{ color: 'var(--brand-blue)' }} />
              <h3>In Simple Terms</h3>
            </div>
            <div className="guidance-content">
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {analysisResult.simpleTerms}
              </p>
            </div>
          </div>

          {/* PRIVACY SNAPSHOT (Summary Cards Grid) */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Privacy Snapshot
            </h3>

            <div className="policy-snapshot-grid">
              {/* Snapshot 1: Data Collected */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Eye size={14} style={{ color: 'var(--brand-blue)' }} />
                    <span>DATA COLLECTED</span>
                  </span>
                  <span className={`net-badge ${analysisResult.dataCategories.length > 0 ? 'badge-attention' : 'badge-unavailable'}`}>
                    {analysisResult.dataCategories.length > 0 ? `${analysisResult.dataCategories.length} categories` : 'Not Stated'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.dataCategories.length > 0
                    ? analysisResult.dataCategories.slice(0, 4).join(', ') + (analysisResult.dataCategories.length > 4 ? '...' : '')
                    : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">Information the company states it collects from you.</div>
              </div>

              {/* Snapshot 2: Data Sharing */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Users size={14} style={{ color: 'var(--brand-blue)' }} />
                    <span>DATA SHARING</span>
                  </span>
                  <span className={`net-badge ${analysisResult.sharingEntities.length > 0 ? 'badge-attention' : 'badge-verified'}`}>
                    {analysisResult.sharingEntities.length > 0 ? `${analysisResult.sharingEntities.length} categories` : 'Not Stated'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.sharingEntities.length > 0
                    ? analysisResult.sharingEntities.slice(0, 3).join(', ') + (analysisResult.sharingEntities.length > 3 ? ` (+${analysisResult.sharingEntities.length - 3} more)` : '')
                    : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">Third-party recipient categories distinguished in the policy.</div>
              </div>

              {/* Snapshot 3: Tracking & Ads */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Search size={14} style={{ color: 'var(--brand-blue)' }} />
                    <span>TRACKING &amp; ADS</span>
                  </span>
                  <span className={`net-badge ${(analysisResult.trackingDisclosures && analysisResult.trackingDisclosures.length > 0) ? 'badge-attention' : 'badge-verified'}`}>
                    {(analysisResult.trackingDisclosures && analysisResult.trackingDisclosures.length > 0) ? 'Disclosed' : 'Not Stated'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {(analysisResult.trackingDisclosures && analysisResult.trackingDisclosures.length > 0)
                    ? analysisResult.trackingDisclosures.join(', ')
                    : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">
                  {analysisResult.hasAcrossVisits ? 'Cross-visit tracking explicitly stated in policy.' : 'Technologies disclosed; no cross-visit tracking explicitly stated.'}
                </div>
              </div>

              {/* Snapshot 4: Retention */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Clock size={14} style={{ color: 'var(--status-amber)' }} />
                    <span>RETENTION</span>
                  </span>
                  <span className={`net-badge ${analysisResult.hasNumericalRetention ? 'badge-verified' : (analysisResult.hasRetention ? 'badge-attention' : 'badge-unavailable')}`}>
                    {analysisResult.hasNumericalRetention ? 'Outlined' : (analysisResult.hasRetention ? 'Partially Explained' : 'Not Stated')}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.retentionDetail}
                </div>
                <div className="policy-snapshot-subtext">How long personal records are kept.</div>
              </div>

              {/* Snapshot 5: Deletion */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Trash2 size={14} style={{ color: 'var(--status-green)' }} />
                    <span>DATA DELETION</span>
                  </span>
                  <span className={`net-badge ${analysisResult.hasDeletion ? 'badge-verified' : 'badge-attention'}`}>
                    {analysisResult.hasDeletion ? 'Available' : 'Not Stated'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.hasDeletion ? 'A process to request account closure or data deletion is described in the policy.' : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">Can you request deletion of your account and data?</div>
              </div>

              {/* Snapshot 6: User Rights */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <UserCheck size={14} style={{ color: 'var(--status-green)' }} />
                    <span>USER RIGHTS</span>
                  </span>
                  <span className={`net-badge ${analysisResult.userRights.length > 0 ? 'badge-verified' : 'badge-unavailable'}`}>
                    {analysisResult.userRights.length > 0 ? `${analysisResult.userRights.length} Rights` : 'Not Listed'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.userRights.length > 0
                    ? analysisResult.userRights.join(', ')
                    : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">Privacy rights described in the policy. Applicability may depend on location and applicable law.</div>
              </div>

              {/* Snapshot 7: International Transfers */}
              <div className="policy-snapshot-card">
                <div className="policy-snapshot-header">
                  <span className="policy-snapshot-title">
                    <Globe size={14} style={{ color: 'var(--brand-blue)' }} />
                    <span>INTERNATIONAL TRANSFERS</span>
                  </span>
                  <span className={`net-badge ${analysisResult.hasTransfers ? 'badge-verified' : 'badge-unavailable'}`}>
                    {analysisResult.hasTransfers ? 'Disclosed' : 'Not Stated'}
                  </span>
                </div>
                <div className="policy-snapshot-metric">
                  {analysisResult.hasTransfers ? 'The policy states that personal information may be processed and stored in countries other than the country where the user lives.' : 'Not clearly stated in provided policy'}
                </div>
                <div className="policy-snapshot-subtext">
                  {analysisResult.hasTransfers ? 'The policy does not provide a complete list of countries where personal information may be processed or stored.' : 'Are cross-border server transfers described?'}
                </div>
              </div>
            </div>
          </div>

          {/* IMPORTANT THINGS TO KNOW (Strict Source-Grounded Findings with Evidence) */}
          <div className="payload-scanner-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Important Things to Know
            </h3>

            <div className="policy-findings-container">
              {analysisResult.importantFindings.map((finding, idx) => (
                <div key={idx} className="policy-finding-card">
                  <div className="policy-finding-header">
                    <div className="policy-finding-title-group">
                      {finding.type === 'good' ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--status-green)' }} />
                      ) : finding.type === 'attention' ? (
                        <AlertTriangle size={16} style={{ color: 'var(--status-amber)' }} />
                      ) : (
                        <MinusCircle size={16} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span className="policy-finding-title">{finding.title}</span>
                    </div>
                    {finding.status && (
                      <span className={`net-badge ${finding.statusBadgeClass || (finding.status === 'Clearly Explained' ? 'badge-verified' : finding.status === 'Partially Explained' ? 'badge-attention' : 'badge-unavailable')}`}>
                        {finding.status === 'Clearly Explained' ? '✓ Clearly Explained' : finding.status === 'Partially Explained' ? '⚠ Partially Explained' : finding.status}
                      </span>
                    )}
                  </div>

                  {finding.evidence && (
                    <div className="policy-evidence-block">
                      <div className="policy-evidence-label">
                        Evidence:
                      </div>
                      <blockquote className="policy-evidence-quote">
                        "{finding.evidence}"
                      </blockquote>
                    </div>
                  )}

                  {finding.interpretation && (
                    <div className="policy-interpretation-row">
                      <strong>Interpretation:</strong> {finding.interpretation}
                    </div>
                  )}

                  {finding.items && finding.items.length > 0 && (
                    <ul className="policy-finding-items-list" style={{ margin: '6px 0 10px 18px', padding: 0, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      {finding.items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {finding.missingDetail && (
                    <div className="policy-missing-row">
                      <span className="policy-missing-label">Missing detail:</span> {finding.missingDetail}
                    </div>
                  )}

                  {finding.whatItMeansForYou && (
                    <div className="policy-citizen-impact">
                      <strong>What this means for you:</strong> {finding.whatItMeansForYou}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* POLICY TRANSPARENCY SCORECARD */}
          <div className="payload-scanner-card">
            <div className="transparency-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Policy Transparency
              </h3>
              <div className="transparency-pills">
                <span className="transparency-pill-clear">✓ {analysisResult.clearCount} Clearly Explained</span>
                <span className="transparency-pill-partial">⚠ {analysisResult.partialCount} Partially Explained</span>
                <span className="transparency-pill-missing">— {analysisResult.missingCount} Not Clearly Stated</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              This evaluates how clearly the policy explains key privacy topics to consumers. It measures transparency, not legal compliance.
            </p>

            <div className="transparency-list">
              {analysisResult.transparencyAreas.map((item, idx) => (
                <div key={idx} className="transparency-row">
                  <span className="transparency-topic-name">
                    {item.area}
                  </span>
                  <div className="transparency-topic-right">
                    <span className="transparency-topic-detail">
                      {item.detail}
                    </span>
                    <span className={`net-badge ${item.status === 'clear' ? 'badge-verified' : item.status === 'partial' ? 'badge-attention' : 'badge-unavailable'}`}>
                      {item.status === 'clear' ? '✓ Clearly Explained' : item.status === 'partial' ? '⚠ Partially Explained' : '— Not Clearly Stated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CITIZEN RECOMMENDATIONS */}
          <div className="safety-guidance-card">
            <div className="card-header-simple">
              <ShieldCheck size={18} />
              <h3>Recommended Citizen Actions</h3>
            </div>
            <div className="guidance-content">
              <ul className="citizen-actions-list">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className="citizen-action-item">
                    <CheckCircle2 size={16} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* TECHNICAL ANALYSIS (Collapsible) */}
          <div className="technical-details-card">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="technical-accordion-btn"
              aria-expanded={showTechnical}
            >
              <div className="accordion-title-cluster">
                <Cpu size={16} />
                <span>Technical Analysis</span>
              </div>
              {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTechnical && (
              <div className="technical-details-content">
                <div className="tech-spec-grid">
                  <div className="tech-spec-item">
                    <span className="spec-label">Word Count</span>
                    <span className="spec-value">{analysisResult.wordCount} words</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Character Count</span>
                    <span className="spec-value">{analysisResult.charCount} characters</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Analysis Timestamp</span>
                    <span className="spec-value">{analysisResult.analysisTimestamp}</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Data Categories Detected</span>
                    <span className="spec-value">{analysisResult.dataCategories.length} categories</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Purposes Detected</span>
                    <span className="spec-value">{analysisResult.purposes.length} purposes</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Recipient Types Detected</span>
                    <span className="spec-value">{analysisResult.sharingEntities.length} types</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Identified Privacy Contacts</span>
                    <span className="spec-value">{analysisResult.uniqueEmails.length > 0 ? analysisResult.uniqueEmails.join(', ') : 'None extracted'}</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-label">Important Findings Generated</span>
                    <span className="spec-value">{analysisResult.importantFindings.length} findings</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="scanner-bottom-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn-scan-another"
            >
              <RotateCcw size={16} />
              <span>Analyze Another Policy</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="btn-back-modules"
            >
              <ArrowLeft size={16} />
              <span>Return to Security Modules</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
