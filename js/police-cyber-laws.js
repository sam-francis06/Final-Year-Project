/**
 * CyberCouncil Police Department - Cyber Law Reference Data & Controller
 * Verified statutory provisions from primary official Indian legislation:
 * 1. Information Technology Act, 2000 (as amended)
 * 2. Bharatiya Nyaya Sanhita, 2023 (BNS)
 * 3. Bharatiya Sakshya Adhiniyam, 2023 (BSA)
 * 4. Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
 *
 * Reference tool only. Verify current statutory text, amendments, notifications,
 * and applicable procedure before taking legal action.
 */

// ============================================================================
// 1. Authoritative Statutory Provisions Dataset
// ============================================================================
const cyberLawSections = [
    // ------------------------------------------------------------------------
    // Information Technology Act, 2000
    // ------------------------------------------------------------------------
    {
        id: "it-sec-43",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 43",
        title: "Penalty and compensation for damage to computer, computer system, etc.",
        category: "Unauthorized Access / Computer Offences",
        summary: "Provides civil liability, penalty and compensation up to statutory limits if any person without permission of the owner or person in charge accesses, downloads, copies, introduces computer contaminants, damages, disrupts, denies access, or tampers with computer source code.",
        relevance: "Foundation provision defining unauthorized digital access, malware injection, ransomware disruption, and data copying. Serves as statutory predicate for criminal liability under Section 66.",
        evidenceConsiderations: "Access logs, firewall connection streams, file modification timestamps, malware binary analysis, unauthorized exfiltration logs.",
        investigationPrompts: {
            conduct: "Unauthorized accessing, downloading, extracting data, injecting contaminants, disrupting network services, or denying access.",
            evidence: "Server ingress/egress logs, IP flow telemetry, unauthorized user credentials used, hash verification of corrupted assets.",
            verification: "Ascertain absence of lawful authorization from data owner or administrator. Verify extent of disruption or asset copying.",
            relatedLaw: "Section 66 (Criminal penalization of Sec 43 acts), Section 65 (Source code tampering)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 43",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-43a",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 43A",
        title: "Compensation for failure to protect data",
        category: "Privacy / Data",
        summary: "Where a body corporate, possessing, dealing or handling sensitive personal data or information in a computer resource, is negligent in implementing and maintaining reasonable security practices and procedures and thereby causes wrongful loss or wrongful gain to any person.",
        relevance: "Applicable to corporate data breaches, failure to implement ISMS/ISO standards, unencrypted customer database leaks, and third-party vendor leaks.",
        evidenceConsiderations: "Corporate security policies, audit reports, database breach forensic artifacts, server configuration files, ISO/IEC 27001 compliance logs.",
        investigationPrompts: {
            conduct: "Corporate negligence in securing sensitive personal data resulting in wrongful gain or loss.",
            evidence: "Information Security Policy documentation, server configuration audit, incident response telemetry, vulnerability assessments.",
            verification: "Verify whether the entity had contractual security obligations and whether reasonable security practices (SPDI Rules 2011) were maintained.",
            relatedLaw: "Section 72A (Disclosure of information in breach of lawful contract), Digital Personal Data Protection Act, 2023."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 43A",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-65",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 65",
        title: "Tampering with computer source documents",
        category: "Unauthorized Access / Computer Offences",
        summary: "Knowingly or intentionally concealing, destroying or altering or intentionally or knowingly causing another to conceal, destroy or alter any computer source code used for a computer, computer programme, computer system or computer network, when required to be kept or maintained by law.",
        relevance: "Key section for deliberate software tampering, alteration of audit trails, deletion of core software repositories, and sabotage of banking or governmental algorithms.",
        evidenceConsiderations: "Version control logs (Git/SVN), diff comparisons, repository commit histories, SHA-256 code integrity checksums, developer access tokens.",
        investigationPrompts: {
            conduct: "Intentional destruction, modification, or concealment of source code required to be maintained by statutory or regulatory mandate.",
            evidence: "Version control commits, commit signatures, developer workstation disk images, commit author IP telemetry.",
            verification: "Confirm statutory/regulatory requirement to maintain source code. Compare current source code with baseline backups.",
            relatedLaw: "Section 66 (Computer related offences), BNS Section 336 (Forgery)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 65",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66",
        title: "Computer related offences",
        category: "Unauthorized Access / Computer Offences",
        summary: "If any person, dishonestly or fraudulently, does any act referred to in Section 43, he shall be punishable with imprisonment for a term which may extend to three years or with fine which may extend to five lakh rupees or with both.",
        relevance: "Primary criminal charging section for hacking, ransomware deployment, database alteration, unauthorized server intrusion, and digital asset destruction.",
        evidenceConsiderations: "System auth logs, command-line execution telemetry, remote desktop connection artifacts, malware binaries, victim system forensic images.",
        investigationPrompts: {
            conduct: "Dishonest or fraudulent execution of unauthorized access, data alteration, denial of service, or malicious payload execution.",
            evidence: "Forensic bit-stream disk images, volatile memory captures (RAM), malware hash telemetry, network PCAP captures.",
            verification: "Establish 'dishonest' or 'fraudulent' intent under BNS definition. Corroborate unauthorized physical/remote device access.",
            relatedLaw: "Section 43 (Predicate acts), Section 66C (Identity theft), BNS Section 318 (Cheating)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 66",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66a",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66A",
        title: "Punishment for sending offensive messages [STRUCK DOWN - INOPERATIVE]",
        category: "Other",
        summary: "[HISTORICAL CONTEXT NOTE]: Section 66A was completely struck down by the Hon'ble Supreme Court of India in Shreya Singhal v. Union of India (2015) 5 SCC 1 as violative of Article 19(1)(a) of the Constitution. It is NOT a current operative penal provision.",
        relevance: "CRITICAL INVESTIGATIVE WARNING: Investigating officers and police station staff must NOT register FIRs, issue notices, or invoke Section 66A. Repeated Supreme Court directives prohibit any enforcement of this provision.",
        evidenceConsiderations: "Inoperative provision. If online harassment, intimidation, or defamation is reported, appropriate provisions under BNS (e.g. Section 351, 356) or IT Act (Section 67) must be examined instead.",
        investigationPrompts: {
            conduct: "INOPERATIVE LAW: Do NOT invoke for any speech, online posting, or social media messaging.",
            evidence: "N/A — Inoperative statutory section.",
            verification: "Verify that FIRs and police intake forms do NOT reference Section 66A. Advise compliance with Supreme Court judgment.",
            relatedLaw: "BNS Section 351 (Criminal intimidation), BNS Section 356 (Defamation), IT Act Section 67."
        },
        isHistorical: true,
        historicalNote: "Struck down in Shreya Singhal v. Union of India (2015) 5 SCC 1. Inoperative and unconstitutional.",
        officialSource: "https://main.sci.gov.in/judgment/judis/42491.pdf",
        officialSourceTitle: "Supreme Court of India Judgment — Shreya Singhal (2015)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66b",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66B",
        title: "Punishment for dishonestly receiving stolen computer resource or communication device",
        category: "Unauthorized Access / Computer Offences",
        summary: "Whoever dishonestly or fraudulently receives or retains any stolen computer resource or communication device knowing or having reason to believe the same to be stolen computer resource or communication device.",
        relevance: "Relevant in recovered stolen laptops, mobile phones, servers, SIM cards, or point-of-sale terminals utilized in cyber syndicate operations.",
        evidenceConsiderations: "Device IMEI/Serial numbers, hardware MAC addresses, purchase receipts, seized property records, matching with National Cyber Crime Reporting Portal (NCRP) complaints.",
        investigationPrompts: {
            conduct: "Receiving, buying, or retaining stolen hardware, smartphones, or computers used for cyber operations.",
            evidence: "IMEI registries, CDR/SDR data, hardware serial scans, chain of possession evidence.",
            verification: "Verify whether equipment was reported stolen in Central Equipment Identity Register (CEIR) or police records.",
            relatedLaw: "BNS Section 317 (Stolen property), BNSS Section 105 (Search and seizure documentation)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 66B",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66c",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66C",
        title: "Punishment for identity theft",
        category: "Identity Theft",
        summary: "Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh.",
        relevance: "Standard charge for credential stuffing, unauthorized OTP utilization, cloned biometric data, stolen digital signatures (DSC), and account takeover.",
        evidenceConsiderations: "Authentication logs, 2FA prompt telemetry, IP login addresses, password reset tokens, MFA bypass recordings, compromised credential dumps.",
        investigationPrompts: {
            conduct: "Fraudulent or dishonest use of another person's password, OTP, digital signature, biometric identifier, or authentication credential.",
            evidence: "Multi-factor authentication (MFA) audit logs, IP login trails, SIM-swap telecom logs, credential harvester kit logs.",
            verification: "Verify that unique identification feature belonged to the complainant and was used without lawful consent.",
            relatedLaw: "Section 66D (Cheating by personation), BNS Section 319 (Cheating by personation)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 66C",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66d",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66D",
        title: "Punishment for cheating by personation by using computer resource",
        category: "Online Cheating / Fraud",
        summary: "Whoever, by means for any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.",
        relevance: "Core cyber offence for phishing websites, fake customer support executive calls, spoofed executive emails (BEC fraud), cloned social profiles, and fraudulent job portals.",
        evidenceConsiderations: "Domain registration WhoisXML telemetry, SSL/TLS certificates, spoofed email headers, audio call recordings, fraudulent payment gateway account mappings.",
        investigationPrompts: {
            conduct: "Cheating a victim by pretending to be another entity, brand, government agency, or executive through computer or phone.",
            evidence: "Phishing site source code, spoofed email headers, payment gateway beneficiary records, caller ID spoofing logs.",
            verification: "Prove the false persona represented and the resultant inducement/loss to the complainant.",
            relatedLaw: "BNS Section 318 (Cheating), BNS Section 319 (Cheating by personation), Section 66C (Identity theft)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 66D",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-66e",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 66E",
        title: "Punishment for violation of privacy",
        category: "Privacy / Data",
        summary: "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without his or her consent, under circumstances violating the privacy of that person.",
        relevance: "Applied in non-consensual image transmission, hidden camera recording, spy camera surveillance in private spaces, and blackmail through private media.",
        evidenceConsiderations: "Image/video EXIF metadata, hash verification, cloud account synchronization logs, messaging app end-to-end chat backups, transmission timestamps.",
        investigationPrompts: {
            conduct: "Capturing, publishing, or transmitting images of private areas without voluntary consent.",
            evidence: "Digital media files, EXIF timestamps, camera model hardware identifiers, cloud upload telemetry.",
            verification: "Confirm non-consensual nature of recording/transmission and circumstance violating legitimate expectation of privacy.",
            relatedLaw: "Section 67/67A (Obscene/sexually explicit transmission), BNS Section 351 (Extortion/intimidation)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 66E",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-67",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 67",
        title: "Punishment for publishing or transmitting obscene material in electronic form",
        category: "Obscenity / Electronic Content",
        summary: "Whoever publishes or transmits or causes to be published or transmitted in the electronic form, any material which is lascivious or appeals to the prurient interest or if its effect is such as to tend to deprave and corrupt persons.",
        relevance: "Applicable in electronic dissemination of obscene media, group broadcast of illicit materials, and defamatory vulgar transmissions over messaging platforms.",
        evidenceConsiderations: "Exported chat threads, digital media file hashes, transmission logs, group admin logs, intermediary transmission identifiers.",
        investigationPrompts: {
            conduct: "Publishing, distributing, or causing transmission of legally obscene content in electronic form.",
            evidence: "Media file bit-stream copies, messaging platform export archives, telecom IP detail records (IPDR).",
            verification: "Assess legal test of obscenity under Indian jurisprudence. Establish transmission or publication act by accused.",
            relatedLaw: "Section 67A (Sexually explicit content), BNS Section 294 (Obscene acts)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 67",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-67a",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 67A",
        title: "Punishment for publishing or transmitting material containing sexually explicit act, etc.",
        category: "Obscenity / Electronic Content",
        summary: "Whoever publishes or transmits or causes to be published or transmitted in the electronic form any material which contains sexually explicit act or conduct. Carries mandatory imprisonment up to five years on first conviction.",
        relevance: "Used in cyber extortion, revenge porn, non-consensual pornographic dissemination, and automated deepfake sexually explicit content generation.",
        evidenceConsiderations: "Video/image forensics, synthetic media/deepfake detection logs, web hosting account records, domain registrar data, payment for hosting.",
        investigationPrompts: {
            conduct: "Publishing or transmitting material displaying sexually explicit acts or conduct in electronic format.",
            evidence: "Original electronic file, hosting server log files, CDN cache logs, forensic analysis report.",
            verification: "Examine statutory exceptions (artistic, scientific, or educational bona fide utility). Verify chain of custody under BSA Section 63.",
            relatedLaw: "Section 66E (Privacy violation), Section 67B (Child involvement), BNS Section 351."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 67A",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-67b",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 67B",
        title: "Punishment for publishing or transmitting material depicting children in sexually explicit act",
        category: "Obscenity / Electronic Content",
        summary: "Strict liability offence penalizing publishing, transmitting, browsing, downloading, creating, or facilitating child sexual abuse material (CSAM) in electronic form.",
        relevance: "Zero-tolerance priority cybercrime category. Immediate coordination with NCRB, Interpol, and National Center for Missing & Exploited Children (NCMEC) Tipline reports.",
        evidenceConsiderations: "Hash matching against NCMEC/Project VIC databases, seized device disk images, cloud storage manifests, dark web access logs, browser history cache.",
        investigationPrompts: {
            conduct: "Creation, dissemination, downloading, collecting, or searching for child sexual abuse material electronically.",
            evidence: "Forensic image of storage devices, PhotoDNA/hash match certificates, NCMEC tipline report metadata.",
            verification: "Expedited preservation under Section 91/BNSS Section 94. Mandatory registration of FIR.",
            relatedLaw: "POCSO Act, 2012 (Sections 14/15), BNSS Section 105 (Mandatory videography of seizure)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 67B",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-69",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 69",
        title: "Powers to issue directions for interception or monitoring or decryption",
        category: "Investigation / Procedure",
        summary: "Empowers the Central or State Government to direct authorized agencies to intercept, monitor or decrypt information transmitted through any computer resource in the interest of sovereignty, integrity of India, security of the State, or investigation of offences.",
        relevance: "Governs lawful interception, monitoring, and decryption orders. Requires strict adherence to the Information Technology (Procedure and Safeguards for Interception) Rules, 2009.",
        evidenceConsiderations: "Competent authority authorization orders, TSP/ISP lawful intercept data handovers, decryption key custody logs.",
        investigationPrompts: {
            conduct: "Statutory procedural power exercised by authorized agencies upon formal authorization.",
            evidence: "Written authorization by competent authority (Home Secretary), chain of custody for decrypted traffic.",
            verification: "Confirm procedural compliance with statutory safeguards. Do not intercept without designated competent sanction.",
            relatedLaw: "IT Interception Rules 2009, BNSS Section 94, Indian Telegraph Act Section 5(2)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 69",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-69a",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 69A",
        title: "Power to issue directions for blocking for public access of any information",
        category: "Investigation / Procedure",
        summary: "Empowers the Central Government to block public access of any information generated, transmitted, received, stored or hosted in any computer resource on specified statutory grounds.",
        relevance: "Relied upon for blocking phishing domains, fraudulent loan apps, hostile C2 server infrastructure, and unlawful intermediary URLs following designated nodal officer requests.",
        evidenceConsiderations: "CERT-In incident reports, cyber nodal officer requisition, MeitY Blocking Committee records.",
        investigationPrompts: {
            conduct: "Blocking of malicious URLs, phishing portals, or illegal web services through MeitY Designated Officer.",
            evidence: "DNS resolution analysis, registrar telemetry, phishing threat suite assessment.",
            verification: "Submit blocking recommendation through State Cyber Nodal Officer to Central Designated Officer under Blocking Rules 2009.",
            relatedLaw: "Information Technology (Blocking Rules) 2009, Section 79."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 69A",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-70",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 70",
        title: "Protected system (Critical Information Infrastructure)",
        category: "Cyber Terrorism / Critical Systems",
        summary: "The appropriate Government may declare any computer resource which directly or indirectly affects the facility of Critical Information Infrastructure (CII) to be a protected system. Unauthorized access or attempt to access carries imprisonment up to ten years.",
        relevance: "Triggered in intrusions against power grids, nuclear facilities, air traffic control, defense communication networks, telecom core, and central banking clearing infrastructure.",
        evidenceConsiderations: "SCADA telemetry logs, SIEM audit records, intrusion detection alerts, perimeter firewall logs, memory dumps, malware persistent implants.",
        investigationPrompts: {
            conduct: "Securing access or attempting to access a notified Critical Information Infrastructure protected system.",
            evidence: "Network packet captures (PCAP), industrial control system logs, C2 beaconing artifacts, ingress router flow telemetry.",
            verification: "Confirm gazette notification declaring the targeted resource a 'Protected System' under Section 70(1). Coordinate with NCIIPC.",
            relatedLaw: "Section 66F (Cyber terrorism), BNS Chapter on National Security."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 70",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-72",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 72",
        title: "Penalty for breach of confidentiality and privacy",
        category: "Privacy / Data",
        summary: "Any person who, in pursuance of any of the powers conferred under the Act, rules or regulations, has secured access to any electronic record, book, register, correspondence, information, document or other material and discloses such material to any other person without consent.",
        relevance: "Applicable to public servants, forensic examiners, or authorized contractors leaking sensitive evidentiary data or official case records obtained under statutory powers.",
        evidenceConsiderations: "Audit trails of forensic workstations, external media write logs, email dispatch records, data access permissions.",
        investigationPrompts: {
            conduct: "Unlawful disclosure of electronic records obtained in exercise of statutory powers under the IT Act.",
            evidence: "Internal forensic access audit logs, USB insertion records, dispatch email headers.",
            verification: "Confirm that access was originally acquired pursuant to statutory powers and disclosure was made without lawful consent.",
            relatedLaw: "Section 72A, BNS Section on Official Secrets & Public Servant Misconduct."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 72",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "it-sec-72a",
        act: "Information Technology Act, 2000",
        actShort: "IT Act 2000",
        section: "Section 72A",
        title: "Punishment for disclosure of information in breach of lawful contract",
        category: "Privacy / Data",
        summary: "Any person including an intermediary who, while providing services under the terms of lawful contract, has secured access to any personal information, discloses such information without the consent of the person concerned or in breach of a lawful contract, with intent to cause wrongful loss or gain.",
        relevance: "Frequently charged in insider data theft, call center employees selling customer bank records, telecom agents selling CDRs, and corporate database sales.",
        evidenceConsiderations: "Service contracts, employment agreements, database query audit logs, customer record dump files, financial bank transfers from data buyers.",
        investigationPrompts: {
            conduct: "Service provider or employee disclosing personal information obtained under contract, resulting in wrongful loss or gain.",
            evidence: "Database query logs, file transfer records, insider email trails, financial remuneration trails from illicit data markets.",
            verification: "Verify existence of lawful service contract and establish absence of consent for external disclosure.",
            relatedLaw: "Section 43A, BNS Section 318 (Cheating), BNS Section 316 (Criminal breach of trust)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — IT Act 2000, Section 72A",
        lastReviewedDate: "2026-09-01"
    },

    // ------------------------------------------------------------------------
    // Bharatiya Nyaya Sanhita, 2023 (BNS)
    // ------------------------------------------------------------------------
    {
        id: "bns-sec-318",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 318",
        title: "Cheating",
        category: "Online Cheating / Fraud",
        summary: "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property. Corresponds to substantive criminal cheating in digital environments.",
        relevance: "Universal substantive penal provision applied alongside IT Act Section 66D in online investment scams, crypto fraud, fake lottery schemes, and e-commerce fraud.",
        evidenceConsiderations: "Bank account statements, UPI payment reference logs, fake investment platform dashboards, WhatsApp/Telegram chat logs, call recordings.",
        investigationPrompts: {
            conduct: "Fraudulent inducement causing victim to transfer money, cryptocurrency, or property based on false representations.",
            evidence: "Victim bank debits, beneficiary mule account statements, communication transcripts showing false promises.",
            verification: "Establish fraudulent or dishonest intention existing from the inception of the transaction.",
            relatedLaw: "BNS Section 319 (Cheating by personation), IT Act Section 66D, BNSS Section 107 (Asset freeze)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 318)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-319",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 319",
        title: "Cheating by personation",
        category: "Online Cheating / Fraud",
        summary: "A person is said to 'cheat by personation' if he cheats by pretending to be some other person, or by knowingly substituting one person for another, or representing that he or any other person is a person other than he or such other person really is.",
        relevance: "Applies to fraudulent impersonation of police officers, customs officials, bank managers, or corporate executives in digital extortion and phishing schemes.",
        evidenceConsiderations: "Audio/video call recordings, spoofed caller identities, fake police letterheads sent on WhatsApp, cloned institutional emblems.",
        investigationPrompts: {
            conduct: "Posing as a government official, bank representative, or real individual to induce payment or property transfer.",
            evidence: "Caller ID spoofing metadata, digital letterhead files, fraudulent email sender addresses, voice recordings.",
            verification: "Establish the genuine identity of the person/organization impersonated and the fabricated status asserted.",
            relatedLaw: "IT Act Section 66D, BNS Section 318, BNS Section 204 (Impersonating public servant)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 319)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-336",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 336",
        title: "Forgery",
        category: "Forgery / False Electronic Records",
        summary: "Whoever makes any false document or false electronic record or part of a document or electronic record, with intent to cause damage or injury, to the public or to any person, or to support any claim or title, or to cause any person to part with property.",
        relevance: "Primary penal provision for fabricated PDF sanction letters, forged court orders sent by cyber syndicates, falsified KYC documents, and tampered digital receipts.",
        evidenceConsiderations: "PDF font structure analysis, metadata mismatch, missing cryptographic signatures, original versus altered document image comparisons.",
        investigationPrompts: {
            conduct: "Creating or altering an electronic record or PDF without lawful authorization with intent to deceive.",
            evidence: "Document metadata showing creation software, mismatched revision dates, hex edits, missing digital signatures.",
            verification: "Confirm that the electronic record was fabricated or altered without authority of the purported maker.",
            relatedLaw: "BNS Section 338 (Forgery of valuable security/record), BNS Section 340 (Using forged record)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 336)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-338",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 338",
        title: "Forgery of valuable security, will, or electronic record",
        category: "Forgery / False Electronic Records",
        summary: "Whoever forges a document which purports to be a valuable security or a will, or an authority to make or transfer any valuable security, or to receive principal, interest or dividends, or an electronic record purporting to be a valuable security.",
        relevance: "Applied in forging electronic bank guarantees, falsifying digital loan sanctions, altering electronic fund transfer orders, and unauthorized cryptocurrency authorization keys.",
        evidenceConsiderations: "Electronic signature validity checks, banking server ledger logs, digital certificate status (CRL/OCSP), electronic authorization tokens.",
        investigationPrompts: {
            conduct: "Forging electronic records conveying legal rights, financial obligations, or monetary securities.",
            evidence: "Cryptographic signature validation failure reports, financial ledger discrepancy logs, banking communication records.",
            verification: "Confirm that forged instrument qualifies as 'valuable security' or legal financial entitlement.",
            relatedLaw: "BNS Section 336, IT Act Section 66C, BSA Section 63."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 338)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-340",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 340",
        title: "Using as genuine a forged document or electronic record",
        category: "Forgery / False Electronic Records",
        summary: "Whoever fraudulently or dishonestly uses as genuine any document or electronic record which he knows or has reason to believe to be a forged document or electronic record, shall be punished in the same manner as if he had forged such document or electronic record.",
        relevance: "Enables prosecution of mules, intermediaries, or fraudsters who submit forged identity proofs, fake salary slips, or falsified bills online, even if created by another.",
        evidenceConsiderations: "Online submission timestamps, IP address used to upload the forged document, portal audit logs, email attachments sent to victims or lenders.",
        investigationPrompts: {
            conduct: "Uploading, submitting, or presenting a forged electronic record or document knowing it to be fake.",
            evidence: "Web portal upload audit trails, associated IP addresses, communications presenting the document as genuine.",
            verification: "Prove the accused had knowledge or reason to believe the electronic record was forged.",
            relatedLaw: "BNS Section 336, BNS Section 318, IT Act Section 66D."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 340)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-351",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 351",
        title: "Criminal intimidation",
        category: "Cyberbullying / Harassment",
        summary: "Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do.",
        relevance: "Primary charge for online harassment, digital extortion, doxxing threats, ransomware blackmail messages, and stalking through electronic messaging.",
        evidenceConsiderations: "Encrypted messaging exports, SMS delivery logs, caller identity records, social media threat direct messages, timestamped screen captures.",
        investigationPrompts: {
            conduct: "Threatening harm to person, reputation, or assets via electronic communication to cause alarm or extort action.",
            evidence: "Full unedited message exports, sender handles/phone numbers, preserved message headers, recipient statement.",
            verification: "Establish threat communication origin and verify realistic apprehension caused to the complainant.",
            relatedLaw: "IT Act Section 66E (Privacy), BNS Section 308 (Extortion), BSA Section 63."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 351)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bns-sec-356",
        act: "Bharatiya Nyaya Sanhita, 2023",
        actShort: "BNS 2023",
        section: "Section 356",
        title: "Defamation",
        category: "Cyberbullying / Harassment",
        summary: "Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes in any manner, any imputation concerning any person intending to harm, or knowing or having reason to believe that such imputation will harm, the reputation of such person.",
        relevance: "Pertains to online character assassination, defamatory blogs, manipulated viral media, and fake social media posts published to harm professional/personal reputation.",
        evidenceConsiderations: "Preserved web archives, public view counts, comments, server host records, intermediary subscriber details of the author.",
        investigationPrompts: {
            conduct: "Publishing defamatory statements, manipulated pictures, or false allegations online to injure reputation.",
            evidence: "Notarized or cryptographically hashed web captures, author account login IPs, platform dissemination metrics.",
            verification: "Evaluate statutory exceptions (truth for public good, fair comment). Confirm publication to third parties.",
            relatedLaw: "BNS Section 351, IT Act Section 66E, IT Act Section 79 (Intermediary due diligence)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202301?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nyaya Sanhita, 2023 (Section 356)",
        lastReviewedDate: "2026-09-01"
    },

    // ------------------------------------------------------------------------
    // Bharatiya Sakshya Adhiniyam, 2023 (BSA)
    // ------------------------------------------------------------------------
    {
        id: "bsa-sec-57",
        act: "Bharatiya Sakshya Adhiniyam, 2023",
        actShort: "BSA 2023",
        section: "Section 57",
        title: "Primary evidence (Electronic and digital records)",
        category: "Electronic Evidence",
        summary: "Defines primary evidence as the document itself produced for inspection of the Court. Explains that electronic and digital records created or stored in electronic form are primary evidence when produced from proper custody.",
        relevance: "Foundational evidence provision recognizing electronic records as direct primary evidence when retrieved from original digital custody.",
        evidenceConsiderations: "Original physical storage media, bit-stream forensic images, write-blocker utilization certificates, chain of custody logs.",
        investigationPrompts: {
            conduct: "Adducing electronic or digital records directly before trial courts as primary evidence.",
            evidence: "Seized original device, physical storage container seal records, forensic workstation acquisition logs.",
            verification: "Demonstrate unbroken chain of custody from seizure under BNSS Section 105 to court deposit.",
            relatedLaw: "BSA Section 61, BSA Section 63, BNSS Section 105."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202303?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Sakshya Adhiniyam, 2023 (Section 57)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bsa-sec-61",
        act: "Bharatiya Sakshya Adhiniyam, 2023",
        actShort: "BSA 2023",
        section: "Section 61",
        title: "Electronic or digital record",
        category: "Electronic Evidence",
        summary: "Nothing in this Adhiniyam shall apply to electronic or digital records as to the requirement of proving contents of documents by primary or secondary evidence, and any information contained in an electronic or digital record which is printed on a paper, stored, recorded or copied in optical or magnetic media shall be deemed to be also a document.",
        relevance: "Statutory bridge establishing that electronic records, printouts, optical disks, and magnetic media copies are deemed documents admissible under Section 63 conditions.",
        evidenceConsiderations: "Hash verification of optical/magnetic media copies, matching against original source storage.",
        investigationPrompts: {
            conduct: "Proving information contained in electronic and digital records without secondary evidence restrictions.",
            evidence: "Digital media extracts, printouts, mirror image copies prepared on forensic workstations.",
            verification: "Ensure full compliance with the special conditions set out in Section 63.",
            relatedLaw: "BSA Section 57, BSA Section 62, BSA Section 63."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202303?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Sakshya Adhiniyam, 2023 (Section 61)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bsa-sec-62",
        act: "Bharatiya Sakshya Adhiniyam, 2023",
        actShort: "BSA 2023",
        section: "Section 62",
        title: "Special provisions as to evidence relating to electronic record",
        category: "Electronic Evidence",
        summary: "The contents of electronic records may be proved in accordance with the provisions of section 63. Reaffirms the mandatory procedural channel for admitting digital evidence.",
        relevance: "Crucial procedural bar: electronic records must strictly follow the proof mechanism established under Section 63 to be legally admissible.",
        evidenceConsiderations: "Preparation of contemporaneous Section 63 certificates at the time of data acquisition or printing.",
        investigationPrompts: {
            conduct: "Procedural pathway for introducing digital evidence, emails, call logs, server archives, or chat records in court.",
            evidence: "Contemporaneous electronic evidence certificate, examiner expert deposition record.",
            verification: "Never submit computer printouts or digital media without the requisite Section 63 certificate.",
            relatedLaw: "BSA Section 63, Supreme Court precedent in Arjun Panditrao Khotkar (2020)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202303?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Sakshya Adhiniyam, 2023 (Section 62)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bsa-sec-63",
        act: "Bharatiya Sakshya Adhiniyam, 2023",
        actShort: "BSA 2023",
        section: "Section 63",
        title: "Admissibility of electronic records and Certificate Requirement",
        category: "Electronic Evidence",
        summary: "Prescribes comprehensive conditions for the admissibility of electronic records. Mandates that any electronic record produced as evidence must be accompanied by a Certificate under Subsection (4) identifying the record, describing the device, and signed by a person in official charge of the device or an authorized expert.",
        relevance: "THE MOST CRITICAL EVIDENCE PROVISION FOR DIGITAL INVESTIGATIONS. Failure to secure a valid Section 63(4) certificate risks rendering the electronic evidence inadmissible in court.",
        evidenceConsiderations: "Section 63(4) Certificate signed by system administrator, bank nodal officer, or forensic examiner. Hardware specifications, SHA-256 hash checksums, operating system version, absence of tampering declaration.",
        investigationPrompts: {
            conduct: "Submission of emails, CCTV footage, mobile extractions, call detail records (CDR), bank ledgers, or website screenshots in court.",
            evidence: "Mandatory signed Section 63(4) Certificate, hash matching verification report, acquisition tool calibration certificate.",
            verification: "Verify certificate signatory had lawful management or technical control of the computer resource during the operative period.",
            relatedLaw: "BSA Section 57, BSA Section 61, BNSS Section 105."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202303?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Sakshya Adhiniyam, 2023 (Section 63)",
        lastReviewedDate: "2026-09-01"
    },

    // ------------------------------------------------------------------------
    // Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
    // ------------------------------------------------------------------------
    {
        id: "bnss-sec-94",
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        actShort: "BNSS 2023",
        section: "Section 94",
        title: "Summons to produce document or other thing (including electronic communication)",
        category: "Investigation / Procedure",
        summary: "Empowers an officer in charge of a police station or court to issue written summons/order requiring production of any document, electronic communication, or other thing necessary or desirable for the purposes of any investigation, inquiry, or trial.",
        relevance: "Primary statutory instrument for issuing official notices to telecom service providers (TSPs), internet service providers (ISPs), banks, intermediaries, and email providers for user telemetry, IP logs, and KYC.",
        evidenceConsiderations: "Official notice serial number, acknowledgment receipt, hash of digital records returned by recipient, compliance timeline.",
        investigationPrompts: {
            conduct: "Compelling production of IPDR, CDR, bank account statements, server access logs, or device images from third parties.",
            evidence: "Formal Section 94 notice dispatched by Investigating Officer, official corporate nodal reply envelope.",
            verification: "Ensure notice specifies exact identifiers (IP, port, timestamp, phone number, VPA) with timezone (IST/UTC).",
            relatedLaw: "BSA Section 63 (Certificate accompaniment), IT Act Section 69, BNSS Section 105."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202302?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 94)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bnss-sec-105",
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        actShort: "BNSS 2023",
        section: "Section 105",
        title: "Recording of search and seizure through audio-video electronic means",
        category: "Investigation / Procedure",
        summary: "Mandates that the process of conducting search of a place or taking possession of any property, article or thing under this Chapter, including preparation of the list of things seized and signature of witnesses, shall be recorded through any audio-video electronic means, preferably mobile phone.",
        relevance: "MANDATORY PROCEDURAL REQUIREMENT FOR DIGITAL DEVICE SEIZURE. Any seizure of laptops, phones, servers, or storage drives must be video recorded to prevent allegations of evidence planting or tampering.",
        evidenceConsiderations: "Continuous audio-video footage of search and seizure, panchnama/seizure memo signed on video, device state (on/off, airplane mode) captured on video, tamper-evident evidence bag sealing captured on camera.",
        investigationPrompts: {
            conduct: "Physical execution of search and seizure of digital evidence, smartphones, hard drives, or servers.",
            evidence: "Continuous raw video recording of search operation, hash of video file, seizure memo signed by independent witnesses.",
            verification: "Ensure camera recording is continuous and shows packaging into Faraday bags and evidence tape sealing.",
            relatedLaw: "BSA Section 63 (Video recording admissibility), BNSS Section 94, BNSS Section 107."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202302?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 105)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bnss-sec-107",
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        actShort: "BNSS 2023",
        section: "Section 107",
        title: "Attachment, forfeiture or seizure of property",
        category: "Investigation / Procedure",
        summary: "Enables police officers to seek attachment and forfeiture of property derived directly or indirectly from the commission of offences, or proceeds of crime, before the competent Magistrate or Court.",
        relevance: "Vital in cyber financial fraud, investment scams, and ransomware investigations to freeze and attach beneficiary bank accounts, merchant aggregator pools, and cryptocurrency wallets.",
        evidenceConsiderations: "Fund trail flowcharts, bank freeze orders, transaction hash sequences, cryptocurrency ledger tracing outputs.",
        investigationPrompts: {
            conduct: "Freezing, lien marking, and attachment of illicit funds or crypto assets representing proceeds of cybercrime.",
            evidence: "Bank debit/credit statements, transaction hashes, mule network hierarchy maps, Magistrate attachment orders.",
            verification: "Trace direct nexus between victim loss and seized property or account balance.",
            relatedLaw: "BNS Section 318, BNSS Section 105, Prevention of Money Laundering Act (PMLA)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202302?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 107)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bnss-sec-173",
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        actShort: "BNSS 2023",
        section: "Section 173",
        title: "Information in cognizable cases (e-FIR and electronic communication)",
        category: "Investigation / Procedure",
        summary: "Information relating to the commission of a cognizable offence may be given orally or by electronic communication to the officer in charge of a police station. Information given by electronic communication shall be taken on record by him on being signed within three days by the person who gave it.",
        relevance: "Statutory recognition of e-FIR and cybercrime portal reporting. Permits immediate preliminary intake of citizen portal cybercrime complaints with three-day verification window.",
        evidenceConsiderations: "Portal submission digital timestamp, complainant digital signature or OTP verification, automated intake log.",
        investigationPrompts: {
            conduct: "Ingestion of cybercrime complaints submitted via online portals, mobile applications, or email.",
            evidence: "Electronic complaint intake receipt, digital acknowledgment number, signed physical or e-verification within 3 days.",
            verification: "Confirm whether information discloses cognizable offence and verify complainant physical or e-signature within 3 days.",
            relatedLaw: "IT Act Section 66, BNSS Section 175 (Investigation powers)."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202302?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 173)",
        lastReviewedDate: "2026-09-01"
    },
    {
        id: "bnss-sec-530",
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        actShort: "BNSS 2023",
        section: "Section 530",
        title: "Use of electronic communication and audio-video electronic means",
        category: "Investigation / Procedure",
        summary: "All trials, inquires and proceedings under this Sanhita, including issuance, service and execution of summons and warrants, holding of inquiries and examination of witnesses and experts, may be held by electronic communication or by audio-video electronic means.",
        relevance: "Authorizes electronic summons to foreign intermediaries, remote video examination of cyber forensic experts, and digital transmission of case records.",
        evidenceConsiderations: "Electronic service receipts (email read receipts, WhatsApp double-blue ticks), video examination recordings, digital signatures of court officers.",
        investigationPrompts: {
            conduct: "Serving summons electronically to tech platforms or examining forensic examiners over video conference.",
            evidence: "Verified electronic transmission logs, video conference session logs, authenticated digital signatures.",
            verification: "Verify authenticity of electronic address or video portal link used for service or examination.",
            relatedLaw: "BNSS Section 94, BSA Section 63."
        },
        isHistorical: false,
        officialSource: "https://www.indiacode.nic.in/handle/123456789/202302?sam_handle=123456789/1362",
        officialSourceTitle: "India Code — Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 530)",
        lastReviewedDate: "2026-09-01"
    }
];

// ============================================================================
// 2. Data Layer Abstraction (CyberLawRepository)
// ============================================================================
const CyberLawRepository = {
    _sections: [...cyberLawSections],

    async getAllSections() {
        return [...this._sections];
    },

    async getSectionById(id) {
        return this._sections.find(s => s.id === id) || null;
    }
};

// ============================================================================
// 3. UI Controller & Presentation
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Current filter state
    const filterState = {
        searchQuery: '',
        act: '',
        category: ''
    };

    let currentDossierSectionId = null;

    // DOM Elements
    const statActsEl = document.getElementById('statActsCount');
    const statSectionsEl = document.getElementById('statSectionsCount');
    const statEvidenceEl = document.getElementById('statEvidenceCount');
    const statProcedureEl = document.getElementById('statProcedureCount');

    const searchInput = document.getElementById('lawSearchInput');
    const clearSearchBtn = document.getElementById('btnClearSearch');
    const actFilter = document.getElementById('filterActSelect');
    const categoryFilter = document.getElementById('filterCategorySelect');
    const resetFiltersBtn = document.getElementById('btnResetFilters');
    const resultsCountEl = document.getElementById('lawResultsCount');

    const lawTableBody = document.getElementById('lawTableBody');
    const emptyStateEl = document.getElementById('lawEmptyState');

    // Featured Act Cards
    const featuredActCards = document.querySelectorAll('.act-card[data-filter-act]');

    // Dossier Modal Elements
    const lawModalOverlay = document.getElementById('lawModalOverlay');
    const closeLawModalBtn = document.getElementById('closeLawModalBtn');
    const dossierSectionBadge = document.getElementById('dossierSectionBadge');
    const dossierActPill = document.getElementById('dossierActPill');
    const dossierCategoryPill = document.getElementById('dossierCategoryPill');
    const dossierTitle = document.getElementById('dossierTitle');
    const btnOfficialLink = document.getElementById('btnOfficialLink');
    const btnCopyCitation = document.getElementById('btnCopyCitation');

    const dossierSummaryBlock = document.getElementById('dossierSummaryBlock');
    const dossierHistoricalAlert = document.getElementById('dossierHistoricalAlert');
    const dossierPromptsList = document.getElementById('dossierPromptsList');
    const dossierEvidenceBlock = document.getElementById('dossierEvidenceBlock');
    const dossierCategoriesCluster = document.getElementById('dossierCategoriesCluster');
    const dossierSourceDate = document.getElementById('dossierSourceDate');

    // Theme Management
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
        });
    }

    initTheme();

    // Mobile Sidebar Drawer
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const consoleSidebar = document.getElementById('consoleSidebar');

    function openMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.add('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }

    function closeMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.remove('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileDrawer);

    // ========================================================================
    // 4. Statistics Calculation
    // ========================================================================
    function updateStatistics(sections) {
        const distinctActs = new Set(sections.map(s => s.act)).size;
        const totalSections = sections.length;
        const evidenceSections = sections.filter(s => s.category === 'Electronic Evidence').length;
        const procedureSections = sections.filter(s => s.category === 'Investigation / Procedure').length;

        if (statActsEl) statActsEl.textContent = distinctActs;
        if (statSectionsEl) statSectionsEl.textContent = totalSections;
        if (statEvidenceEl) statEvidenceEl.textContent = evidenceSections;
        if (statProcedureEl) statProcedureEl.textContent = procedureSections;
    }

    // ========================================================================
    // 5. Table Rendering & Filtering
    // ========================================================================
    function getActBadgeClass(actShort) {
        switch (actShort) {
            case 'IT Act 2000': return 'it-act';
            case 'BNS 2023': return 'bns';
            case 'BNSS 2023': return 'bnss';
            case 'BSA 2023': return 'bsa';
            default: return 'it-act';
        }
    }

    function renderLawTable(sections) {
        lawTableBody.innerHTML = '';

        if (sections.length === 0) {
            emptyStateEl.style.display = 'flex';
            resultsCountEl.innerHTML = 'Showing <strong>0</strong> statutory provisions';
            return;
        }

        emptyStateEl.style.display = 'none';
        resultsCountEl.innerHTML = `Showing <strong>${sections.length}</strong> of <strong>${cyberLawSections.length}</strong> statutory provisions`;

        sections.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-section-id', item.id);

            const actClass = getActBadgeClass(item.actShort);

            tr.innerHTML = `
                <td>
                    <span class="act-pill-badge ${actClass}">${item.actShort}</span>
                </td>
                <td>
                    <span class="section-num-badge ${item.isHistorical ? 'historical' : ''}">
                        ${item.section}
                    </span>
                </td>
                <td class="cell-law-title">
                    <span>${item.title}</span>
                </td>
                <td>
                    <span class="cell-category-pill">${item.category}</span>
                </td>
                <td class="cell-relevance-summary">
                    <span>${item.relevance}</span>
                </td>
                <td style="text-align: right;">
                    <button type="button" class="btn-inspect-section" data-section-id="${item.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span>Inspect</span>
                    </button>
                </td>
            `;

            // Row click triggers detail
            tr.addEventListener('click', () => {
                openSectionDossier(item.id);
            });

            // Prevent double click on inspect button
            const btn = tr.querySelector('.btn-inspect-section');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSectionDossier(item.id);
                });
            }

            lawTableBody.appendChild(tr);
        });
    }

    async function applyFiltersAndRender() {
        const allSections = await CyberLawRepository.getAllSections();

        const filtered = allSections.filter(item => {
            // Search Query
            if (filterState.searchQuery) {
                const q = filterState.searchQuery.toLowerCase();
                const matchAct = item.act.toLowerCase().includes(q) || item.actShort.toLowerCase().includes(q);
                const matchSec = item.section.toLowerCase().includes(q);
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchCat = item.category.toLowerCase().includes(q);
                const matchSummary = item.summary.toLowerCase().includes(q);
                const matchRelevance = item.relevance.toLowerCase().includes(q);
                if (!matchAct && !matchSec && !matchTitle && !matchCat && !matchSummary && !matchRelevance) {
                    return false;
                }
            }

            // Act Filter
            if (filterState.act && item.act !== filterState.act && item.actShort !== filterState.act) {
                return false;
            }

            // Category Filter
            if (filterState.category && item.category !== filterState.category) {
                return false;
            }

            return true;
        });

        renderLawTable(filtered);
    }

    // Filter Listeners
    searchInput.addEventListener('input', (e) => {
        filterState.searchQuery = e.target.value.trim();
        clearSearchBtn.style.display = filterState.searchQuery ? 'grid' : 'none';
        applyFiltersAndRender();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        applyFiltersAndRender();
    });

    actFilter.addEventListener('change', (e) => {
        filterState.act = e.target.value;
        syncFeaturedActCards(filterState.act);
        applyFiltersAndRender();
    });

    categoryFilter.addEventListener('change', (e) => {
        filterState.category = e.target.value;
        applyFiltersAndRender();
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        actFilter.value = '';
        categoryFilter.value = '';

        filterState.searchQuery = '';
        filterState.act = '';
        filterState.category = '';

        syncFeaturedActCards('');
        applyFiltersAndRender();
    });

    // Featured Acts Cards Click-to-filter
    function syncFeaturedActCards(selectedAct) {
        featuredActCards.forEach(card => {
            const cardAct = card.getAttribute('data-filter-act');
            if (selectedAct && (cardAct === selectedAct || card.dataset.fullAct === selectedAct)) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    featuredActCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetAct = card.getAttribute('data-filter-act');
            if (filterState.act === targetAct) {
                // Deselect
                filterState.act = '';
                actFilter.value = '';
                card.classList.remove('active');
            } else {
                filterState.act = targetAct;
                actFilter.value = targetAct;
                syncFeaturedActCards(targetAct);
            }
            applyFiltersAndRender();
        });
    });

    // ========================================================================
    // 6. Section Detail Dossier Drawer Modal
    // ========================================================================
    async function openSectionDossier(sectionId) {
        const item = await CyberLawRepository.getSectionById(sectionId);
        if (!item) return;

        currentDossierSectionId = sectionId;

        dossierSectionBadge.textContent = item.section;
        if (item.isHistorical) {
            dossierSectionBadge.classList.add('historical');
        } else {
            dossierSectionBadge.classList.remove('historical');
        }

        const actClass = getActBadgeClass(item.actShort);
        dossierActPill.className = `act-pill-badge ${actClass}`;
        dossierActPill.textContent = item.actShort;

        dossierCategoryPill.textContent = item.category;
        dossierTitle.textContent = item.title;

        // Official link
        btnOfficialLink.href = item.officialSource;
        btnOfficialLink.title = item.officialSourceTitle;

        // Statutory Summary
        dossierSummaryBlock.textContent = item.summary;

        // Historical Alert
        if (item.isHistorical && item.historicalNote) {
            dossierHistoricalAlert.style.display = 'block';
            dossierHistoricalAlert.innerHTML = `<strong>JUDICIAL DIRECTIVE:</strong> ${item.historicalNote}`;
        } else {
            dossierHistoricalAlert.style.display = 'none';
        }

        // Investigation Reference Prompts
        dossierPromptsList.innerHTML = `
            <div class="prompt-item">
                <span class="prompt-q">What type of conduct may be covered?</span>
                <p class="prompt-a">${item.investigationPrompts.conduct}</p>
            </div>
            <div class="prompt-item">
                <span class="prompt-q">What digital evidence may be relevant?</span>
                <p class="prompt-a">${item.investigationPrompts.evidence}</p>
            </div>
            <div class="prompt-item">
                <span class="prompt-q">What should the investigating officer verify?</span>
                <p class="prompt-a">${item.investigationPrompts.verification}</p>
            </div>
            <div class="prompt-item">
                <span class="prompt-q">Which related legal provisions may need review?</span>
                <p class="prompt-a">${item.investigationPrompts.relatedLaw}</p>
            </div>
        `;

        // Evidence Considerations
        dossierEvidenceBlock.textContent = item.evidenceConsiderations;

        // Categories cluster
        dossierCategoriesCluster.innerHTML = `
            <span class="cell-category-pill">${item.category}</span>
            <span class="cell-category-pill">${item.actShort}</span>
            <span class="cell-category-pill">Section 63 BSA Compliance</span>
        `;

        // Last reviewed date
        dossierSourceDate.textContent = item.lastReviewedDate;

        // Open modal
        lawModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSectionDossier() {
        lawModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        currentDossierSectionId = null;
    }

    if (closeLawModalBtn) closeLawModalBtn.addEventListener('click', closeSectionDossier);
    lawModalOverlay.addEventListener('click', (e) => {
        if (e.target === lawModalOverlay) closeSectionDossier();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lawModalOverlay.classList.contains('active')) {
            closeSectionDossier();
        }
    });

    // Copy Citation Button
    btnCopyCitation.addEventListener('click', async () => {
        if (!currentDossierSectionId) return;
        const item = await CyberLawRepository.getSectionById(currentDossierSectionId);
        if (!item) return;

        const citationText = `[STATUTORY CITATION]\n${item.section}, ${item.act}\nTitle: ${item.title}\nOfficial Source: ${item.officialSource}\nReference: CyberCouncil Police Legal Module`;

        try {
            await navigator.clipboard.writeText(citationText);
            const origText = btnCopyCitation.innerHTML;
            btnCopyCitation.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
            setTimeout(() => {
                btnCopyCitation.innerHTML = origText;
            }, 1800);
        } catch (e) {
            console.error('Copy citation error:', e);
        }
    });

    // ========================================================================
    // 7. Initial Load
    // ========================================================================
    updateStatistics(cyberLawSections);
    await applyFiltersAndRender();
});
