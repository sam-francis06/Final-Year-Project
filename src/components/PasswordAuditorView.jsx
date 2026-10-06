import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  ListChecks,
  RotateCcw
} from 'lucide-react';

// Common dictionary bases & popular targeted passwords (for client-side heuristic inspection)
const COMMON_DICTIONARY_WORDS = [
  'password', 'passcode', 'admin', 'administrator', 'welcome', 'letmein',
  'monkey', 'dragon', 'master', 'sunshine', 'princess', 'football',
  'baseball', 'iloveyou', 'starwars', 'secret', 'login', 'computer',
  'summer', 'winter', 'autumn', 'spring', 'superman', 'batman',
  'default', 'access', 'qwerty', 'trustno1', 'shadow', 'hunter',
  'ranger', 'jessica', 'michael', 'jennifer', 'charlie', 'jordan',
  'coffee', 'cookie', 'orange', 'purple', 'golden', 'silver', 'wizard',
  'killer', 'whatever', 'freedom', 'ginger', 'hockey', 'soccer', 'tennis'
];

// Common keyboard rows for spatial sequence detection
const KEYBOARD_SEQUENCES = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
  '1234567890', '0987654321'
];

/**
 * 100% Client-side Password Auditor Heuristic Engine
 * Evaluates credentials in browser memory; zero network activity, zero storage.
 */
