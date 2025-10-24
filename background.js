// Background service worker - Handles ChatGPT API calls

console.log('JobAppy background service worker started');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'matchFields') {
    matchFieldsWithChatGPT(request)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

// Use ChatGPT to intelligently match form fields with answers
async function matchFieldsWithChatGPT(request) {
  const { fields, answers, cvData, apiKey, model } = request;
  
  try {
    // Prepare the prompt for ChatGPT
    const systemPrompt = `You are an intelligent form-filling assistant. Your job is to match form fields with appropriate answers from the user's provided data.

You will receive:
1. A list of form fields with their metadata (labels, names, placeholders, etc.)
2. Predefined answers in JSON format
3. CV/Resume text

Your task is to:
- Analyze each form field and determine what information it's asking for
- Match it with the most appropriate answer from the provided data
- If the exact answer isn't available, intelligently generate one based on the CV data and context
- For dropdowns/select fields, choose the most appropriate option from the available options
- For yes/no questions or checkboxes, provide "yes" or "no" based on the context
- Return ONLY a JSON array with the format specified below

Return format (JSON only, no additional text):
[
  {
    "index": 0,
    "answer": "the answer text",
    "confidence": 0.95
  },
  ...
]

Where:
- index: matches the field index from input
- answer: the answer to fill in (or "skip" if you can't determine appropriate answer)
- confidence: your confidence level (0.0 to 1.0)

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation, no additional text.`;

    const userPrompt = `Form Fields:
${JSON.stringify(fields, null, 2)}

Predefined Answers:
${JSON.stringify(answers || {}, null, 2)}

CV/Resume Data:
${cvData || 'No CV data provided'}

Please analyze and provide answers for each field.`;

    // Make API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the response
    let mappings;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      if (content.includes('```')) {
        jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      mappings = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', content);
      throw new Error('Invalid response format from ChatGPT');
    }
    
    // Filter out fields that should be skipped
    mappings = mappings.filter(m => m.answer && m.answer.toLowerCase() !== 'skip');
    
    return {
      success: true,
      mappings: mappings
    };
    
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('JobAppy extension installed');
    // Open options page on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  }
});

