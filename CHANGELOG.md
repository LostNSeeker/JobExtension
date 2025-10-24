# JobAppy - Changelog

## Version 1.1.0 - Enhanced Field Support

### ✨ New Features Added

#### Additional Question Types Supported
Added support for 70+ total questions including:

**Personal Information & Preferences:**
- Gender (with proper dropdown matching)
- Date of birth
- Languages spoken (with proficiency levels)
- Preferred work locations
- Office/work preference (Remote, Hybrid, In-office)
- Earliest start date / availability dates
- Willing to relocate
- Preferred pronouns

**Employment Details:**
- Current employment status
- Notice period
- Full-time vs Part-time preference
- Preferred work schedule
- Reliable transportation
- Weekend/holiday availability
- Shift preferences
- Professional profile URLs (LinkedIn, Portfolio, GitHub)

**Enhanced Education & Experience:**
- University name
- Graduation year
- GPA
- Major/field of study
- Technical vs soft skills separation
- Years of experience
- Previous employer details

**Additional Fields:**
- Current salary
- Hours per week availability
- Ethnicity/race (self-identification)
- More comprehensive accommodation questions

### 🔧 Technical Improvements

#### Dropdown Handling
Enhanced `content.js` with 4-tier matching strategy for select dropdowns:
1. **Exact value match** - Matches the option's value attribute
2. **Exact text match** - Matches the option's display text
3. **Partial text match** - For longer option texts with descriptions
4. **Fuzzy matching** - Handles common variations:
   - Gender: male/m/man, female/f/woman
   - Work preference: remote/wfh, hybrid/flexible, onsite/office
   - Yes/No: yes/y/agree, no/n/disagree

#### Date Field Support
- Added support for `input[type="date"]`, `datetime-local`, `month`, `week`, `time`
- Automatic date format conversion to YYYY-MM-DD
- Handles various date input formats

#### Enhanced Field Detection
- Better visual feedback (green border + background highlight)
- Extended highlight duration to 1.5 seconds
- Added `blur` event for React/Vue compatibility
- Better handling of custom components

#### Improved ChatGPT Prompts
Updated `background.js` system prompt with:
- Specific instructions for dropdown matching
- Date formatting guidelines (YYYY-MM-DD)
- Gender and work preference examples
- Language proficiency format examples
- More concise answer generation

### 📝 Updated Templates

#### Default Answers Template
Expanded from ~30 to 90+ fields organized in sections:
- Basic Information (10 fields)
- Personal Preferences (7 fields)
- Employment Details (11 fields)
- Professional Links (4 fields)
- Education & Experience (14 fields)
- Motivational Questions (8 fields)
- Compensation & Availability (4 fields)
- Accommodations & Accessibility (3 fields)
- Regional Questions (18+ fields for US/UAE/EU)

### 📚 Documentation Updates

#### questions-reference.md
- Added 20 new common questions (now 70+ total)
- Organized into clear sections
- Added dropdown option examples

#### Enhanced Answer Examples
All templates now include realistic examples with:
- Proper date formats
- Complete location preferences
- Language proficiency levels
- Professional URL formats

---

## Version 1.0.0 - Initial Release

### Core Features
- AI-powered form field matching using ChatGPT
- Support for text inputs, textareas, selects, radio, checkbox
- Secure local storage for answers and CV data
- Beautiful modern UI with 3-tab interface
- Comprehensive documentation

---

## Future Enhancements

Planned for upcoming versions:
- [ ] Multi-profile support (different answer sets for different job types)
- [ ] Better iframe form detection
- [ ] Auto-save draft answers
- [ ] Form field pre-fill detection (skip already filled fields)
- [ ] Success rate tracking and analytics
- [ ] Export/import answer configurations
- [ ] Firefox browser support
- [ ] Cover letter generation from job description

