// Tab functionality
document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Load saved data on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get(['apiKey', 'model', 'autoDetect', 'answers', 'cvData']);
  
  if (data.apiKey) document.getElementById('apiKey').value = data.apiKey;
  if (data.model) document.getElementById('model').value = data.model;
  if (data.autoDetect) document.getElementById('autoDetect').checked = data.autoDetect;
  if (data.answers) document.getElementById('answersJson').value = JSON.stringify(data.answers, null, 2);
  if (data.cvData) document.getElementById('cvText').value = data.cvData;
});

// Save configuration
document.getElementById('saveConfig').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value;
  const model = document.getElementById('model').value;
  const autoDetect = document.getElementById('autoDetect').checked;
  
  if (!apiKey) {
    showStatus('Please enter your OpenAI API key', 'error');
    return;
  }
  
  await chrome.storage.local.set({ apiKey, model, autoDetect });
  showStatus('Configuration saved successfully!', 'success');
});

// Load default answers from questions file
document.getElementById('loadDefaultAnswers').addEventListener('click', () => {
  const defaultAnswers = {
    // Basic Information
    "fullName": "Your Full Name",
    "email": "your.email@example.com",
    "phone": "+1234567890",
    "address": "Your Current Address",
    "city": "Your City",
    "state": "Your State",
    "zipCode": "Your ZIP/Postal Code",
    "country": "Your Country",
    "dateOfBirth": "YYYY-MM-DD",
    "nationality": "Your Nationality",
    
    // Personal Preferences
    "gender": "Prefer not to say",
    "pronouns": "He/Him, She/Her, or They/Them",
    "languages": "English (Fluent), Spanish (Conversational)",
    "preferredLocations": "San Francisco, New York, Remote",
    "officePreference": "Hybrid",
    "willingToRelocate": "Yes",
    
    // Employment Details
    "currentEmploymentStatus": "Employed",
    "noticePeriod": "2 weeks",
    "employmentType": "Full-time",
    "earliestStartDate": "2024-01-15",
    "availableStartDate": "YYYY-MM-DD",
    "internshipStartDate": "YYYY-MM-DD",
    "internshipEndDate": "YYYY-MM-DD",
    "preferredWorkSchedule": "Flexible",
    "reliableTransportation": "Yes",
    "willingToWorkWeekendsHolidays": "Sometimes",
    "availableShifts": "Day shift",
    
    // Professional Links
    "linkedinUrl": "https://linkedin.com/in/yourprofile",
    "portfolioUrl": "https://yourportfolio.com",
    "githubUrl": "https://github.com/yourusername",
    "websiteUrl": "https://yourwebsite.com",
    
    // Education & Experience
    "workAuthorization": "Authorized to work in [Country]",
    "education": "Bachelor's/Master's in [Field]",
    "university": "Your University Name",
    "graduationYear": "2023",
    "gpa": "3.5/4.0",
    "major": "Computer Science",
    "relevantCoursework": "Data Structures, Algorithms, Machine Learning, Web Development",
    "certifications": "AWS Certified, Google Analytics Certified",
    "workExperience": "3 years as Software Engineer at TechCorp, developed scalable web applications",
    "previousEmployer": "Company Name",
    "yearsOfExperience": "3 years",
    "skills": "Python, JavaScript, React, Node.js, AWS, Docker, Git, Agile",
    "technicalSkills": "Python, Java, SQL, React",
    "softSkills": "Communication, Leadership, Problem-solving, Teamwork",
    
    // Motivational Questions
    "achievement": "Led a team project that increased efficiency by 40%",
    "whyCompany": "I'm excited about your company's mission to innovate in [field] and the opportunity to work with cutting-edge technology",
    "whyRole": "This role aligns perfectly with my skills in [X] and my passion for [Y]",
    "careerGoals": "I see myself as a senior technical lead, mentoring teams and architecting scalable solutions",
    "expectations": "I hope to gain hands-on experience in [technology/field] and contribute to meaningful projects",
    "howDidYouHear": "LinkedIn job posting",
    "challenge": "Faced a critical production bug; debugged systematically, implemented fix and monitoring to prevent recurrence",
    "strengthsWeaknesses": "Strengths: Quick learner, strong problem-solving. Weakness: Sometimes too detail-oriented, working on delegation",
    
    // Compensation & Availability
    "salaryExpectations": "$80,000 - $100,000 or Negotiable",
    "currentSalary": "Prefer not to disclose",
    "availability": "Yes, available for the full duration",
    "hoursPerWeek": "40 hours",
    
    // Accommodations & Accessibility
    "accommodations": "No special accommodations needed",
    "reasonableAccommodations": "No",
    "disability": "Prefer not to say",
    
    // US-Specific
    "legallyAuthorizedUS": "Yes",
    "requireSponsorship": "No",
    "protectedVeteran": "No",
    "veteransPreference": "No",
    "armedForcesService": "No",
    "ethnicity": "Prefer not to say",
    "race": "Prefer not to say",
    
    // UAE-Specific
    "uaeResidenceVisa": "Yes/No",
    "uaeSponsorship": "Yes/No",
    "uaeMedicalFitness": "Yes",
    "uaeQualificationsAttestation": "Yes",
    "uaeHealthInsurance": "Yes",
    "uaeGccNational": "No",
    
    // EU-Specific
    "euCitizen": "Yes/No",
    "euWorkPermit": "Yes/No - specify if needed",
    "euBlueCard": "No",
    "euShortageOccupation": "No",
    "euRecognizedQualifications": "Yes",
    "euEmployerSponsorship": "No",
    "euFamilyReunification": "No"
  };
  
  document.getElementById('answersJson').value = JSON.stringify(defaultAnswers, null, 2);
  showStatus('Default answer template loaded. Please customize with your information.', 'info');
});

// Save answers
document.getElementById('saveAnswers').addEventListener('click', async () => {
  const answersText = document.getElementById('answersJson').value;
  
  try {
    const answers = JSON.parse(answersText);
    await chrome.storage.local.set({ answers });
    showStatus('Answers saved successfully!', 'success');
  } catch (error) {
    showStatus('Invalid JSON format. Please check your syntax.', 'error');
  }
});

// Save CV data
document.getElementById('saveCv').addEventListener('click', async () => {
  const cvData = document.getElementById('cvText').value;
  
  if (!cvData.trim()) {
    showStatus('Please enter your CV data', 'error');
    return;
  }
  
  await chrome.storage.local.set({ cvData });
  showStatus('CV data saved successfully!', 'success');
});

// Fill form on current page
document.getElementById('fillForm').addEventListener('click', async () => {
  showStatus('Analyzing form and filling fields...', 'info');
  
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send message to content script to start filling
  chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Error: Please refresh the page and try again', 'error');
      return;
    }
    
    if (response && response.success) {
      showStatus(`Successfully filled ${response.fieldsCount} fields!`, 'success');
    } else {
      showStatus(response?.message || 'Failed to fill form', 'error');
    }
  });
});

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 3000);
  }
}

