import React, { useState, useRef } from 'react';
import CryptoJS from 'crypto-js';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textToHide, setTextToHide] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [decryptedText, setDecryptedText] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');
  const [useDecryptPassword, setUseDecryptPassword] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setProcessedImage(null);
        setMessage('');
        setDecryptedText('');
      };
      reader.readAsDataURL(file);
    } else {
      setMessage('Please select a valid image file.');
    }
  };

  const encryptText = (text, password) => {
    if (password) {
      return CryptoJS.AES.encrypt(text, password).toString();
    }
    return text;
  };

  const decryptText = (encryptedText, password) => {
    try {
      if (password) {
        const bytes = CryptoJS.AES.decrypt(encryptedText, password);
        return bytes.toString(CryptoJS.enc.Utf8);
      }
      return encryptedText;
    } catch (error) {
      throw new Error('Invalid password or corrupted data');
    }
  };

  const hideTextInImage = () => {
    if (!selectedImage || !textToHide.trim()) {
      setMessage('Please select an image and enter text to hide.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Encrypt text if password is provided
      const textToEncode = usePassword ? encryptText(textToHide, password) : textToHide;
      
      // Convert text to binary
      const textBinary = textToEncode.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
      ).join('');
      
      // Add delimiter to mark end of text
      const delimiter = '00000000';
      const fullBinary = textBinary + delimiter;
      
      if (fullBinary.length > data.length / 4) {
        setMessage('Text is too long for this image. Please use a larger image or shorter text.');
        setIsProcessing(false);
        return;
      }
      
      // Hide text in least significant bits of red channel
      for (let i = 0; i < fullBinary.length; i++) {
        const pixelIndex = i * 4;
        const bit = parseInt(fullBinary[i]);
        
        // Clear the least significant bit and set it to our bit
        data[pixelIndex] = (data[pixelIndex] & 0xFE) | bit;
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to data URL
      const processedImageData = canvas.toDataURL('image/png');
      setProcessedImage(processedImageData);
      setMessage('Text successfully hidden in image!');
      setIsProcessing(false);
    };
    
    img.src = selectedImage;
  };

  const extractTextFromImage = () => {
    if (!selectedImage) {
      setMessage('Please select an image to extract text from.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Extract binary data from least significant bits
      let binaryData = '';
      for (let i = 0; i < data.length; i += 4) {
        const bit = data[i] & 1;
        binaryData += bit.toString();
        
        // Check for delimiter (8 consecutive zeros)
        if (binaryData.length >= 8) {
          const last8Bits = binaryData.slice(-8);
          if (last8Bits === '00000000') {
            break;
          }
        }
      }
      
      // Remove the delimiter
      binaryData = binaryData.slice(0, -8);
      
      if (binaryData.length === 0) {
        setMessage('No hidden text found in this image.');
        setIsProcessing(false);
        return;
      }
      
      // Convert binary to text
      let extractedText = '';
      for (let i = 0; i < binaryData.length; i += 8) {
        const byte = binaryData.slice(i, i + 8);
        if (byte.length === 8) {
          const charCode = parseInt(byte, 2);
          extractedText += String.fromCharCode(charCode);
        }
      }
      
      // Try to decrypt if password is provided
      if (useDecryptPassword && decryptPassword) {
        try {
          const decrypted = decryptText(extractedText, decryptPassword);
          setDecryptedText(decrypted);
          setMessage('Text successfully extracted and decrypted!');
        } catch (error) {
          setMessage('Failed to decrypt. Check your password.');
          setDecryptedText('');
        }
      } else {
        setDecryptedText(extractedText);
        setMessage('Text successfully extracted!');
      }
      
      setIsProcessing(false);
    };
    
    img.src = selectedImage;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'steganography-image.png';
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetApp = () => {
    setSelectedImage(null);
    setTextToHide('');
    setPassword('');
    setUsePassword(false);
    setProcessedImage(null);
    setMessage('');
    setDecryptedText('');
    setDecryptPassword('');
    setUseDecryptPassword(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Steganography App
          </h1>
          <p className="text-gray-600">
            Hide and extract secret messages within images using steganography
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('encrypt')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'encrypt'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Encrypt
            </button>
            <button
              onClick={() => setActiveTab('decrypt')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'decrypt'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Decrypt
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image Upload and Display */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-primary-600 hover:text-primary-500">
                          Click to upload
                        </span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </label>
                </div>
              </div>

              {selectedImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab === 'encrypt' ? 'Original Image' : 'Image to Decrypt'}
                  </label>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedImage} 
                      alt="Original" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'encrypt' && processedImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processed Image
                  </label>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Text Input and Controls */}
            <div className="space-y-4">
              {activeTab === 'encrypt' ? (
                // Encryption Mode
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text to Hide
                    </label>
                    <textarea
                      value={textToHide}
                      onChange={(e) => setTextToHide(e.target.value)}
                      placeholder="Enter the text you want to hide in the image..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="use-password"
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="use-password" className="ml-2 block text-sm text-gray-700">
                        Encrypt with password
                      </label>
                    </div>

                    {usePassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter encryption password..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={hideTextInImage}
                      disabled={!selectedImage || !textToHide.trim() || isProcessing}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? 'Processing...' : 'Hide Text in Image'}
                    </button>

                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        Download Image
                      </button>
                    )}
                  </div>
                </>
              ) : (
                // Decryption Mode
                <>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="use-decrypt-password"
                        checked={useDecryptPassword}
                        onChange={(e) => setUseDecryptPassword(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="use-decrypt-password" className="ml-2 block text-sm text-gray-700">
                        Decrypt with password
                      </label>
                    </div>

                    {useDecryptPassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={decryptPassword}
                          onChange={(e) => setDecryptPassword(e.target.value)}
                          placeholder="Enter decryption password..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={extractTextFromImage}
                      disabled={!selectedImage || isProcessing}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? 'Processing...' : 'Extract Text from Image'}
                    </button>
                  </div>

                  {decryptedText && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extracted Text
                      </label>
                      <textarea
                        value={decryptedText}
                        readOnly
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 resize-none"
                        placeholder="Extracted text will appear here..."
                      />
                    </div>
                  )}
                </>
              )}

              <button
                onClick={resetApp}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset
              </button>

              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">1. Upload Image</h3>
              <p>Select an image file (PNG, JPG, GIF) that you want to use to hide your message or extract text from.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">2. {activeTab === 'encrypt' ? 'Enter Text' : 'Extract Text'}</h3>
              <p>{activeTab === 'encrypt' ? 'Type the secret message you want to hide. Optionally encrypt it with a password for extra security.' : 'Click "Extract Text" to reveal hidden messages. Use password if the text was encrypted.'}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">3. {activeTab === 'encrypt' ? 'Download Result' : 'View Message'}</h3>
              <p>{activeTab === 'encrypt' ? 'The text is hidden in the image using steganography. Download the processed image to share your secret message.' : 'The hidden text is extracted and displayed. If encrypted, you\'ll need the correct password to decrypt it.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;