# Face Recognition Attendance System

A fully offline, browser-based attendance system built with React, Tailwind CSS, and `face-api.js`.

## Features
- **Face Registration**: Capture face embeddings and store them locally.
- **Real-time Attendance**: Automatically mark attendance when a face is recognized.
- **Records Management**: View, filter, and export attendance logs as CSV.
- **Offline First**: Works entirely in the browser using LocalStorage.
- **Premium UI**: Modern design with dark mode and smooth animations.

## Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure
- `src/utils/faceApi.js`: Handles model loading and face recognition.
- `src/utils/storage.js`: LocalStorage wrapper for persistence.
- `src/pages/`: Contains Dashboard, Register, Attendance, and Records pages.
- `public/models/`: Contains the pre-trained weights for face detection and recognition.

## Note on Camera Access
The application requires camera permissions. Ensure you are running on `localhost` or an `HTTPS` environment as most browsers block `getUserMedia` on insecure origins.

## Models
This project uses the following models from `face-api.js`:
- SSD Mobilenet v1 (Face Detection)
- Face Landmark 68 (Face Alignment)
- Face Recognition (Embedding Extraction)
