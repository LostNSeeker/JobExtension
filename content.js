// Content script - Runs on all web pages to detect and fill forms

console.log('JobAppy content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillForm().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, message: error.message });
    });
    return true; // Keep message channel open for async response
  }
});

// Auto-detect forms on page load (if enabled)
chrome.storage.local.get(['autoDetect'], (data) => {
  if (data.autoDetect) {
    detectForms();
  }
});

// Detect forms on the page
function detectForms() {
  const forms = document.querySelectorAll('form');
  if (forms.length > 0) {
    console.log(`JobAppy: Found ${forms.length} form(s) on page`);
  }
}

// Main function to fill the form
async function fillForm() {
  try {
    // Get stored data
    const data = await chrome.storage.local.get(['apiKey', 'model', 'answers', 'cvData']);
    
    if (!data.apiKey) {
      throw new Error('Please configure your OpenAI API key in extension settings');
    }
    
    if (!data.answers && !data.cvData) {
      throw new Error('Please add your answers or CV data in extension settings');
    }
    
    // Find all form fields
    const formFields = findFormFields();
    
    if (formFields.length === 0) {
      throw new Error('No form fields found on this page');
    }
    
    console.log(`Found ${formFields.length} form fields to process`);
    
    // Analyze fields and get answers from ChatGPT
    const fieldMappings = await analyzeAndMatch(formFields, data);
    
    // Fill the fields
    let filledCount = 0;
    for (const mapping of fieldMappings) {
      if (mapping.answer && mapping.element) {
        fillField(mapping.element, mapping.answer);
        filledCount++;
      }
    }
    
    return { success: true, fieldsCount: filledCount };
    
  } catch (error) {
    console.error('JobAppy error:', error);
    throw error;
  }
}

// Find all form fields on the page
function findFormFields() {
  const fields = [];
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="number"]',
    'input[type="url"]',
    'input:not([type])',
    'textarea',
    'select'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      // Skip hidden fields and disabled fields
      if (element.offsetParent === null || element.disabled) {
        return;
      }
      
      const fieldInfo = extractFieldInfo(element);
      fields.push(fieldInfo);
    });
  });
  
  // Also check for radio buttons and checkboxes
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(element => {
    if (element.offsetParent !== null && !element.disabled) {
      const fieldInfo = extractFieldInfo(element);
      fields.push(fieldInfo);
    }
  });
  
  return fields;
}

// Extract information about a field
function extractFieldInfo(element) {
  const info = {
    element: element,
    type: element.type || element.tagName.toLowerCase(),
    name: element.name || '',
    id: element.id || '',
    placeholder: element.placeholder || '',
    label: '',
    ariaLabel: element.getAttribute('aria-label') || '',
    value: element.value || '',
    required: element.required || false,
    options: []
  };
  
  // Find associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      info.label = label.textContent.trim();
    }
  }
  
  // If no label found, try to find nearby label
  if (!info.label) {
    const parent = element.closest('label');
    if (parent) {
      info.label = parent.textContent.replace(element.value, '').trim();
    } else {
      // Look for previous sibling label or nearby text
      let prev = element.previousElementSibling;
      if (prev && prev.tagName === 'LABEL') {
        info.label = prev.textContent.trim();
      } else {
        // Try to get text from parent
        const parentText = element.parentElement?.textContent.trim();
        if (parentText && parentText.length < 200) {
          info.label = parentText;
        }
      }
    }
  }
  
  // Get options for select/radio/checkbox
  if (element.tagName === 'SELECT') {
    info.options = Array.from(element.options).map(opt => ({
      value: opt.value,
      text: opt.textContent.trim()
    }));
  }
  
  return info;
}

// Analyze fields and match with answers using ChatGPT
async function analyzeAndMatch(fields, data) {
  // Prepare field descriptions for ChatGPT
  const fieldDescriptions = fields.map((field, index) => ({
    index: index,
    type: field.type,
    name: field.name,
    id: field.id,
    label: field.label,
    placeholder: field.placeholder,
    ariaLabel: field.ariaLabel,
    required: field.required,
    options: field.options.slice(0, 10) // Limit options to keep prompt size manageable
  }));
  
  // Send to background script for ChatGPT processing
  const response = await chrome.runtime.sendMessage({
    action: 'matchFields',
    fields: fieldDescriptions,
    answers: data.answers,
    cvData: data.cvData,
    apiKey: data.apiKey,
    model: data.model || 'gpt-4o-mini'
  });
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to process with ChatGPT');
  }
  
  // Map responses back to elements
  const mappings = response.mappings.map(mapping => ({
    element: fields[mapping.index]?.element,
    answer: mapping.answer,
    confidence: mapping.confidence
  }));
  
  return mappings;
}

// Fill a specific field with a value
function fillField(element, value) {
  if (!element || !value) return;
  
  try {
    const tagName = element.tagName.toLowerCase();
    const type = element.type ? element.type.toLowerCase() : '';
    
    if (tagName === 'select') {
      // For select dropdowns, try to match the value or text
      const options = Array.from(element.options);
      const matchedOption = options.find(opt => 
        opt.value.toLowerCase() === value.toLowerCase() ||
        opt.textContent.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchedOption) {
        element.value = matchedOption.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (type === 'radio') {
      // For radio buttons, check if value matches
      const valueLower = value.toLowerCase();
      if (element.value.toLowerCase().includes(valueLower) ||
          element.labels?.[0]?.textContent.toLowerCase().includes(valueLower)) {
        element.checked = true;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (type === 'checkbox') {
      // For checkboxes, check if should be checked
      const shouldCheck = ['yes', 'true', '1', 'check', 'checked'].includes(value.toLowerCase());
      element.checked = shouldCheck;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // For text inputs, textareas, etc.
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Highlight filled field briefly
    const originalBorder = element.style.border;
    element.style.border = '2px solid #38ef7d';
    setTimeout(() => {
      element.style.border = originalBorder;
    }, 1000);
    
  } catch (error) {
    console.error('Error filling field:', error);
  }
}

// Add visual indicator when extension is active
function showIndicator(message) {
  const indicator = document.createElement('div');
  indicator.id = 'jobappy-indicator';
  indicator.textContent = message;
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
  `;
  
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    indicator.remove();
  }, 3000);
}