function auditPassword(pwd) {
  if (!pwd) return null;

  const length = pwd.length;
  const problems = [];
  const recommendations = [];
  const signals = [];

  // 1. Character Classes
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const classCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  // 2. Repetition & Dominance
  const charCounts = {};
  for (const c of pwd) {
    charCounts[c] = (charCounts[c] || 0) + 1;
  }
  const maxCharFreq = Math.max(...Object.values(charCounts));
  const dominanceRatio = maxCharFreq / length;
  const hasConsecutiveRepetition = /(.)\1{2,}/i.test(pwd);
  const hasExcessiveDominance = length >= 4 && dominanceRatio >= 0.45;

  if (hasExcessiveDominance || hasConsecutiveRepetition) {
    problems.push('Excessive character repetition or single-character dominance');
    signals.push(`Character repetition: highest frequency character accounts for ${Math.round(dominanceRatio * 100)}% of input`);
  }

  // 3. Sequential Characters (Forward and Backward, Alpha and Numeric)
  let hasSequentialAlpha = false;
  let hasSequentialNumeric = false;
  const lowerPwd = pwd.toLowerCase();

  for (let i = 0; i <= length - 3; i++) {
    const c1 = lowerPwd.charCodeAt(i);
    const c2 = lowerPwd.charCodeAt(i + 1);
    const c3 = lowerPwd.charCodeAt(i + 2);

    // Numeric sequence check
    if (c1 >= 48 && c1 <= 57 && c2 >= 48 && c2 <= 57 && c3 >= 48 && c3 <= 57) {
      if ((c2 - c1 === 1 && c3 - c2 === 1) || (c1 - c2 === 1 && c2 - c3 === 1)) {
        hasSequentialNumeric = true;
      }
    }

    // Alphabetical sequence check
    if (c1 >= 97 && c1 <= 122 && c2 >= 97 && c2 <= 122 && c3 >= 97 && c3 <= 122) {
      if ((c2 - c1 === 1 && c3 - c2 === 1) || (c1 - c2 === 1 && c2 - c3 === 1)) {
        hasSequentialAlpha = true;
      }
    }
  }

  if (hasSequentialNumeric) {
    problems.push('Sequential numeric pattern detected (e.g. 123, 456, 987)');
    signals.push('Sequential numbers found in sequence');
  }
  if (hasSequentialAlpha) {
    problems.push('Sequential alphabetical pattern detected (e.g. abc, def, cba)');
    signals.push('Sequential alphabetical run found');
  }

  // 4. Keyboard Walks
  let hasKeyboardWalk = false;
  for (const row of KEYBOARD_SEQUENCES) {
    for (let i = 0; i <= length - 3; i++) {
      const sub = lowerPwd.substring(i, i + 3);
      if (row.includes(sub)) {
        hasKeyboardWalk = true;
        break;
      }
    }
    if (hasKeyboardWalk) break;
  }

  if (hasKeyboardWalk) {
    problems.push('Keyboard walk pattern detected (e.g. qwerty, asdfgh)');
    signals.push('Consecutive keys on standard keyboard layout detected');
  }

  // 5. Common Dictionary Words & L33t Speak
  const l33tNormalized = lowerPwd
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't');

  let matchedCommonWord = '';
  for (const word of COMMON_DICTIONARY_WORDS) {
    if (lowerPwd.includes(word) || l33tNormalized.includes(word)) {
      matchedCommonWord = word;
      break;
    }
  }

  if (matchedCommonWord) {
    problems.push(`Common dictionary/password pattern detected ("${matchedCommonWord}")`);
    signals.push(`Matches targeted password wordlist entry: "${matchedCommonWord}"`);
  }

  // 6. Predictable Affix Formats
  const hasPredictableStructure =
    /^[A-Z][a-z]+[0-9]+[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]?$/.test(pwd) ||
    /^[a-z]+(1|123|202[0-9]|203[0-9])!*$/i.test(pwd);

  if (hasPredictableStructure && !problems.some(p => p.includes('Predictable'))) {
    problems.push('Predictable structural format (e.g. Capitalized word + simple numbers + symbol)');
    signals.push('Common password formula identified: [Word] + [Digits] + [Punctuation]');
  }

  // 7. Length Evaluation
  if (length < 8) {
    problems.push('Critically short length (fewer than 8 characters)');
    signals.push('Length below 8 characters: highly vulnerable to brute-force');
  } else if (length < 12) {
    signals.push('Length between 8 and 11 characters: meets basic minimums, but longer passphrases recommended');
  } else if (length >= 16) {
    signals.push('Excellent length: 16+ characters significantly expands search keyspace');
  }

  // 8. Entropy Calculation (for educational technical details)
  const poolSize =
    (hasLower ? 26 : 0) +
    (hasUpper ? 26 : 0) +
    (hasNumber ? 10 : 0) +
    (hasSymbol ? 33 : 0);

  const keyspaceEntropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  let shannonEntropyPerChar = 0;
  for (const count of Object.values(charCounts)) {
    const p = count / length;
    shannonEntropyPerChar -= p * Math.log2(p);
  }
  const totalShannonEntropy = Math.round(shannonEntropyPerChar * length);

  // 9. Multi-Signal Strength Score Formulation (0 to 100)
  let score = 0;

  // Length points
  if (length < 8) score += 8;
  else if (length < 12) score += 30;
  else if (length < 16) score += 55;
  else if (length < 20) score += 75;
  else score += 88;

  // Character class diversity
  if (classCount === 1) score += 4;
  else if (classCount === 2) score += 14;
  else if (classCount === 3) score += 24;
  else if (classCount === 4) score += 34;

  // Penalties
  if (hasExcessiveDominance) score -= 45;
  if (hasConsecutiveRepetition) score -= 15;
  if (/^\d+$/.test(pwd)) score -= 35; // numbers only
  if (/^[a-zA-Z]+$/.test(pwd)) score -= 18; // letters only
  if (hasSequentialNumeric) score -= 14;
  if (hasSequentialAlpha) score -= 14;
  if (hasKeyboardWalk) score -= 20;
  if (matchedCommonWord) score -= 28;
  if (hasPredictableStructure) score -= 14;

  score = Math.max(5, Math.min(100, score));

  // If critically short or pure repetition, cap score
  if (length < 8 || hasExcessiveDominance || (length <= 8 && /^\d+$/.test(pwd))) {
    score = Math.min(score, 25);
  }

  // 10. Classification into 5 Citizen-Friendly Tiers
  let strengthLabel = 'Very Weak';
  let strengthVerdict = 'VERY WEAK';
  let strengthClass = 'meter-very-weak';
  let summaryText = 'This password has critical security flaws and can be guessed rapidly by automated tools.';

  if (score >= 90 && length >= 14 && classCount >= 3 && !matchedCommonWord) {
    strengthLabel = 'Very Strong';
    strengthVerdict = 'VERY STRONG';
    strengthClass = 'meter-very-strong';
    summaryText = 'Your password exhibits high length, excellent character diversity, and zero predictable patterns.';
  } else if (score >= 70 && length >= 12 && !matchedCommonWord) {
    strengthLabel = 'Strong';
    strengthVerdict = 'STRONG PASSWORD';
    strengthClass = 'meter-strong';
    summaryText = 'Your password shows good length and character variety with few predictable indicators.';
  } else if (score >= 50) {
    strengthLabel = 'Fair';
    strengthVerdict = 'FAIR STRENGTH';
    strengthClass = 'meter-fair';
    summaryText = 'This password provides baseline resistance, but exhibits predictable elements or moderate length.';
  } else if (score >= 30) {
    strengthLabel = 'Weak';
    strengthVerdict = 'WEAK PASSWORD';
    strengthClass = 'meter-weak';
    summaryText = 'This password contains predictable patterns, sequential sequences, or insufficient length.';
  }

  // Recommendations Generation
  if (length < 14) {
    recommendations.push('Aim for 14 or more characters, or combine 3 to 4 random unrelated words into a passphrase.');
  }
  if (classCount < 3) {
    recommendations.push('Mix uppercase letters, lowercase letters, numbers, and symbols to maximize character diversity.');
  }
  if (matchedCommonWord || hasPredictableStructure) {
    recommendations.push('Avoid dictionary words, name substitutions, or standard formulas like "Word123!".');
  }
  if (hasSequentialNumeric || hasSequentialAlpha || hasKeyboardWalk) {
    recommendations.push('Avoid sequential runs (e.g. "123", "abc") and keyboard walks ("qwerty").');
  }
  recommendations.push('Use a unique password for each critical service and consider using a reputable password manager.');

  return {
    score,
    strengthLabel,
    strengthVerdict,
    strengthClass,
    summaryText,
    length,
    classCount,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    hasRepetition: hasConsecutiveRepetition || hasExcessiveDominance,
    hasSequential: hasSequentialAlpha || hasSequentialNumeric,
    hasKeyboardWalk,
    hasCommonPattern: Boolean(matchedCommonWord),
    hasPredictableStructure,
    keyspaceEntropy,
    totalShannonEntropy,
    poolSize,
    problems,
    recommendations,
    signals
  };
}

