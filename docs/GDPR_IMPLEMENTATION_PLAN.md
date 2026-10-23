# GDPR Compliance Implementation Plan

**Date:** {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
**Status:** Planning Phase

## Quick Summary

This document outlines the technical and operational steps needed to make Meridian GDPR compliant. The implementation is divided into 4 phases with increasing complexity.

---

## Phase 1: Foundation (Week 1-2) 🚀

### What We're Doing
Setting up the basic legal and technical infrastructure for GDPR compliance.

### Tasks

#### 1.1 Update Privacy Policy
- [ ] Add GDPR-specific sections:
  - Legal basis for data collection
  - User rights under GDPR
  - Data retention periods
  - How to contact us for data requests
  - Information about third-party data processors
- [ ] Cross-reference Privacy Policy in all legal documents
- **Time:** 2-3 hours
- **Owner:** [Legal/Content Team]

#### 1.2 Implement Cookie Consent Banner
- [ ] Choose consent management tool:
  - Recommended: **Cookiebot** (easy integration, GDPR ready)
  - Alternative: **Iubenda** (comprehensive solution)
  - Open source option: **CookieConsent**
- [ ] Design consent prompt:
  - Banner at top of page (before tracking)
  - Accept all / Reject all buttons
  - Link to privacy policy
- [ ] Configure cookie categories:
  - Essential (always on)
  - Analytics
  - Functional
  - Marketing
- [ ] Set up consent storage (localStorage or database)
- **Time:** 4-6 hours
- **Owner:** [Frontend Developer]
- **Dependencies:** Privacy Policy updated

#### 1.3 Create Astro Component for Consent Banner
If building custom solution:
- [ ] Create `src/components/CookieConsent.astro`
- [ ] Add local storage for consent preferences
- [ ] Show banner until consent given
- [ ] Load analytics/tracking only after consent
- **Code Example Needed:** Post-build

#### 1.4 Audit Current Data Collection
- [ ] Document all data Meridian collects:
  - Form inputs (contact forms, listings, etc.)
  - Analytics data (Supabase queries, page views)
  - User behavior tracking
  - Browser/device information
- [ ] Document where data is stored:
  - Supabase database
  - Third-party services
- [ ] Create data flow diagram
- **Time:** 2-3 hours
- **Owner:** [Developer/Admin]

#### 1.5 Create User Rights Request Form
- [ ] Build static form at `/data-request`
- [ ] Collect:
  - Request type (access, deletion, portability, etc.)
  - User email
  - Additional details
- [ ] Set up email notification system
- [ ] Create ticket/case management process
- **Time:** 3-4 hours
- **Owner:** [Frontend Developer]

### Phase 1 Deliverables
✅ Updated Privacy Policy  
✅ Cookie consent banner deployed  
✅ User rights request form live  
✅ Data inventory documented  

---

## Phase 2: User Controls (Week 3-4) 🎮

### What We're Doing
Building systems for users to exercise their GDPR rights.

### Tasks

#### 2.1 User Data Access System
- [ ] Create API endpoint `/api/data-request` that:
  - Verifies user identity
  - Retrieves all user data from database
  - Generates JSON/CSV export
  - Sends to user email
- [ ] Implementation:
  - Use Supabase Row Level Security (RLS) for security
  - Encrypt data in transit
  - Delete export after 24 hours
- **Time:** 4-6 hours
- **Owner:** [Backend Developer]
- **Security:** Data must be encrypted in transit (HTTPS only)

#### 2.2 User Data Deletion System
- [ ] Create secure deletion process:
  - Verify user identity
  - Create audit log of deletion request
  - Delete user data from database
  - Remove user from mailing lists
  - Notify user of deletion
- [ ] Database schema for deletion log:
  ```sql
  CREATE TABLE deletion_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID,
    deletion_date TIMESTAMP,
    data_deleted JSONB,
    reason TEXT,
    status TEXT
  );
  ```
- **Time:** 5-7 hours
- **Owner:** [Backend Developer]
- **Testing:** Critical - test thoroughly before deployment

#### 2.3 Consent Withdrawal
- [ ] Build consent preference center at `/consent-preferences`
- [ ] Allow users to:
  - View current consents
  - Withdraw specific consents
  - Re-enable categories
  - Manage email preferences
- [ ] Store preferences in database (linked to user)
- **Time:** 3-4 hours
- **Owner:** [Frontend Developer]

#### 2.4 Implement Supabase Row Level Security
- [ ] Configure RLS policies for sensitive data
- [ ] Ensure users can only access their own data
- [ ] Create policies for admin data access
- **Example Policy:**
  ```sql
  CREATE POLICY "Users can access own data"
  ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);
  ```
- **Time:** 2-3 hours
- **Owner:** [Database Admin]

### Phase 2 Deliverables
✅ Data access/export system working  
✅ Data deletion system implemented  
✅ Consent preference center live  
✅ RLS configured for data security  

---

## Phase 3: Business Process (Week 5-8) 📋

### What We're Doing
Setting up organizational processes and paperwork for compliance.

### Tasks

#### 3.1 Create Data Processing Agreements (DPA)
- [ ] Contact Supabase for their DPA
  - Document: [Save Supabase DPA when received]
  - Ensure Standard Contractual Clauses (SCCs) in place
  - Confirm EU data centers used
- [ ] Contact other service providers:
  - Email service (if used)
  - Analytics provider
  - Payment processor (if applicable)
- [ ] Create record of all data processors
- **Time:** 4-5 hours (includes correspondence wait time)
- **Owner:** [Legal/Admin]

#### 3.2 Data Retention Policy
- [ ] Define retention periods:
  - User accounts: [X months of inactivity]
  - Contact form submissions: [X months]
  - Analytics data: [X months]
  - Logs: [X months]
  - Backup data: [X months]
- [ ] Document in Privacy Policy
- [ ] Create automated deletion processes
- **Time:** 2-3 hours
- **Owner:** [Product/Admin]

#### 3.3 Breach Notification Procedure
- [ ] Create response plan:
  1. Identify and contain breach (immediate)
  2. Assess impact (within hours)
  3. Notify affected users (if data is at risk)
  4. Notify supervisory authority (within 72 hours)
- [ ] Create breach notification templates
- [ ] Document affected authority contact info
- **Time:** 2-3 hours
- **Owner:** [Security/Legal]

#### 3.4 Data Protection Officer (DPO) Decision
- [ ] Determine if DPO required:
  - Meridian processing small-to-medium amount of data
  - Likely answer: **Not required** (unless processing sensitive data)
- [ ] If not required: Document accountability measures
- [ ] If required: Designate DPO and publish contact
- **Time:** 1 hour
- **Owner:** [Legal/Leadership]

#### 3.5 Create Data Processing Register
- [ ] Document all data processing activities:
  - What data is collected
  - Why (legal basis)
  - Who can access it
  - How long it's kept
  - Who processes it
  - Security measures
- [ ] Store in shared documentation (GitHub or Google Drive)
- **Time:** 3-4 hours
- **Owner:** [Admin]

#### 3.6 Staff GDPR Training
- [ ] Create training module:
  - GDPR basics
  - Data handling procedures
  - User rights requests
  - Incident response
- [ ] Train all team members
- [ ] Document training completion
- **Time:** 2-4 hours (per person)
- **Owner:** [Leadership]

### Phase 3 Deliverables
✅ All Data Processing Agreements signed  
✅ Data retention policy documented  
✅ Breach notification procedure created  
✅ DPO status determined  
✅ Data processing register complete  
✅ Staff trained on GDPR  

---

## Phase 4: Ongoing Compliance (Continuous) 🔄

### What We're Doing
Maintaining and improving GDPR compliance over time.

### Tasks

#### 4.1 Quarterly Compliance Reviews
- [ ] Schedule: Every 3 months
- [ ] Review:
  - Data processing activities
  - User requests (access, deletion, etc.)
  - Any security incidents or near-misses
  - New data collection activities
  - Third-party processor updates
- [ ] Update documentation as needed

#### 4.2 Annual Privacy Impact Assessment (PIA)
- [ ] Once per year:
  - Review all data processing
  - Identify privacy risks
  - Evaluate existing safeguards
  - Recommend improvements

#### 4.3 Monitor Regulatory Updates
- [ ] Subscribe to:
  - EDPB.eu guidance updates
  - ICO.org.uk alerts (if UK focused)
  - Supabase security updates
  - Industry newsletters

#### 4.4 User Request Processing
- [ ] Establish SLA: Respond to all requests within 30 days
- [ ] Track metrics:
  - Number of requests per month
  - Types of requests
  - Response times
  - Common issues

#### 4.5 Security Audits
- [ ] Annual security audit
- [ ] Third-party penetration testing (recommended)
- [ ] Review access logs for suspicious activity

### Phase 4 Success Metrics
- ✅ 100% of data subject requests processed within 30 days
- ✅ Zero compliance violations
- ✅ All staff trained and staying current
- ✅ No data breaches (or rapid containment if they occur)

---

## Technical Implementation Checklist

### Frontend Changes
- [ ] Cookie consent banner component
- [ ] Consent preference center page (`/consent-preferences`)
- [ ] Data request form page (`/data-request`)
- [ ] Updated Privacy Policy
- [ ] Updated Terms of Service
- [ ] Updated Footer with legal links

### Backend/Database Changes
- [ ] API for data export
- [ ] API for data deletion
- [ ] Consent preference storage
- [ ] Data deletion audit logging
- [ ] Row-level security policies
- [ ] Rate limiting on sensitive endpoints

### Documentation
- [ ] Privacy Policy (GDPR sections)
- [ ] Cookie Policy
- [ ] Data Processing Agreements
- [ ] Data Retention Policy
- [ ] Breach Notification Procedure
- [ ] Data Processing Register
- [ ] Staff Training Materials

### Third-Party Integrations
- [ ] Supabase DPA verified
- [ ] Email service DPA verified
- [ ] Analytics tools configured for consent
- [ ] All processors documented

---

## Success Criteria

**Phase 1 (Week 1-2):**
- Privacy Policy updated and deployed
- Cookie banner showing on website
- Data request form accessible

**Phase 2 (Week 3-4):**
- Users can download their data
- Users can request data deletion
- Consent preferences working

**Phase 3 (Week 5-8):**
- All DPAs signed
- Retention policies documented
- Staff trained

**Phase 4 (Ongoing):**
- All user requests handled within 30 days
- Compliance maintained
- No violations detected

---

## Resources & Tools

| Task | Recommended Tool | Cost |
|------|-----------------|------|
| Cookie Consent | Cookiebot | $69-179/mo |
| Cookie Consent (OSS) | CookieConsent.js | Free |
| Privacy Policy | Termly or Iubenda | $50-200/mo |
| Data Processing | Spreadsheet + Version Control | Free |
| Staff Training | GDPR Academy | Free |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| User data breach | Low | Critical | Encryption, RLS, regular security audits |
| Missed data request deadline | Medium | High | Automated tracking system, clear SLA |
| Unauthorized data access | Low | Critical | RLS policies, access logs, staff training |
| Regulatory audit | Low | High | Maintain documentation, regular reviews |
| GDPR fine | Very Low | Critical | Comprehensive compliance program |

---

## Questions for Team

1. **Cookie Consent Tool:** Should we use a commercial service (Cookiebot) or build custom?
2. **Data Retention:** What are appropriate retention periods for different data types?
3. **DPO:** Do we need to designate a Data Protection Officer?
4. **Analytics:** Which analytics data do we need to collect? What can we reduce?
5. **Communications:** How should we communicate compliance to users?

---

**Next Steps:**
1. Confirm Phase 1 tasks and assign owners
2. Set timeline for Phase 1 completion
3. Review with legal counsel (if needed)
4. Begin Phase 1 implementation

**Document Version:** 1.0  
**Last Updated:** {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
