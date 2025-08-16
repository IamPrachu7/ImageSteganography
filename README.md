# 🔐 Steganography App

A modern web application built with React and Tailwind CSS that allows users to hide and extract secret messages within images using steganography techniques.

## ✨ Features

- **🔒 Text Hiding**: Hide secret messages within images using LSB (Least Significant Bit) steganography
- **🔓 Text Extraction**: Extract hidden messages from images
- **🔐 Password Encryption**: Optional AES encryption for extra security
- **📱 Responsive Design**: Modern UI that works on desktop and mobile
- **🎨 Beautiful Interface**: Clean, intuitive design with Tailwind CSS
- **📥 Download Support**: Download processed images as PNG files
- **⚡ Real-time Processing**: Instant image processing with canvas API

## 🚀 Live Demo

[View the live application](https://your-github-username.github.io/steganography-app)

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **CryptoJS** - JavaScript library for encryption/decryption
- **HTML5 Canvas** - Image processing and manipulation
- **File API** - File upload and download functionality

## 📦 Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/steganography-app.git
   cd steganography-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Encryption (Hiding Text)

1. **Upload an Image**: Click the upload area or drag & drop an image file
2. **Enter Text**: Type the secret message you want to hide
3. **Optional Password**: Check "Encrypt with password" for extra security
4. **Process**: Click "Hide Text in Image" to embed the message
5. **Download**: Click "Download Image" to save the processed image

### Decryption (Extracting Text)

1. **Upload Image**: Select an image that contains hidden text
2. **Optional Password**: If the text was encrypted, enter the password
3. **Extract**: Click "Extract Text from Image" to reveal the message
4. **View Result**: The hidden text will appear in the text area

## 🔧 How It Works

### Steganography Technique

The app uses **LSB (Least Significant Bit)** steganography:

1. **Binary Conversion**: Text is converted to binary (8 bits per character)
2. **Pixel Modification**: The least significant bit of each red channel pixel is modified
3. **Data Embedding**: Binary data is embedded in the image pixels
4. **Delimiter**: A special delimiter marks the end of the hidden data

### Security Features

- **AES Encryption**: Optional password-based encryption using CryptoJS
- **Error Handling**: Robust error handling for corrupted or invalid data
- **Validation**: Input validation for file types and data integrity

## 📁 Project Structure

```
steganography-app/
├── public/
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   └── favicon.ico         # App icon
├── src/
│   ├── App.js             # Main React component
│   ├── index.js           # React entry point
│   └── index.css          # Tailwind CSS imports
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── README.md             # This file
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

1. **Add homepage to package.json**:
   ```json
   {
     "homepage": "https://IamPrachu7.github.io/steganography-app"
   }
   ```

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts to package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the beautiful styling system
- **CryptoJS** for the encryption functionality
- **HTML5 Canvas API** for image processing capabilities

## 📞 Support

If you have any questions or issues, please:

1. Check the [Issues](https://github.com/IamPrachu7/steganography-app/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact the maintainer for urgent issues

---

**Made with ❤️ by Prachurjya Biswas**
