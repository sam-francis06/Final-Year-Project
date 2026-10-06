import React, { useState, useMemo } from 'react';
import {
  Brain,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Coins,
  Lock,
  UserCheck,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Link2,
  Paperclip,
  EyeOff,
  UserX,
  Gift,
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react';

/**
 * CyberCouncil - Social Engineering Detector
 * 100% Client-Side Privacy-First Heuristic Analysis Engine
 * 
 * Strict Privacy Guarantees:
 * - Analyzed strictly in browser memory
 * - Never sent to backend or external APIs
 * - Never logged to console.log
 * - Never stored in localStorage / sessionStorage / cookies
 * - URLs in text are treated strictly as text and NEVER visited or fetched
 */

// Heuristic keyword & phrase dictionaries
const URGENCY_PATTERNS = [
  /\b(immediately|urgently|urgent|without delay|at once|right now|promptly|asap|a\.s\.a\.p)\b/i,
  /\b(act now|act fast|respond immediately|final notice|final warning|last warning|last chance)\b/i,
  /\b(immediate action required|deadline expires|limited time|time is running out)\b/i,
  /\b(within|in next|in)\s+(\d+|few|twenty[- ]four|forty[- ]eight|ten|10|24|48)\s*(minutes?|mins?|hours?|hrs?|days?)\b/i,
  /\b(today only|before midnight|account will be closed today|expires today)\b/i
];

const THREAT_PATTERNS = [
  /\b(account\s+(will be|is|has been)\s+(closed|suspended|blocked|terminated|disabled|deactivated|frozen|locked|deleted))\b/i,
  /\b(legal action|police action|court order|arrest warrant|lawsuit|penalty|penalties|prosecution|fine of|jail|imprisonment)\b/i,
  /\b(security breach|unauthorized access|compromised|suspicious activity detected|security alert|fraud detected)\b/i,
  /\b(loss of access|service disruption|permanent ban|disciplinary action)\b/i
];

const AUTHORITY_PATTERNS = [
  /\b(reserve bank of india|rbi|state bank|sbi|hdfc|icici|axis bank|punjab national bank|pnb|bank of baroda|canara bank|central bank|world bank|citibank|wells fargo|chase bank|bank)\b/i,
  /\b(income tax department|tax department|internal revenue|irs|customs department|ministry of finance|government of india|police department|cyber cell|cyber crime branch|cbi|fbi|interpol)\b/i,
  /\b(it support|help desk|technical support|system administrator|security operations|fraud division|hr department|human resources|management|executive office|director)\b/i,
  /\b(fedex|dhl|india post|blue dart|courier|delivery agent|amazon delivery|flipkart delivery|telecom department|trai|dot|microsoft support|google security|apple support|whatsapp team)\b/i
];

const CREDENTIAL_PATTERNS = [
  /\b(one[- ]time[- ]password|otp|one time password)\b/i,
  /\b(password|passcode|secret pin|atm pin|upi pin|security pin|login pin)\b/i,
  /\b(verification code|security code|auth code|authentication code|2fa code|mfa code|sms code)\b/i,
  /\b(login credentials|username and password|account credentials|sign-in details)\b/i,
  /\b(share your code|send your otp|forward the otp|verify your password|provide your pin)\b/i
];

const FINANCIAL_PATTERNS = [
  /\b(send money|transfer funds|bank transfer|wire transfer|remit payment|pay now|immediate payment)\b/i,
  /\b(upi|gpay|google pay|phonepe|paytm|bhim|qr code payment|pay via upi)\b/i,
  /\b(credit card number|debit card number|cvv|cvv2|card expiry|card details|bank details|banking details|bank account details|account details)\b/i,
  /\b(cryptocurrency|bitcoin|btc|usdt|ethereum|crypto wallet)\b/i,
  /\b(gift cards?|apple gift card|itunes card|amazon gift card|steam card|google play card)\b/i,
  /\b(processing fee|customs fee|clearance fee|registration fee|refundable deposit|advance fee)\b/i,
  /\b(pay to receive|pay fee to claim|refund fee)\b/i
];

const PERSONAL_INFO_PATTERNS = [
  /\b(aadhaar|aadhar|aadhaar number|pan card|pan number|permanent account number)\b/i,
  /\b(social security number|ssn|national identity|voter id|passport number|driving licen[cs]e)\b/i,
  /\b(date of birth|dob|mother'?s maiden name)\b/i,
  /\b(home address|residential address|identity documents|upload id proof|send kyc documents|kyc update)\b/i,
  /\b(bank account number|ifsc code|routing number)\b/i
];

const SECRECY_PATTERNS = [
  /\b(don'?t tell anyone|do not tell anyone|keep this (a )?secret|keep this confidential|strictly confidential)\b/i,
  /\b(keep this between us|between you and me|private matter|off the record)\b/i,
  /\b(do not (call|contact) (the )?(bank|support|police|family|colleagues|manager|office))\b/i,
  /\b(do not inform anyone|tell no one|act in secret|keep quiet about this)\b/i
];

const REWARD_PATTERNS = [
  /\b(congratulations|congrats|you have been selected|you'?ve won|lucky winner)\b/i,
  /\b(lottery|jackpot|prize money|cash prize|unclaimed prize|free gift|won a car|won a phone)\b/i,
  /\b(cashback of|cash reward|bonus credits|free bitcoin|airdrop)\b/i,
  /\b(guaranteed (returns?|profit|income)|risk[- ]free investment|double your money|investment scheme|earn rs\.?\s*\d+ daily)\b/i,
  /\b(inheritance|unclaimed funds|beneficiary of)\b/i
];

const IMPERSONATION_PATTERNS = [
  /\b(i am|this is)\s+(from your bank|the police|it support|your manager|the ceo|the principal|customer support|an officer)\b/i,
  /\b(speaking on behalf of|writing to you from the (security|fraud|legal|management) team)\b/i,
  /\b(this is officer|i am detective|this is inspector)\b/i
];

const ACTION_PATTERNS = [
  /\b(click (the|this)?\s*(link|here|below)|tap (the|this)?\s*(link|here|below)|visit the link|open the link)\b/i,
  /\b(download (the|this)?\s*(file|app|attachment|software|tool)|install (the|this)?\s*(app|application|software|apk))\b/i,
  /\b(call (us|now|immediately)?\s*(at|on)?\s*(\+?\d[\d -]{7,}|this number))\b/i,
  /\b(reply (with|back)|send (us|me)?\s*(a screenshot|your details|the code)|forward (this|the) (message|sms|code))\b/i,
  /\b(scan (the|this)?\s*qr code)\b/i
];

const ATTACHMENT_PATTERNS = [
  /\b(attached (file|invoice|document|receipt|photo|pdf|statement)|see attached|review attachment)\b/i,
  /\b(open (the )?attachment|download (the )?document|view attached)\b/i,
  /\b(enable macros|enable editing|enable content|run executable|\.exe|\.scr|\.bat|\.vbs|\.zip|\.apk)\b/i
];

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|io|co|in|xyz|top|info|biz|ru|cn|tk|ga|cf|gq|club|online|site|live|app|page)[^\s<>"'{}|\\^`]*/gi;

/**
 * Multi-Signal Heuristic Analysis Function
 * Evaluates message locally with zero network calls and zero persistence.
 */
function analyzeMessageHeuristics(rawText, messageType) {
  if (!rawText || !rawText.trim()) return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Basic counters
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Extract URLs as plain text without opening
  const matchedUrls = text.match(URL_REGEX) || [];
  const uniqueUrls = Array.from(new Set(matchedUrls));

  // Match helper
  const findMatches = (patterns) => {
    const hits = [];
    for (const pat of patterns) {
      const match = text.match(pat);
      if (match) {
        hits.push(match[0]);
      }
    }
    return hits;
  };

  const urgencyMatches = findMatches(URGENCY_PATTERNS);
  const threatMatches = findMatches(THREAT_PATTERNS);
  const authorityMatches = findMatches(AUTHORITY_PATTERNS);
  const credentialMatches = findMatches(CREDENTIAL_PATTERNS);
  const financialMatches = findMatches(FINANCIAL_PATTERNS);
  const personalInfoMatches = findMatches(PERSONAL_INFO_PATTERNS);
  const secrecyMatches = findMatches(SECRECY_PATTERNS);
  const rewardMatches = findMatches(REWARD_PATTERNS);
  const impersonationMatches = findMatches(IMPERSONATION_PATTERNS);
  const actionMatches = findMatches(ACTION_PATTERNS);
  const attachmentMatches = findMatches(ATTACHMENT_PATTERNS);

  const signals = [];
  let score = 0;

  // 1. Urgency
  if (urgencyMatches.length > 0) {
    score += 15;
    signals.push({
      id: 'urgency',
      title: 'Manufactured Urgency',
      severity: 'high',
      icon: Clock,
      description: 'Pressures the recipient with short deadlines or rapid action requirements to short-circuit critical evaluation.',
      snippets: urgencyMatches.slice(0, 3)
    });
  }

  // 2. Fear / Threat
  if (threatMatches.length > 0) {
    score += 20;
    signals.push({
      id: 'threat',
      title: 'Account Threat or Penalty Warning',
      severity: 'high',
      icon: AlertTriangle,
      description: 'Threatens service suspension, legal penalties, or security breaches to provoke fear and compliance.',
      snippets: threatMatches.slice(0, 3)
    });
  }

  // 3. Authority Impersonation
  if (authorityMatches.length > 0) {
    // Authority mention alone is low context (5 pts); dangerous when paired with requests
    score += 6;
    signals.push({
      id: 'authority',
      title: 'Authority Claim Detected',
      severity: 'info',
      icon: UserCheck,
      description: 'Claims affiliation with recognized institutions, banks, government bodies, or technical support teams.',
      snippets: authorityMatches.slice(0, 3)
    });
  }

  // 4. Credential Request (Critical Red Flag)
  if (credentialMatches.length > 0) {
    score += 35;
    signals.push({
      id: 'credential',
      title: 'Credential or Security Code Request',
      severity: 'critical',
      icon: KeyRound,
      description: 'Requests OTPs, passwords, PINs, or verification codes. Legitimate service providers never ask customers to share OTPs.',
      snippets: credentialMatches.slice(0, 3)
    });
  }

  // 5. Payment / Financial Request
  if (financialMatches.length > 0) {
    score += 30;
    signals.push({
      id: 'financial',
      title: 'Financial or Payment Solicitation',
      severity: 'critical',
      icon: Coins,
      description: 'Requests direct money transfers, UPI payments, card CVVs, or non-reversible payment methods like gift cards.',
      snippets: financialMatches.slice(0, 3)
    });
  }

  // 6. Personal Information Request
  if (personalInfoMatches.length > 0) {
    score += 15;
    signals.push({
      id: 'personal_info',
      title: 'Sensitive Personal Data Request',
      severity: 'medium',
      icon: UserX,
      description: 'Solicits Aadhaar, PAN, birth dates, or identity proofs that can facilitate identity theft or unauthorized account access.',
      snippets: personalInfoMatches.slice(0, 3)
    });
  }

  // 7. Secrecy / Isolation
  if (secrecyMatches.length > 0) {
    score += 25;
    signals.push({
      id: 'secrecy',
      title: 'Secrecy & Isolation Tactic',
      severity: 'critical',
      icon: EyeOff,
      description: 'Demands confidentiality or instructs recipient not to contact official support, colleagues, or family members.',
      snippets: secrecyMatches.slice(0, 3)
    });
  }

  // 8. Reward / Prize / Too-Good-To-Be-True
  if (rewardMatches.length > 0) {
    score += 20;
    signals.push({
      id: 'reward',
      title: 'Reward, Lottery or Unearned Gain',
      severity: 'high',
      icon: Gift,
      description: 'Dangles unexpected lottery winnings, prizes, or risk-free investment returns to manipulate emotional excitement.',
      snippets: rewardMatches.slice(0, 3)
    });
  }

  // 9. First-Person Impersonation
  if (impersonationMatches.length > 0) {
    score += 10;
    signals.push({
      id: 'impersonation',
      title: 'First-Person Identity Assertion',
      severity: 'medium',
      icon: UserCheck,
      description: 'Directly asserts identity as an authority figure, executive manager, or law enforcement officer.',
      snippets: impersonationMatches.slice(0, 3)
    });
  }

  // 10. Directive Action Request
  if (actionMatches.length > 0) {
    score += 12;
    signals.push({
      id: 'action',
      title: 'Directive Action Solicitation',
      severity: 'medium',
      icon: Zap,
      description: 'Instructs the recipient to tap a link, dial an unverified phone number, download software, or reply with private data.',
      snippets: actionMatches.slice(0, 3)
    });
  }

  // 11. Suspicious URL Presence
  if (uniqueUrls.length > 0) {
    score += 10;
    signals.push({
      id: 'url_detected',
      title: 'Embedded URL Detected',
      severity: 'info',
      icon: Link2,
      description: 'Message contains one or more web addresses. CyberCouncil has not visited this link. Inspect it separately using the Phishing Scanner.',
      snippets: uniqueUrls.slice(0, 3)
    });
  }

  // 12. Attachment References
  if (attachmentMatches.length > 0) {
    score += 15;
    signals.push({
      id: 'attachment',
      title: 'Attachment or File Execution Reference',
      severity: 'medium',
      icon: Paperclip,
      description: 'Directs the recipient to open an attached file or execute software, which serves as a common malware distribution vector.',
      snippets: attachmentMatches.slice(0, 3)
    });
  }

  // 13. Compound Manipulation Pressure Matrix
  const hasUrgency = urgencyMatches.length > 0;
  const hasThreat = threatMatches.length > 0;
  const hasAuthority = authorityMatches.length > 0;
  const hasCredential = credentialMatches.length > 0;
  const hasFinancial = financialMatches.length > 0;
  const hasSecrecy = secrecyMatches.length > 0;
  const hasReward = rewardMatches.length > 0;

  let compoundCount = 0;
  const compoundDetails = [];

  if (hasAuthority && hasCredential) {
    score += 30;
    compoundCount++;
    compoundDetails.push('Authority Claim + OTP/Credential Request');
  }
  if (hasAuthority && hasFinancial) {
    score += 30;
    compoundCount++;
    compoundDetails.push('Authority Claim + Financial Solicitation');
  }
  if (hasUrgency && hasThreat) {
    score += 20;
    compoundCount++;
    compoundDetails.push('Manufactured Urgency + Threat of Loss');
  }
  if (hasUrgency && hasCredential) {
    score += 25;
    compoundCount++;
    compoundDetails.push('Urgency + OTP/Security Code Request');
  }
  if (hasReward && (hasFinancial || personalInfoMatches.length > 0)) {
    score += 25;
    compoundCount++;
    compoundDetails.push('Reward / Prize + Financial/Identity Solicitation');
  }
  if (hasSecrecy && (hasFinancial || hasCredential || hasAuthority)) {
    score += 30;
    compoundCount++;
    compoundDetails.push('Secrecy Demand + Financial/Authority Context');
  }

  if (compoundCount > 0) {
    signals.push({
      id: 'compound_pressure',
      title: 'Compound Manipulation Pressure',
      severity: 'critical',
      icon: Sparkles,
      description: 'Multiple psychological manipulation tactics intersect simultaneously, creating elevated pressure to deceive.',
      snippets: compoundDetails
    });
  }

  // Benign message check:
  // If the message has no urgency, no threat, no credential request, no financial request, no secrecy, no reward,
  // and simply contains benign context (e.g. "Your account security settings were updated. Please open the official app to review them.")
  if (!hasUrgency && !hasThreat && !hasCredential && !hasFinancial && !hasSecrecy && !hasReward && uniqueUrls.length === 0) {
    // Keep score capped low
    score = Math.min(score, 18);
  }

  // Bound score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level & Assessment Text
  let riskLevel = 'Low Risk';
  let riskAssessment = 'No significant social-engineering manipulation patterns detected.';
  let riskVariant = 'success';

  if (finalScore >= 75) {
    riskLevel = 'Critical Risk';
    riskAssessment = 'Critical social-engineering indicators detected: combination of intense pressure, authority claims, and credential or financial requests.';
    riskVariant = 'danger';
  } else if (finalScore >= 50) {
    riskLevel = 'High Risk';
    riskAssessment = 'Multiple social-engineering indicators detected. High probability of manipulative or deceptive intent.';
    riskVariant = 'danger';
  } else if (finalScore >= 25) {
    riskLevel = 'Moderate Risk';
    riskAssessment = 'Some persuasive or contextual indicators detected. Exercise caution and verify through independent official channels.';
    riskVariant = 'warning';
  }

  // Generate tailored defensive recommendations
  const recommendations = [];

  if (hasCredential) {
    recommendations.push('Do not share OTPs, passwords, PINs, or security codes under any circumstances.');
  }
  if (hasFinancial) {
    recommendations.push('Do not send money, UPI transfers, or purchase gift cards based solely on this message.');
  }
  if (hasAuthority) {
    recommendations.push('Verify the sender through an official phone number or website, never through contacts provided inside this message.');
  }
  if (hasUrgency || hasThreat) {
    recommendations.push('Slow down. Attackers create manufactured urgency to induce panic and prevent rational verification.');
  }
  if (hasSecrecy) {
    recommendations.push('Consult a trusted family member, colleague, or official support. Demands for secrecy are hallmark scam indicators.');
  }
  if (uniqueUrls.length > 0) {
    recommendations.push('The message contains a URL. CyberCouncil has not visited or verified it. Inspect it separately using the Phishing Scanner.');
  }
  if (attachmentMatches.length > 0) {
    recommendations.push('Do not open unexpected attachments or enable macros; inspect the file in CyberCouncil\'s Payload Scanner first.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue practicing standard digital vigilance when reading unsolicited messages.');
    recommendations.push('Confirm unexpected notifications directly inside the relevant service\'s official mobile application.');
  }

  return {
    charCount,
    wordCount,
    messageType: messageType || 'Unspecified',
    urls: uniqueUrls,
    score: finalScore,
    riskLevel,
    riskAssessment,
    riskVariant,
    signals,
    recommendations,
    indicators: {
      urgency: urgencyMatches.length > 0,
      threat: threatMatches.length > 0,
      authority: authorityMatches.length > 0,
      credential: credentialMatches.length > 0,
      financial: financialMatches.length > 0,
      personalInfo: personalInfoMatches.length > 0,
      secrecy: secrecyMatches.length > 0,
      reward: rewardMatches.length > 0,
      impersonation: impersonationMatches.length > 0,
      action: actionMatches.length > 0,
      attachment: attachmentMatches.length > 0,
      urlPresent: uniqueUrls.length > 0
    }
  };
}

// Preset samples for quick testing (matches required test cases)
const TEST_SAMPLES = [
  {
    label: 'Bank OTP Scam (Test 1)',
    type: 'SMS',
    text: 'Your bank account will be closed today. Send your OTP immediately to verify your account.'
  },
  {
    label: 'Lottery Prize Lure (Test 2)',
    type: 'SMS',
    text: 'Congratulations! You have won a prize. Send your bank details to receive your reward.'
  },
  {
    label: 'Appointment Notice (Test 3)',
    type: 'SMS',
    text: 'Hi, your appointment is confirmed for tomorrow at 10 AM.'
  },
  {
    label: 'Executive Gift Card (Test 4)',
    type: 'Chat / Social Media',
    text: 'Don\'t tell anyone. Your manager needs you to purchase gift cards immediately.'
  },
  {
    label: 'Benign Security Notice (Test 5)',
    type: 'Email',
    text: 'Your account security settings were updated. Please open the official app to review them.'
  },
  {
    label: 'URL Message (Test 6)',
    type: 'SMS',
    text: 'Action required: Review your pending invoice at https://example.com before your account is suspended.'
  }
];

export default function SocialEngineeringDetectorView({ onBack }) {
  const [inputText, setInputText] = useState('');
  const [messageType, setMessageType] = useState('SMS');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isTechOpen, setIsTechOpen] = useState(false);

  // Live counters
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleAnalyze = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const result = analyzeMessageHeuristics(inputText, messageType);
    setAnalysisResult(result);
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
    setIsTechOpen(false);
  };

  const handleApplySample = (sample) => {
    setInputText(sample.text);
    setMessageType(sample.type);
    const result = analyzeMessageHeuristics(sample.text, sample.type);
    setAnalysisResult(result);
  };

  return (
    <div className="social-detector-workspace">
      {/* Top Breadcrumb & Return to Modules Navigation */}
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
        <span className="current-module-badge">Social Engineering Detector</span>
      </div>

      {/* Hero Header Card */}
      <section className="scanner-hero-card">
        <div className="scanner-hero-content">
          <div className="scanner-badge-row">
            <span className="scanner-title-pill">
              <Brain size={14} />
              <span>Behavioral Heuristics</span>
            </span>
            <span className="scanner-version-pill">Local Browser Engine</span>
          </div>

          <h1 className="scanner-title">Social Engineering Pattern Detector</h1>
          <p className="scanner-subtitle">
            Inspect suspicious SMS messages, fraudulent emails, and social media requests for manipulative urgency, authority impersonation, credential solicitation, and psychological coercion.
          </p>

          {/* Privacy Assurance Banner */}
          <div className="privacy-assurance-box" role="status">
            <ShieldCheck size={18} className="privacy-icon" />
            <div className="privacy-text">
              <strong>Zero External Transmission:</strong> Your message is analyzed locally in your browser and is not sent to CyberCouncil or any external service. URLs inside the message are treated strictly as plain text and are never opened or fetched.
            </div>
          </div>
        </div>
      </section>

      {/* Message Input Workspace */}
      <section className="social-input-section">
        <form onSubmit={handleAnalyze} className="social-form-card">
          <div className="social-form-header">
            <div className="form-title-group">
              <label htmlFor="suspiciousMessageInput" className="social-input-label">
                Suspicious Message Content
              </label>
              <span className="social-input-hint">Paste message text received via SMS, email, or chat application</span>
            </div>

            {/* Message Type Selector */}
            <div className="message-type-wrapper">
              <label htmlFor="messageTypeSelect" className="type-select-label">Message Type:</label>
              <select
                id="messageTypeSelect"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="message-type-dropdown"
              >
                <option value="SMS">SMS / Text Message</option>
                <option value="Email">Email Communication</option>
                <option value="Chat / Social Media">Chat / Social Media</option>
                <option value="Other">Other Communication</option>
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div className="textarea-container">
            <textarea
              id="suspiciousMessageInput"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the suspicious message here..."
              className="social-textarea"
              aria-label="Paste the suspicious message here"
            />
            <div className="textarea-footer">
              <span className="char-counter">
                {charCount} characters | {wordCount} words
              </span>
              <span className="privacy-tag">
                <Lock size={12} /> Local Memory Only
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="social-action-row">
            <div className="action-buttons-group">
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn-analyze-social"
              >
                <Brain size={17} />
                <span>Analyze Message</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={!inputText && !analysisResult}
                className="btn-clear-social"
              >
                <RotateCcw size={16} />
                <span>Clear</span>
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="quick-samples-wrapper">
              <span className="quick-samples-label">Test Samples:</span>
              <div className="quick-samples-pills">
                {TEST_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(sample)}
                    className="sample-pill-btn"
                    title={sample.text}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Analysis Results Display */}
      {analysisResult && (
        <section className="social-results-section" aria-live="polite">
          {/* Prominent Risk Level Card */}
          <div className={`risk-banner-card risk-${analysisResult.riskVariant}`}>
            <div className="risk-banner-header">
              <div className="risk-badge-cluster">
                {analysisResult.riskVariant === 'danger' ? (
                  <ShieldAlert size={28} className="risk-banner-icon" />
                ) : analysisResult.riskVariant === 'warning' ? (
                  <AlertTriangle size={28} className="risk-banner-icon" />
                ) : (
                  <ShieldCheck size={28} className="risk-banner-icon" />
                )}
                <div>
                  <div className="risk-level-badge">{analysisResult.riskLevel}</div>
                  <span className="risk-score-subtitle">Heuristic Confidence: {analysisResult.score}/100</span>
                </div>
              </div>

              <div className="risk-meter-container">
                <div className="risk-meter-bar">
                  <div
                    className="risk-meter-fill"
                    style={{ width: `${Math.max(8, analysisResult.score)}%` }}
                  />
                </div>
                <div className="risk-meter-labels">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            <p className="risk-assessment-statement">
              {analysisResult.riskAssessment}
            </p>
          </div>

          {/* Detected Signals Grid */}
          <div className="detected-signals-block">
            <div className="signals-header-row">
              <h3 className="section-subheading">
                <AlertTriangle size={18} />
                <span>Detected Manipulation Signals ({analysisResult.signals.length})</span>
              </h3>
              <span className="signals-disclaimer">Signals reflect behavioral patterns, not infallible verdicts</span>
            </div>

            {analysisResult.signals.length === 0 ? (
              <div className="no-signals-card">
                <CheckCircle2 size={24} className="clean-signal-icon" />
                <div>
                  <h4>No Suspicious Social-Engineering Patterns Detected</h4>
                  <p>The message text does not exhibit common urgency triggers, credential requests, or psychological manipulation tactics.</p>
                </div>
              </div>
            ) : (
              <div className="signals-grid">
                {analysisResult.signals.map((sig) => {
                  const SigIcon = sig.icon || AlertTriangle;
                  return (
                    <div key={sig.id} className={`signal-card severity-${sig.severity}`}>
                      <div className="signal-card-top">
                        <div className="signal-icon-wrapper">
                          <SigIcon size={18} />
                        </div>
                        <h4 className="signal-title">{sig.title}</h4>
                        <span className={`signal-severity-tag tag-${sig.severity}`}>
                          {sig.severity}
                        </span>
                      </div>

                      <p className="signal-description">{sig.description}</p>

                      {sig.snippets && sig.snippets.length > 0 && (
                        <div className="signal-snippets-box">
                          <span className="snippets-label">Matched trigger phrase:</span>
                          <div className="snippets-list">
                            {sig.snippets.map((snip, sIdx) => (
                              <code key={sIdx} className="trigger-snippet">{snip}</code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actionable Defensive Recommendations */}
          <div className="recommendations-block">
            <h3 className="section-subheading">
              <ShieldCheck size={18} />
              <span>Recommended Citizen Actions</span>
            </h3>
            <div className="recommendations-card">
              <ul className="recommendations-list">
                {analysisResult.recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="recommendation-item">
                    <CheckCircle2 size={16} className="rec-check-icon" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Collapsible Technical Analysis */}
          <div className="technical-details-container">
            <button
              type="button"
              onClick={() => setIsTechOpen(!isTechOpen)}
              className="technical-toggle-btn"
              aria-expanded={isTechOpen}
            >
              <div className="toggle-btn-left">
                <FileText size={16} />
                <span>Technical Telemetry & Heuristic Breakdown</span>
              </div>
              {isTechOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isTechOpen && (
              <div className="technical-content-panel">
                <div className="tech-metrics-grid">
                  <div className="tech-metric-card">
                    <span className="tech-label">Communication Medium</span>
                    <span className="tech-value">{analysisResult.messageType}</span>
                  </div>
                  <div className="tech-metric-card">
                    <span className="tech-label">Character / Word Volume</span>
                    <span className="tech-value">{analysisResult.charCount} chars ({analysisResult.wordCount} words)</span>
                  </div>
                  <div className="tech-metric-card">
                    <span className="tech-label">URLs Embedded</span>
                    <span className="tech-value">{analysisResult.urls.length} link(s)</span>
                  </div>
                  <div className="tech-metric-card">
                    <span className="tech-label">Execution Architecture</span>
                    <span className="tech-value" style={{ color: 'var(--status-green)' }}>Local Sandbox (Zero Egress)</span>
                  </div>
                </div>

                {/* URL Safety Note */}
                {analysisResult.urls.length > 0 && (
                  <div className="url-notice-box">
                    <Info size={16} className="url-notice-icon" />
                    <div>
                      <strong>Contained URLs:</strong>
                      <div className="plain-urls-list">
                        {analysisResult.urls.map((u, uIdx) => (
                          <span key={uIdx} className="plain-url-text">{u}</span>
                        ))}
                      </div>
                      <span className="url-inspection-advice">
                        CyberCouncil treats these URLs strictly as text and has not visited or fetched them. To evaluate link safety without risking compromise, please open the <strong>Phishing & Domain Scanner</strong> module separately.
                      </span>
                    </div>
                  </div>
                )}

                {/* Category Indicator Checklist */}
                <div className="indicator-checklist-card">
                  <h4 className="checklist-heading">Evaluated Threat Vector Checklist:</h4>
                  <div className="checklist-grid">
                    <div className={`check-item ${analysisResult.indicators.urgency ? 'triggered' : ''}`}>
                      {analysisResult.indicators.urgency ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Urgency Indicators: {analysisResult.indicators.urgency ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.threat ? 'triggered' : ''}`}>
                      {analysisResult.indicators.threat ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Account Threat / Loss: {analysisResult.indicators.threat ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.authority ? 'triggered' : ''}`}>
                      {analysisResult.indicators.authority ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Authority Impersonation: {analysisResult.indicators.authority ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.credential ? 'triggered' : ''}`}>
                      {analysisResult.indicators.credential ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Credential / OTP Request: {analysisResult.indicators.credential ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.financial ? 'triggered' : ''}`}>
                      {analysisResult.indicators.financial ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Payment / Financial Request: {analysisResult.indicators.financial ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.personalInfo ? 'triggered' : ''}`}>
                      {analysisResult.indicators.personalInfo ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Personal Information Solicitation: {analysisResult.indicators.personalInfo ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.secrecy ? 'triggered' : ''}`}>
                      {analysisResult.indicators.secrecy ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Secrecy / Isolation Mandate: {analysisResult.indicators.secrecy ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.reward ? 'triggered' : ''}`}>
                      {analysisResult.indicators.reward ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Reward / Lottery Lure: {analysisResult.indicators.reward ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.attachment ? 'triggered' : ''}`}>
                      {analysisResult.indicators.attachment ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>Attachment / Macro Reference: {analysisResult.indicators.attachment ? 'Triggered' : 'None'}</span>
                    </div>
                    <div className={`check-item ${analysisResult.indicators.urlPresent ? 'triggered' : ''}`}>
                      {analysisResult.indicators.urlPresent ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>URL Presence: {analysisResult.indicators.urlPresent ? 'Present (Text Only)' : 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Permanent Educational Guidance Section */}
      <section className="social-education-section">
        <div className="education-header">
          <Brain size={20} className="edu-icon" />
          <h2 className="edu-title">How Social Engineering Works</h2>
        </div>
        <p className="edu-lead">
          Social engineering attacks rely on manipulating human psychology rather than exploiting technical software bugs. Attackers exploit trust, curiosity, empathy, and fear to convince victims to bypass their own security precautions.
        </p>

        <div className="edu-tactics-grid">
          <div className="tactic-card">
            <div className="tactic-icon-box">
              <Clock size={18} />
            </div>
            <h4>Manufactured Urgency</h4>
            <p>Attackers impose immediate deadlines ("act in 10 minutes", "account closes today") to induce panic and prevent you from consulting others.</p>
          </div>

          <div className="tactic-card">
            <div className="tactic-icon-box">
              <UserCheck size={18} />
            </div>
            <h4>Authority Impersonation</h4>
            <p>Perpetrators pose as bank managers, police officers, tax inspectors, or IT support personnel to exploit natural tendencies to comply with authority.</p>
          </div>

          <div className="tactic-card">
            <div className="tactic-icon-box">
              <Gift size={18} />
            </div>
            <h4>Greed & Unearned Rewards</h4>
            <p>Lotteries, unearned cashbacks, and fake investments tempt victims into parting with sensitive banking numbers or paying advance "clearance fees".</p>
          </div>

          <div className="tactic-card">
            <div className="tactic-icon-box">
              <EyeOff size={18} />
            </div>
            <h4>Secrecy & Isolation</h4>
            <p>Directives to "keep this confidential" or "not discuss this with family or branch staff" exist specifically to cut off second opinions that would reveal the scam.</p>
          </div>
        </div>

        <div className="edu-footer-disclaimer">
          <Info size={15} />
          <span>
            <strong>Defensive Rule:</strong> This heuristic risk detector evaluates common patterns for educational awareness and defensive guidance. It is not an absolute guarantee of legitimacy or fraud. When in doubt, contact the organization directly using known, verified contact channels.
          </span>
        </div>
      </section>
    </div>
  );
}

export { analyzeMessageHeuristics };
