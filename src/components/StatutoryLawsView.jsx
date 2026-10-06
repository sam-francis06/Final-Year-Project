import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  Info,
  ExternalLink,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Globe,
  Gavel,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { LAW_CATEGORIES, IT_ACT_SECTIONS } from '../data/cyberLawsData';
import '../styles/statutory-laws.css';

export default function StatutoryLawsView({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSection, setSelectedSection] = useState(null);

  // Filter sections based on search query and category
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return IT_ACT_SECTIONS.filter(sec => {
      const matchesCategory = selectedCategory === 'all' || sec.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const secNum = sec.section.toLowerCase();
      const title = sec.title.toLowerCase();
      const expl = sec.citizenExplanation.toLowerCase();
      const covers = sec.covers.toLowerCase();
      const penalty = sec.penalty.toLowerCase();
      const scenario = (sec.exampleScenario || '').toLowerCase();
      const relatedCat = (sec.relatedIncidentCategory || '').toLowerCase();

      return (
        secNum.includes(q) ||
        title.includes(q) ||
        expl.includes(q) ||
        covers.includes(q) ||
        penalty.includes(q) ||
        scenario.includes(q) ||
        relatedCat.includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="statutory-laws-container">
      {/* Header & Title Panel */}
      <div className="sl-header-panel">
        <div className="sl-header-top">
          <div className="sl-title-area">
            <h1>
              <Scale size={24} style={{ color: 'var(--brand-blue)' }} />
              Statutory Laws & Cyber Law Reference
            </h1>
            <p>
              Authoritative, plain-language compendium of the Information Technology Act, 2000 provisions, statutory penalties, and operative legal status.
            </p>
          </div>

          <div className="sl-header-actions">
            {onBack && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onBack}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Return to Modules
              </button>
            )}
            <a
              href="/incident-logs.html"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <FileText size={16} />
              <span>Report Cyber Incident</span>
            </a>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer Banner */}
        <div className="sl-disclaimer-banner">
          <Info size={20} className="sl-disclaimer-icon" />
          <div>
            <strong>Legal Information Notice:</strong> This page provides general legal information and is not legal advice. For authoritative interpretation, refer to the official legislation and qualified legal professionals.
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Strip */}
      <div className="sl-controls-card">
        <div className="sl-search-row">
          <div className="sl-search-wrapper">
            <Search size={18} className="sl-search-icon" />
            <input
              type="text"
              className="sl-search-input"
              placeholder="Search by section number (e.g. 43A, 66C, 66E), offence, penalty, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="sl-clear-search-btn"
                title="Clear search"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 8 Categories Bar */}
        <div className="sl-categories-list" aria-label="Law Categories">
          {LAW_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`sl-category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="sl-category-count">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="sl-grid" aria-label="IT Act Provisions">
        {filteredSections.length === 0 ? (
          <div className="sl-empty-state">
            <div className="sl-empty-icon">
              <BookOpen size={28} />
            </div>
            <h3 className="sl-empty-title">No Matching Statutory Provisions Found</h3>
            <p className="sl-empty-desc">
              No legal sections matched your query "{searchQuery}". Try searching by another keyword such as "hacking", "privacy", "identity theft", or "compensation".
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={14} />
              <span>Reset Search & Filters</span>
            </button>
          </div>
        ) : (
          filteredSections.map(sec => (
            <article
              key={sec.section}
              className={`sl-card ${!sec.isOperative ? 'inoperative' : ''}`}
              onClick={() => setSelectedSection(sec)}
            >
              <div className="sl-card-top">
                <div className="sl-card-badges">
                  <div className="sl-sec-num-badge">
                    <Scale size={14} />
                    <span>Section {sec.section}</span>
                  </div>

                  {sec.isOperative ? (
                    <span className="sl-status-tag operative">
                      <CheckCircle2 size={12} />
                      Operative Law
                    </span>
                  ) : (
                    <span className="sl-status-tag struck-down">
                      <AlertTriangle size={12} />
                      Struck Down
                    </span>
                  )}
                </div>

                <h2 className="sl-card-title">{sec.title}</h2>
                <p className="sl-card-explanation">{sec.citizenExplanation}</p>
              </div>

              <div className="sl-card-meta">
                <div className="sl-meta-row">
                  <strong style={{ color: 'var(--text-secondary)' }}>Penalty / Relief:</strong>
                </div>
                <div className="sl-penalty-snippet">
                  <Gavel size={14} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13 }}>{sec.penalty}</span>
                </div>
              </div>

              <div className="sl-card-bottom">
                <span className="sl-category-tag">{sec.categoryName}</span>
                <button
                  type="button"
                  className="sl-btn-view-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSection(sec);
                  }}
                >
                  <span>Examine Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Official Government Sources Strip */}
      <div className="sl-sources-card">
        <div className="sl-sources-info">
          <BookOpen size={24} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              Official Statutory Sources & Law Enforcement Coordination
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Information compiled from India Code (Legislative Department, Ministry of Law and Justice) and MeitY.
            </div>
          </div>
        </div>

        <div className="sl-sources-links">
          <a
            href="https://www.indiacode.nic.in/handle/123456789/1999"
            target="_blank"
            rel="noopener noreferrer"
            className="sl-source-btn"
          >
            <span>India Code: IT Act 2000</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://www.meity.gov.in/cyber-regulations"
            target="_blank"
            rel="noopener noreferrer"
            className="sl-source-btn"
          >
            <span>MeitY Cyber Regulations</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="sl-source-btn"
          >
            <span>National Cyber Crime Portal</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* SECTION DETAIL MODAL */}
      {selectedSection && (
        <div className="sl-modal-backdrop" onClick={() => setSelectedSection(null)}>
          <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-header">
              <div className="sl-modal-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div className="sl-sec-num-badge" style={{ fontSize: 15, padding: '4px 12px' }}>
                    Section {selectedSection.section}
                  </div>
                  {selectedSection.isOperative ? (
                    <span className="sl-status-tag operative" style={{ fontSize: 12, padding: '4px 10px' }}>
                      <CheckCircle2 size={13} />
                      Current Operative Provision
                    </span>
                  ) : (
                    <span className="sl-status-tag struck-down" style={{ fontSize: 12, padding: '4px 10px' }}>
                      <AlertTriangle size={13} />
                      Struck Down by Supreme Court
                    </span>
                  )}
                  <span className="sl-category-tag" style={{ marginLeft: 'auto' }}>
                    {selectedSection.categoryName}
                  </span>
                </div>
                <h2 className="sl-modal-title">{selectedSection.title}</h2>
              </div>

              <button
                type="button"
                className="sl-clear-search-btn"
                style={{ position: 'static', padding: 6 }}
                onClick={() => setSelectedSection(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sl-modal-body">
              {/* If Struck Down Warning Notice */}
              {!selectedSection.isOperative && (
                <div className="sl-detail-section warning">
                  <div className="sl-detail-label" style={{ color: '#cf222e' }}>
                    <AlertTriangle size={14} />
                    Judicial Struck Down Notice
                  </div>
                  <div className="sl-detail-value" style={{ fontWeight: 600 }}>
                    {selectedSection.statusNote}
                  </div>
                </div>
              )}

              {/* Plain-Language Explanation */}
              <div className="sl-detail-section">
                <div className="sl-detail-label">
                  <Info size={14} />
                  Plain-Language Citizen Meaning
                </div>
                <div className="sl-detail-value">
                  {selectedSection.citizenExplanation}
                </div>
              </div>

              {/* What It Covers & When Relevant */}
              <div className="sl-detail-grid">
                <div className="sl-detail-section">
                  <div className="sl-detail-label">
                    <FileText size={14} />
                    What the Section Covers
                  </div>
                  <div className="sl-detail-value">
                    {selectedSection.covers}
                  </div>
                </div>

                <div className="sl-detail-section">
                  <div className="sl-detail-label">
                    <CheckCircle2 size={14} />
                    When It May Be Relevant
                  </div>
                  <div className="sl-detail-value">
                    {selectedSection.whenRelevant}
                  </div>
                </div>
              </div>

              {/* Statutory Penalty / Provision */}
              <div className="sl-detail-section">
                <div className="sl-detail-label">
                  <Gavel size={14} />
                  Applicable Statutory Penalty & Legal Provisions
                </div>
                <div className="sl-detail-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedSection.penalty}
                </div>
              </div>

              {/* Real-World Example Scenario */}
              {selectedSection.exampleScenario && (
                <div className="sl-detail-section">
                  <div className="sl-detail-label">
                    <Globe size={14} />
                    Practical Example Scenario
                  </div>
                  <div className="sl-detail-value" style={{ fontStyle: 'italic' }}>
                    "{selectedSection.exampleScenario}"
                  </div>
                </div>
              )}

              {/* Statutory Citation Source & Related Category */}
              <div className="sl-detail-grid">
                <div className="sl-detail-section">
                  <div className="sl-detail-label">
                    <BookOpen size={14} />
                    Official Source & Reference
                  </div>
                  <div className="sl-detail-value" style={{ fontSize: 13 }}>
                    {selectedSection.source}
                  </div>
                </div>

                <div className="sl-detail-section">
                  <div className="sl-detail-label">
                    <ShieldAlert size={14} />
                    Related Incident-Report Category
                  </div>
                  <div className="sl-detail-value">
                    <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>
                      {selectedSection.relatedIncidentCategory}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sl-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedSection(null)}
              >
                Close Reference
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="/incident-logs.html"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <FileText size={16} />
                  <span>Report an Incident under this Category</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
