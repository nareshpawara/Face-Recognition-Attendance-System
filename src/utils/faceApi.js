import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Load models from public folder
export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log('Tiny Models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading models:', error);
    return false;
  }
};

// Create a FaceMatcher from stored user data
export const createFaceMatcher = (users) => {
  if (!users || users.length === 0) return null;
  
  const labeledDescriptors = users.map(user => {
    // Ensure embeddings are Float32Array
    const descriptor = new Float32Array(user.embeddings);
    return new faceapi.LabeledFaceDescriptors(user.name, [descriptor]);
  });

  return new faceapi.FaceMatcher(labeledDescriptors, 0.45);
};

// Single detection for registration
export const getFaceEmbeddings = async (input) => {
  const detection = await faceapi.detectSingleFace(
    input, 
    new faceapi.TinyFaceDetectorOptions()
  )
  .withFaceLandmarks(true)
  .withFaceDescriptor();

  return detection ? detection.descriptor : null;
};

// Recognition loop detection
export const recognizeFace = async (input, faceMatcher) => {
  if (!faceMatcher) return [];

  const detections = await faceapi.detectAllFaces(
    input, 
    new faceapi.TinyFaceDetectorOptions()
  )
  .withFaceLandmarks(true)
  .withFaceDescriptors();

  const results = detections.map(d => {
    const bestMatch = faceMatcher.findBestMatch(d.descriptor);
    return {
      label: bestMatch.label,
      distance: bestMatch.distance,
      box: d.detection.box
    };
  });

  return results;
};
