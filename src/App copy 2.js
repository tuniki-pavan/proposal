import React, { useState } from 'react';
import './App.css';

function App() {
  const [pwsText, setPwsText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [compliance, setCompliance] = useState(null);
  const [missingWords, setMissingWords] = useState([]);

  // This function extracts text wrapped in ** **
  const extractBoldWords = (text) => {
    const regex = /\*\*(.*?)\*\*/g;
    let matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1].trim()) {
        matches.push(match[1].trim());
      }
    }
    return matches;
  };

  // Check compliance by ensuring each bold word is present in the response text
  const checkCompliance = () => {
    const boldWords = extractBoldWords(pwsText);
    if (boldWords.length === 0) {
      setCompliance(100);
      setMissingWords([]);
      return;
    }

    // Find any bold words that do not appear in the response (case-insensitive)
    let missing = boldWords.filter(word => {
      return !responseText.toLowerCase().includes(word.toLowerCase());
    });
    
    const compliantPercentage = ((boldWords.length - missing.length) / boldWords.length) * 100;
    setCompliance(compliantPercentage);
    setMissingWords(missing);
  };

  return (
    <div className="container">
      <div className="screen">
        <div className="left">
          <h2>PWS Section (Input)</h2>
          <textarea
            value={pwsText}
            onChange={(e) => setPwsText(e.target.value)}
            placeholder="Enter PWS text here. Use **bold** to mark required words."
            rows={15}
            cols={40}
          />
        </div>
        <div className="right">
          <h2>Response Section</h2>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Enter response text here..."
            rows={15}
            cols={40}
          />
        </div>
      </div>
      <button onClick={checkCompliance}>Check Compliance</button>

      {compliance !== null && (
        <div className="result">
          {compliance === 100 
            ? <p style={{ color: 'green' }}>100% Compliant</p>
            : (
              <p style={{ color: 'red' }}>
                Compliance Level: {compliance.toFixed(2)}%<br />
                Missing: {missingWords.join(', ')}
              </p>
            )
          }
        </div>
      )}
    </div>
  );
}

export default App;
