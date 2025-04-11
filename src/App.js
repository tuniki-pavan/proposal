// App.js
import React, { useState } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css';

function App() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [responseText, setResponseText] = useState('');
  const [compliance, setCompliance] = useState(null);
  const [missingWords, setMissingWords] = useState([]);

  // Update the editor state on every change.
  const onChange = (newState) => {
    setEditorState(newState);
  };

  // Handle key commands (e.g., Ctrl+B)
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Toggle bold formatting via button click.
  const toggleBold = (e) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  // Extract all text segments that were marked as bold in the Draft.js editor.
  const extractBoldWords = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const boldWordsSet = new Set();

    rawContent.blocks.forEach((block) => {
      const { text, inlineStyleRanges } = block;
      inlineStyleRanges.forEach((range) => {
        if (range.style === 'BOLD') {
          const boldText = text.substr(range.offset, range.length).trim();
          if (boldText) {
            boldWordsSet.add(boldText);
          }
        }
      });
    });

    return Array.from(boldWordsSet);
  };

  // Check if each bold word is included in the response (case-insensitive)
  const checkCompliance = () => {
    const boldWords = extractBoldWords();
    if (boldWords.length === 0) {
      setCompliance(100);
      setMissingWords([]);
      return;
    }
    const missing = boldWords.filter((word) =>
      !responseText.toLowerCase().includes(word.toLowerCase())
    );
    const compliantPercentage =
      ((boldWords.length - missing.length) / boldWords.length) * 100;
    setCompliance(compliantPercentage);
    setMissingWords(missing);
  };

  return (
    <div className="container">
      <div className="screen">
        <div className="left">
          <h2>PWS Section (Rich Text Input)</h2>
          <div className="editorContainer">
            <Editor
              editorState={editorState}
              onChange={onChange}
              handleKeyCommand={handleKeyCommand} // Enable Ctrl+B handling
              placeholder="Type PWS content here..."
            />
          </div>
          {/* Bold button toggles bold style on selected text */}
          <button onMouseDown={toggleBold}>Bold</button>
        </div>
        <div className="right">
          <h2>Response Section</h2>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={15}
            cols={40}
            placeholder="Enter response text here..."
          />
        </div>
      </div>
      <button onClick={checkCompliance}>Check Compliance</button>
      {compliance !== null && (
        <div className="result">
          {compliance === 100 ? (
            <p style={{ color: 'green' }}>100% Compliant</p>
          ) : (
            <p style={{ color: 'red' }}>
              Compliance Level: {compliance.toFixed(2)}%<br />
              Missing: {missingWords.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
