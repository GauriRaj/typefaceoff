import '../styles/App.css';
import FontUploader from './FontUploader';
import FontPreview from './FontPreview';
import { BsGithub } from 'react-icons/bs';
import { useState } from 'react';
import { proofingText, opentypeText } from './constants';
import opentype from 'opentype.js';
import FontFeaturesSetting from './FontFeaturesSetting';
import GoogleFontLoader from './GoogleFontLoader';

function App() {
  // State for the selected font on the left
  const [selectedFontLeft, setSelectedFontLeft] = useState<File | null>(null);

  // State for the google font declarations on the left
  const [googleFontLeft, setGoogleFontLeft] = useState<string | null>(null);

  // State for the selected font on the right
  const [selectedFontRight, setSelectedFontRight] = useState<File | null>(null);

  // State for the google font declarations on the right
  const [googleFontRight, setGoogleFontRight] = useState<string | null>(null);

  // State for the line height on the right
  const [lineHeightRight, setLineHeightRight] = useState<number>(1.5);

  // State for the line height on the left
  const [lineHeightLeft, setLineHeightLeft] = useState<number>(1.5);

  // Opentype feature option names from the gsub table of the font file on the left
  const [fontFeatureOptionsLeft, setFontFeatureOptionsLeft] = useState<string[]>([]);

  // Opentype feature option names from the gsub table of the font file on the right
  const [fontFeatureOptionsRight, setFontFeatureOptionsRight] = useState<string[]>([]);

  //Opentype feature current on/off settings for left font, initialised to all off
  const [fontSettingsLeft, setFontSettingsLeft] = useState<boolean[]>([]);

  //Opentype feature current on/off settings for false font, initialised to all off
  const [fontSettingsRight, setFontSettingsRight] = useState<boolean[]>([]);

  const handleFontSettingChangeLeft = (newSettings: boolean[]) => {
    setFontSettingsLeft(newSettings);
  };

  const handleFontSettingChangeRight = (newSettings: boolean[]) => {
    setFontSettingsRight(newSettings);
  };

  const handleFontSelected = (selectedFont: File | null, side: string) => {
    if (selectedFont != null) {
      const buffer = selectedFont.arrayBuffer();
      buffer.then((data) => {
        const otfFont = opentype.parse(data);
        const featureNames: string[] = Array.from(
          new Set(otfFont.tables.gsub.features.map((f: { tag: string }) => f.tag))
        ).map((name: unknown) => String(name));
        const featureSettings: boolean[] = featureNames.map(() => false);

        if (side === 'left') {
          setFontFeatureOptionsLeft(featureNames);
          setFontSettingsLeft(featureSettings);
        }
        if (side === 'right') {
          setFontFeatureOptionsRight(featureNames);
          setFontSettingsRight(featureSettings);
        }
      });
    }
  };

  // Handler for when a font is selected on the left side
  const handleFontSelectedLeft = (selectedFont: File | null) => {
    setSelectedFontLeft(selectedFont);
    setGoogleFontLeft(null);
    handleFontSelected(selectedFont, 'left');
  };

  // Handler for when a font is selected on the right side
  const handleFontSelectedRight = (selectedFont: File | null) => {
    setSelectedFontRight(selectedFont);
    setGoogleFontRight(null);
    handleFontSelected(selectedFont, 'right');
  };

  // Handler for when left Google font form is submitted
  const handleGoogleFontLeft = (fontData: string | null) => {
    setSelectedFontLeft(null);
    setGoogleFontLeft(fontData);
    // Clear features and options for Google fonts (not supported).
    setFontFeatureOptionsLeft([]);
    setFontSettingsLeft([]);
  };

  // Handler for when right Google font form is submitted
  const handleGoogleFontRight = (fontData: string | null) => {
    setSelectedFontRight(null);
    setGoogleFontRight(fontData);
    // Clear features and options for Google fonts (not supported).
    setFontFeatureOptionsLeft([]);
    setFontSettingsLeft([]);
  };

  // Handles page print
  const handlePrint = () => {
    const css = '@page { size: A3 landscape; margin: 0; }',
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    style.media = 'print';
    if ('styleSheet' in style) {
      const styleSheet = style.sheet as CSSStyleSheet;
      styleSheet.insertRule(css, styleSheet.cssRules.length);
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
    window.print();
  };

  // Event handler to set a common text for all proof elements
  const setText = (text: string) => {
    const all = document.getElementsByClassName('proof');
    for (const elem of all) {
      elem.textContent = text;
    }
  };

  return (
    <div className="app">
      <header>
        <h1 className="title">Welcome to Typefaceoff!</h1>
        <p className="subtitle">
          Get started by dropping two font files, or by loading Google fonts.
        </p>
        <button className="button" onClick={() => setText(proofingText)}>
          Alice in Wonderland
        </button>
        <button className="button" onClick={() => setText(opentypeText)}>
          Quick Brown Fox
        </button>
        <button
          className="button"
          onClick={() => {
            handlePrint();
          }}
        >
          Save previews as PDF
        </button>
        <select className="dropdown">
          <option value="Paragraph">Paragraph</option>
          <option value="Article">Article</option>
          <option value="Research Paper">Research Paper</option>
        </select>
      </header>
      <main>
        {/* Left side */}
        <section className="side-container">
          <div className="font-uploader">
            <FontUploader onFontSelected={handleFontSelectedLeft} />
          </div>
          <div className="font-uploader">
            <GoogleFontLoader onFontLoaded={handleGoogleFontLeft} />
          </div>
          <div className="line-height-adjustment">
            <label htmlFor="lineHeightInputLeft">Line spacing: </label>
            <input
              className="lineHeightInput"
              type="number"
              id="lineHeightInputLeft"
              value={lineHeightLeft}
              min={0.95}
              max={1.9}
              step={0.05}
              onChange={(e) => setLineHeightLeft(parseFloat(e.target.value))}
            />
          </div>
          <div className="font-features">
            <p>Font features detected: {fontFeatureOptionsLeft.toString()}</p>
          </div>
          <div className="font-feature-checkboxes-container-left">
            {
              <FontFeaturesSetting
                fontFeatureOptions={fontFeatureOptionsLeft}
                fontSettings={fontSettingsLeft}
                fontSettingHandler={handleFontSettingChangeLeft}
              />
            }
          </div>
          <div className="font-preview">
            {
              <FontPreview
                fontFile={selectedFontLeft}
                googleFontData={googleFontLeft}
                side="left"
                lineHeight={lineHeightLeft}
                fontFeatureOptions={fontFeatureOptionsLeft}
                fontSettings={fontSettingsLeft}
              />
            }
          </div>
        </section>

        {/* Right side */}
        <section className="side-container">
          <div className="font-uploader">
            <FontUploader onFontSelected={handleFontSelectedRight} />
          </div>
          <div className="font-uploader">
            <GoogleFontLoader onFontLoaded={handleGoogleFontRight} />
          </div>
          <div className="line-height-adjustment">
            <label htmlFor="lineHeightInputRight">Line spacing: </label>
            <input
              className="lineHeightInput"
              type="number"
              id="lineHeightInputRight"
              value={lineHeightRight}
              min={0.95}
              max={1.9}
              step={0.05}
              onChange={(e) => setLineHeightRight(parseFloat(e.target.value))}
            />
          </div>
          <div className="font-features">
            <p>Font features detected: {fontFeatureOptionsRight.toString()}</p>
          </div>
          <div className="font-feature-checkboxes-container-Right">
            {
              <FontFeaturesSetting
                fontFeatureOptions={fontFeatureOptionsRight}
                fontSettings={fontSettingsRight}
                fontSettingHandler={handleFontSettingChangeRight}
              />
            }
          </div>
          <div className="font-preview">
            {
              <FontPreview
                fontFile={selectedFontRight}
                googleFontData={googleFontRight}
                side="right"
                lineHeight={lineHeightRight}
                fontFeatureOptions={fontFeatureOptionsRight}
                fontSettings={fontSettingsRight}
              />
            }
          </div>
        </section>
      </main>
      <footer>
        <p className="footer-text">
          Typefaceoff takes font licensing seriously. It works locally in your browser meaning your
          fonts stay on your device and aren’t uploaded anywhere.{' '}
        </p>
        <a href="https://github.com/typefaceoff/typefaceoff" target="_blank">
          <BsGithub className="github-icon" />
        </a>
      </footer>
    </div>
  );
}

export default App;
