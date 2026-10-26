# H1 CyberScience

*Cyber Security — Haaga-Helia University of Applied Sciences*

## a) Science Hunt

### Search process

Google Scholar: Cybersecurity Risks in Healthcare, select from the year 2026. It appeared on the top.

### Selected review article

| Field            | Information                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Title**        | *Key Factors for Reducing Cybersecurity Risks in Healthcare: A Systematic Literature Review* |
| **Authors**      | Marcel Auz-Torres and Sang Guun Yoo                                                          |
| **Year**         | 2026 (published 23 February 2026)                                                            |
| **Journal**      | *IEEE Access*, volume 14, pp. 33002–33033                                                    |
| **Article type** | Systematic literature review                                                                 |
| **JUFO level**   | 1 (journal-level rating; JUFO ID 78297)                                                      |
| **DOI**          | [10.1109/ACCESS.2026.3667073](https://doi.org/10.1109/ACCESS.2026.3667073)                   |

### Reason for selection

I chose this article because it links cybersecurity directly to healthcare information systems and medical devices. It looks at both the technical side and the human and organisational factors that affect patient data security and the continuity of care. The paper is recent, peer-reviewed and clearly relevant to the themes of the course.

---

## b) Review the Review

### 1. What are the key areas being researched?

The review focuses on four main dimensions of healthcare cybersecurity:

- **Technological factors** – encryption, intrusion detection, multifactor authentication, vulnerability management, and the use of AI in security.
- **Human factors** – staff knowledge, training, attitudes and behaviour, and how these affect security risks.
- **Organisational factors** – security policies, risk management, access control, threat modelling and compliance with standards.
- **Physical factors** – maintenance of medical devices, software updates, physical protection of servers and the overall security of the IT infrastructure.

The authors also looked at how often different controls are recommended across the 71 reviewed publications, and at statistical relationships (co-occurrence and clustering) between controls in different categories. These relationships show associations, not necessarily causation. Healthcare-specific challenges such as hospitals, connected medical devices (IoMT), sensitive patient data and critical operations are also discussed.

### 2. What's widely agreed upon?

A few points come up repeatedly in the literature:

- Technology alone is not enough. Effective cybersecurity needs a combination of technological, human, organisational and physical controls.
- Human behaviour matters a lot. Mistakes, lack of knowledge and failure to follow procedures can create serious risks. Awareness training is widely recommended.
- Basic technical measures such as encryption, IDS/IPS, multifactor authentication and vulnerability management are frequently mentioned as essential.
- Clear organisational governance (policies, risk assessments, access control, threat modelling and relevant standards) supports better security management.
- Medical devices need regular maintenance. Legacy systems and delayed updates increase risk, but updates also have to take clinical needs into account.
- Continuity of care is critical. Cyber incidents can affect both patient privacy and the availability of clinical systems and equipment.

Overall the review presents healthcare cybersecurity as a sociotechnical challenge – outcomes depend on how technology, people and organisational practices interact.

### 3. What are the open questions?

The authors point out several gaps and limitations:

- There is still limited evidence on how much specific security controls actually reduce incidents in real hospital settings.
- More work is needed on how to improve and measure security behaviour and the long-term effects of training.
- Managing long-unpatched or hard-to-update medical devices without harming patient care remains difficult.
- Smaller or resource-limited healthcare organisations need better guidance on prioritising cybersecurity investments.
- Questions remain about the transparency, reliability and security of AI-based threat detection, including risks from adversarial attacks and bias.
- It is not clear how well findings from the existing literature apply across different hospitals, device types and operating environments. More longitudinal and practical studies are needed.

The review itself is a synthesis of earlier work rather than a new intervention study, so the statistical relationships it identifies should not be read as proof of causal effects.

---

## c) Threat Modeling Quickrun: HUS Helsinki University Hospital

> **Scope:** This is a hypothetical educational threat-modelling exercise based only on publicly available information. The scenarios, controls, likelihood scores and impacts are illustrative. They are **not** an internal HUS risk assessment, a description of confirmed system vulnerabilities, or evidence that any proposed controls are currently missing.

### Company

- **Company:** HUS Helsinki University Hospital, Finland’s largest healthcare provider.
- **Size:** About 26,500 employees and 711,000 patients treated in 2025. HUS operates 21 hospitals and has activities in other facilities.
- **Industry:** Public specialised healthcare.
- **Business operations:** Specialised and emergency care, surgery, laboratory and imaging services, organ transplants, research and education.

*Sources: [HUS Year 2025](https://www.hus.fi/en/about-us/annual-reports/hus-year-2025), [HUS About Us](https://www.hus.fi/en/about-us).*

### Crown jewels

- **Data:** Confidential patient records, personal identifiers and related clinical information (including data in the Apotti system).
- **Business continuity:** Reliable clinical services, access to essential patient information, and availability of medical equipment and supporting IT systems.
- **Reputation:** Patient confidence and public trust in HUS.
- **Money:** Possible incident response costs, recovery expenses, legal liabilities and regulatory consequences.

HUS has publicly reported cases in which employees accessed personal or patient information without a justified reason. In the cases reported in December 2024, one employee viewed at least 430 people’s information and another viewed over 1,000 people’s basic personal details without justification. Only a subset of the first group involved detailed patient records. Both cases were discovered through HUS’s own monitoring. These events provide context for the risk scenario below. [HUS, 4 December 2024](https://www.hus.fi/ajankohtaista/kaksi-husin-tyontekijaa-katseli-luvatta-tietoja).

### Threat actors – COI (Capability, Opportunity, Intent)

#### Actor 1: Malicious insider

- **Capability:** Low to moderate technical skill may be enough if the person already has legitimate access rights. No external hacking is necessarily required.
- **Opportunity:** Roles that require access to patient information can also create opportunities for unauthorised viewing if someone deliberately looks at data without a care-related reason.
- **Intent:** Curiosity, personal interest or other improper motives for viewing confidential records.

#### Actor 2: Financially motivated ransomware group

- **Capability:** Potentially high – phishing, credential theft, malware and data extortion are common tactics.
- **Opportunity:** A large healthcare organisation has many staff accounts, IT services and medical technologies, which creates a complex environment to defend.
- **Intent:** Financial gain through extortion, possibly by threatening disruption or disclosure of stolen data.

### Risk identification

#### Risk 1: Unauthorised access by an insider

- **Threat:** An employee deliberately views personal or patient data without a legitimate work-related reason.
- **Hypothetical scenario:** An employee uses their own valid credentials to access information about someone outside their care responsibilities. A later review of access logs identifies the unauthorised activity.
- **Likelihood:** **4 / 5** — high, mainly because HUS has already documented similar incidents. This is a subjective exercise estimate, not a measured probability.
- **Impact:** **4 / 5** — potentially serious privacy harm, notification and investigation costs, and damage to trust.
- **Risk score:** **4 × 4 = 16**.

#### Risk 2: Ransomware disrupting clinical operations

- **Threat:** Malware disrupts hospital IT services and may also compromise confidential data.
- **Hypothetical scenario:** An attacker gains access through phishing or stolen credentials and tries to deploy ransomware. If safeguards fail, services could become unavailable and patient care could be delayed. Data theft is another possible consequence. **This is not a claim that Apotti has been compromised or that any specific HUS network path is currently exploitable.**
- **Likelihood:** **3 / 5** — possible, based on general healthcare-sector threats rather than any verified HUS-specific exposure.
- **Impact:** **5 / 5** — severe worst-case consequences could include disruption of critical care, privacy breaches and high recovery costs.
- **Risk score:** **3 × 5 = 15**.

### Risk comparison

Likelihood and impact are scored on a 1–5 scale. Higher numbers mean greater risk. These scores are illustrative estimates only.

| Risk                                    | Likelihood | Impact | Risk score |
| --------------------------------------- | ---------: | -----: | ---------: |
| **Risk 1: Unauthorised insider access** |        4   |    4   |     **16** |
| **Risk 2: Ransomware disruption**       |        3   |    5   |     **15** |

In this exercise the highest-priority risk is Risk 1 (unauthorised insider access).

### Risk treatment – META

- **Mitigate:** Reduce the likelihood or impact.
- **Eliminate:** Remove the risky activity or exposure.
- **Transfer:** Shift some of the financial consequences (for example through insurance or contracts).
- **Accept:** Formally acknowledge and tolerate the residual risk.

**Selected treatment for Risk 1: Mitigate.**

Healthcare staff need timely access to relevant patient information, so completely eliminating access is not realistic. Transferring or simply accepting the risk would not reduce unauthorised viewing. Mitigation should limit unnecessary access and improve early detection while still allowing safe patient care.

**Proposed security measures**:

1. Risk-based anomaly detection that flags unusual access patterns (for example unusually frequent record views or access outside expected clinical relationships) and triggers prompt investigation, while still allowing legitimate clinical exceptions.
2. Role-based access control with carefully controlled emergency (“break-glass”) access, plus clear justification and audit processes.
3. Regular access auditing and role-specific privacy training, together with clear communication about responsibilities and consequences for deliberate misuse.
4. Transparent access governance so that both staff and patients understand how access is logged and reviewed, in line with privacy requirements and policy.

Expected result: lower likelihood of unauthorised access, earlier detection of misuse, and reduced potential harm. Actual effectiveness would need to be tested and measured in practice.

**Related but separate privacy issue:** Physical documents also need secure handling. In April 2026 HUS reported that two paper sheets containing information on 36 people had accidentally been left in a public location and were recovered about 20 minutes later. HUS did not know whether outsiders had seen them. This is an unintentional information-handling risk, not the same as the malicious-insider scenario scored above. [HUS, 9 April 2026](https://www.hus.fi/ajankohtaista/husissa-selvitetty-alkuvuonna-kolmea-henkilotietojen-tietoturvaloukkausta).

---

## References

1. Auz-Torres, M. & Yoo, S. G. (2026). *Key Factors for Reducing Cybersecurity Risks in Healthcare: A Systematic Literature Review*. **IEEE Access**, 14, 33002–33033. https://doi.org/10.1109/ACCESS.2026.3667073
2. Karvinen, T. *Cyber Security — course assignments*. https://terokarvinen.com/cyber-security/
3. Karvinen, T. *Start Your Research with a Review Article*. https://terokarvinen.com/review-article/
4. Publication Forum (JUFO). *IEEE Access*, JUFO ID 78297. https://jfp.csc.fi/jufoportaali?Jufo_ID=78297
5. University of Vaasa research portal (2026). *IEEE Access publication channel details (JUFO level 1)*. https://uwasa.cris.fi/fi/publications/541e0759-76a0-44cf-86d3-ef082a49d125
6. HUS (2026). *HUS year 2025*. https://www.hus.fi/en/about-us/annual-reports/hus-year-2025
7. HUS. *About us*. https://www.hus.fi/en/about-us
8. HUS (4 December 2024). *Kaksi HUSin työntekijää katseli luvatta tietoja*. https://www.hus.fi/ajankohtaista/kaksi-husin-tyontekijaa-katseli-luvatta-tietoja
9. HUS (9 April 2026). *HUSissa selvitetty alkuvuonna kolmea henkilötietojen tietoturvaloukkausta*. https://www.hus.fi/ajankohtaista/husissa-selvitetty-alkuvuonna-kolmea-henkilotietojen-tietoturvaloukkausta
10. HUS (3 September 2026). *Apotin omistajien tilaama arvio on valmistunut*. https://www.hus.fi/ajankohtaista/apotin-omistajien-tilaama-arvio-valmistunut-arvioijat-suosittelevat-jarjestelman
```