export default function PasswordAuditorView({ onBack }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleAnalyze = (e) => {
    if (e) e.preventDefault();
    const trimmed = passwordInput;
    if (!trimmed) {
      setValidationError('Please enter a password to audit.');
      setAuditResult(null);
      return;
    }
    setValidationError('');
    const result = auditPassword(trimmed);
    setAuditResult(result);
  };

  const handleClear = () => {
    setPasswordInput('');
    setAuditResult(null);
    setValidationError('');
    setShowTechnicalDetails(false);
  };

  const getStrengthBarWidth = (label) => {
    switch (label) {
      case 'Very Weak': return '20%';
      case 'Weak': return '40%';
      case 'Fair': return '60%';
      case 'Strong': return '80%';
      case 'Very Strong': return '100%';
      default: return '0%';
    }
  };

  const getStrengthColor = (label) => {
    switch (label) {
      case 'Very Weak': return '#cf222e';
      case 'Weak': return '#d97706';
      case 'Fair': return '#b45309';
      case 'Strong': return '#1f883d';
      case 'Very Strong': return '#059669';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="scanner-workspace">
      {/* Top Header / Breadcrumb navigation */}
      <div className="scanner-top-bar">
        <button type="button" onClick={onBack} className="btn-back-modules">
          <ArrowLeft size={16} />
          <span>Back to Security Modules</span>
        </button>
        <div className="scanner-module-tag">
          <KeyRound size={14} />
          <span>Local Password Security Auditor</span>
        </div>
      </div>

      {/* Main Password Input Card */}
      <div className="scanner-hero-card">
        <div className="scanner-hero-header">
          <div className="scanner-hero-icon" style={{ backgroundColor: 'rgba(9, 105, 218, 0.1)', color: 'var(--brand-blue)' }}>
            <KeyRound size={28} />
          </div>
          <div>
            <h2>Password Security Auditor</h2>
            <p>Evaluate credential resilience against dictionary bases, repetition, sequential runs, and pattern attacks.</p>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="auditor-privacy-notice" role="note" aria-label="Privacy Guarantee">
          <Lock size={15} className="privacy-lock-icon" />
          <div className="privacy-notice-text">
            <strong>100% In-Browser Analysis:</strong> Your password is analyzed locally in your browser and is not sent to CyberCouncil or any external service. CyberCouncil does not query external breach databases in this local audit.
          </div>
        </div>

        {/* Input Form */}
        <form className="password-auditor-form" onSubmit={handleAnalyze}>
          <div className="password-input-group">
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password-auditor-field"
                className="password-auditor-input"
                placeholder="Type or paste a candidate password to evaluate"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (validationError) setValidationError('');
                }}
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />
              <button
                type="button"
                className="btn-toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password characters' : 'Show password characters'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="password-action-buttons">
              <button
                type="submit"
                className="scanner-submit-btn"
                disabled={!passwordInput}
              >
                <KeyRound size={16} />
                <span>Analyze Password</span>
              </button>

              {passwordInput && (
                <button
                  type="button"
                  className="btn-clear-password"
                  onClick={handleClear}
                  title="Clear password from browser memory"
                >
                  <RotateCcw size={15} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {validationError && (
            <div className="auditor-validation-error" role="alert">
              <AlertTriangle size={15} />
              <span>{validationError}</span>
            </div>
          )}
        </form>
      </div>

      {/* Result Display Area */}
      {auditResult && (
        <div className="scanner-result-section">
          {/* Main Verdict Card */}
          <div className={`verdict-banner ${
            auditResult.strengthLabel === 'Very Weak' || auditResult.strengthLabel === 'Weak'
              ? 'verdict-box-danger'
              : auditResult.strengthLabel === 'Fair'
              ? 'verdict-box-amber'
              : 'verdict-box-safe'
          }`}>
            <div className="verdict-banner-header">
              <div className="verdict-icon-wrap" style={{ color: getStrengthColor(auditResult.strengthLabel) }}>
                {auditResult.strengthLabel === 'Very Strong' || auditResult.strengthLabel === 'Strong' ? (
                  <ShieldCheck size={38} />
                ) : auditResult.strengthLabel === 'Fair' ? (
                  <AlertTriangle size={38} />
                ) : (
                  <ShieldX size={38} />
                )}
              </div>

              <div className="verdict-text-block">
                <div className="verdict-title-row">
                  <span
                    className="verdict-pill"
                    style={{
                      backgroundColor: getStrengthColor(auditResult.strengthLabel),
                      color: '#ffffff'
                    }}
                  >
                    {auditResult.strengthVerdict}
                  </span>
                  <span className="verdict-domain-tag">
                    {auditResult.length} characters • {auditResult.classCount} of 4 character types
                  </span>
                </div>
                <p className="verdict-main-desc">{auditResult.summaryText}</p>
              </div>
            </div>

            {/* Visual Strength Meter Bar */}
            <div className="auditor-meter-wrapper">
              <div className="auditor-meter-labels">
                <span className="meter-label-title">Calculated Strength: <strong>{auditResult.strengthLabel}</strong></span>
                <span className="meter-label-score">Score: {auditResult.score}/100</span>
              </div>
              <div className="auditor-meter-track">
                <div
                  className={`auditor-meter-fill ${auditResult.strengthClass}`}
                  style={{ width: getStrengthBarWidth(auditResult.strengthLabel) }}
                />
              </div>
              <div className="auditor-meter-ticks">
                <span>Very Weak</span>
                <span>Weak</span>
                <span>Fair</span>
                <span>Strong</span>
                <span>Very Strong</span>
              </div>
            </div>

            {/* Checklist of Evaluated Criteria */}
            <div className="auditor-checklist-card">
              <div className="checklist-header">
                <ListChecks size={16} />
                <span>Security Assessment Checklist</span>
              </div>
              <div className="checklist-grid">
                {/* 1. Length */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {auditResult.length >= 12 ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Length ({auditResult.length} chars)</strong>
                    <span>{auditResult.length >= 16 ? 'Excellent (16+ chars)' : auditResult.length >= 12 ? 'Good (12+ chars)' : auditResult.length >= 8 ? 'Moderate (8-11 chars)' : 'Critically Short (<8 chars)'}</span>
                  </div>
                </div>

                {/* 2. Character Variety */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {auditResult.classCount >= 3 ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Character Diversity</strong>
                    <span>{auditResult.classCount === 4 ? 'All 4 classes present' : `${auditResult.classCount} of 4 classes active`}</span>
                  </div>
                </div>

                {/* 3. Repetition */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {!auditResult.hasRepetition ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Character Repetition</strong>
                    <span>{auditResult.hasRepetition ? 'Repetitive runs detected' : 'Low / normal distribution'}</span>
                  </div>
                </div>

                {/* 4. Sequential Patterns */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {!auditResult.hasSequential ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Sequential Patterns</strong>
                    <span>{auditResult.hasSequential ? 'Alpha/numeric run detected' : 'None detected'}</span>
                  </div>
                </div>

                {/* 5. Keyboard Walks */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {!auditResult.hasKeyboardWalk ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Keyboard Patterns</strong>
                    <span>{auditResult.hasKeyboardWalk ? 'QWERTY walk detected' : 'None detected'}</span>
                  </div>
                </div>

                {/* 6. Common Patterns */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {!auditResult.hasCommonPattern ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Dictionary Patterns</strong>
                    <span>{auditResult.hasCommonPattern ? 'Common base word found' : 'None detected in list'}</span>
                  </div>
                </div>

                {/* 7. Predictability */}
                <div className="checklist-item">
                  <div className="check-icon-col">
                    {!auditResult.hasPredictableStructure ? (
                      <CheckCircle2 size={16} className="icon-pass" />
                    ) : (
                      <XCircle size={16} className="icon-warn" />
                    )}
                  </div>
                  <div className="check-text-col">
                    <strong>Affix Predictability</strong>
                    <span>{auditResult.hasPredictableStructure ? 'Predictable formula identified' : 'Less predictable structure'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problems Detected Section */}
            {auditResult.problems.length > 0 && (
              <div className="auditor-problems-box">
                <div className="problems-title">
                  <ShieldAlert size={16} style={{ color: '#cf222e' }} />
                  <span>Problems Detected ({auditResult.problems.length})</span>
                </div>
                <ul className="problems-list">
                  {auditResult.problems.map((prob, idx) => (
                    <li key={idx}>{prob}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Collapsible Technical Details */}
            <div className="technical-details-toggle-row">
              <button
                type="button"
                className="btn-toggle-technical"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                <Cpu size={15} />
                <span>{showTechnicalDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
                {showTechnicalDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {showTechnicalDetails && (
              <div className="technical-details-drawer">
                <div className="verdict-diagnostics-grid">
                  <div className="diagnostic-item">
                    <span className="diag-label">Analysis Mode</span>
                    <span className="diag-value">
                      <span className="badge-secure"><Lock size={13} /> Local Browser Analysis</span>
                    </span>
                  </div>

                  <div className="diagnostic-item">
                    <span className="diag-label">Character Length</span>
                    <span className="diag-value">{auditResult.length} characters</span>
                  </div>

                  <div className="diagnostic-item">
                    <span className="diag-label">Active Character Types</span>
                    <span className="diag-value">
                      {[
                        auditResult.hasLower && 'Lowercase',
                        auditResult.hasUpper && 'Uppercase',
                        auditResult.hasNumber && 'Numbers',
                        auditResult.hasSymbol && 'Symbols'
                      ].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>

                  <div className="diagnostic-item">
                    <span className="diag-label">Keyspace Pool Size</span>
                    <span className="diag-value">{auditResult.poolSize} possible characters</span>
                  </div>

                  <div className="diagnostic-item">
                    <span className="diag-label">Estimated Keyspace Entropy</span>
                    <span className="diag-value">{auditResult.keyspaceEntropy} bits</span>
                  </div>

                  <div className="diagnostic-item">
                    <span className="diag-label">Estimated Shannon Entropy</span>
                    <span className="diag-value">{auditResult.totalShannonEntropy} bits</span>
                  </div>
                </div>

                <div className="entropy-explainer-note">
                  <Info size={14} />
                  <span>
                    <strong>Note on Entropy:</strong> Entropy provides a theoretical mathematical calculation of character randomness. Real-world credential resilience also depends on avoiding targeted dictionary words, known breach patterns, and predictable suffixes.
                  </span>
                </div>

                {auditResult.signals.length > 0 && (
                  <div className="verdict-signals-box" style={{ marginTop: '12px' }}>
                    <div className="signals-title">
                      <Info size={14} />
                      <span>Heuristic Signals Recorded</span>
                    </div>
                    <ul className="signals-list">
                      {auditResult.signals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actionable Recommendations Card */}
          <div className="scanner-guidance-card">
            <h3>Password Hygiene Recommendations</h3>
            <div className="guidance-grid">
              <div className="guidance-item">
                <div className="guidance-number">1</div>
                <div>
                  <strong>Favor length over complex substitutions</strong>
                  <p>A multi-word passphrase with 14+ characters (e.g. <code>river-guitar-purple-breeze</code>) is much harder to guess than a short password with symbols.</p>
                </div>
              </div>
              <div className="guidance-item">
                <div className="guidance-number">2</div>
                <div>
                  <strong>Never reuse passwords across accounts</strong>
                  <p>When a website is breached, automated credential stuffing tests that password on banking, email, and social accounts immediately.</p>
                </div>
              </div>
              <div className="guidance-item">
                <div className="guidance-number">3</div>
                <div>
                  <strong>Enable Multi-Factor Authentication (MFA)</strong>
                  <p>Two-step verification (authenticator apps or hardware keys) protects your account even if a password is inadvertently compromised.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
