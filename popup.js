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
    "fullName": "Your Full Name",
    "email": "your.email@example.com",
    "phone": "+1234567890",
    "address": "Your Current Address",
    "nationality": "Your Nationality",
    "workAuthorization": "Authorized to work in [Country]",
    "education": "Bachelor's/Master's in [Field]",
    "relevantCoursework": "List your relevant courses and projects",
    "certifications": "List your certifications",
    "workExperience": "Describe your previous work/internship experience",
    "skills": "List your technical and soft skills",
    "achievement": "Your most significant achievement",
    "whyCompany": "Why you want to work for this company",
    "whyRole": "Why you're interested in this role",
    "careerGoals": "Where you see yourself in 5 years",
    "expectations": "What you hope to gain from this opportunity",
    "availability": "Yes/Your availability dates",
    "howDidYouHear": "How you heard about this opportunity",
    "accommodations": "No/Describe if needed",
    "salaryExpectations": "Your salary range or 'Negotiable'",
    "challenge": "Describe a challenge you overcame",
    "strengthsWeaknesses": "Your strengths and weaknesses",
    "legallyAuthorizedUS": "Yes/No",
    "requireSponsorship": "Yes/No",
    "protectedVeteran": "No/Yes with details",
    "disability": "Prefer not to say/No/Yes",
    "veteransPreference": "No/Yes",
    "armedForcesService": "No/Yes",
    "reasonableAccommodations": "No/Yes with details",
    "uaeResidenceVisa": "Yes/No",
    "uaeSponsorship": "Yes/No",
    "uaeMedicalFitness": "Yes/No",
    "uaeQualificationsAttestation": "Yes/No",
    "uaeHealthInsurance": "Yes/No",
    "uaeGccNational": "Yes/No",
    "euCitizen": "Yes/No",
    "euWorkPermit": "Yes/No - specify",
    "euBlueCard": "Yes/No",
    "euShortageOccupation": "Yes/No",
    "euRecognizedQualifications": "Yes/No",
    "euEmployerSponsorship": "Yes/No",
    "euFamilyReunification": "No/Yes with details"
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

