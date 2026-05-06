import React, { useRef, useState, useEffect } from 'react';
import { Camera, User, Contact, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { loadModels, getFaceEmbeddings } from '../utils/faceApi';
import { storage } from '../utils/storage';

const Register = () => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', id: '' });

  useEffect(() => {
    const init = async () => {
      const modelsLoaded = await loadModels();
      if (modelsLoaded) {
        startCamera();
      } else {
        setError('Failed to load face recognition models.');
        setLoading(false);
      }
    };
    init();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    console.log('Requesting camera permissions...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true
      });
      console.log('Camera stream obtained successfully');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          console.log('Video playing');
        } catch (e) {
          console.error('Video play failed:', e);
        }
        setLoading(false);
      } else {
        console.warn('videoRef.current is null even though video element should be rendered');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera permissions.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.id) {
      setError('Please fill in all fields.');
      return;
    }

    setCapturing(true);
    setError('');
    
    try {
      const embeddings = await getFaceEmbeddings(videoRef.current);
      
      if (!embeddings) {
        setError('No face detected. Please position your face clearly in the frame.');
      } else {
        await storage.saveUser({
          ...formData,
          embeddings: Array.from(embeddings) // Convert Float32Array to regular array for storage
        });
        setSuccess(`User ${formData.name} registered successfully!`);
        setFormData({ name: '', id: '' });
      }
    } catch (err) {
      setError('An error occurred during registration.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Face Registration</h1>
        <p className="text-slate-500 dark:text-slate-400">Capture face embeddings to register a new user.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Camera Section */}
        <div className="space-y-4">
          <div className="relative aspect-video glass-card overflow-hidden bg-slate-900 flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-900">
                <Loader2 className="animate-spin mb-2" />
                <p>Initializing Camera...</p>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className={`w-full h-full object-cover scale-x-[-1] ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
            
            {capturing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-medium">Analyzing Face...</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 border-2 border-primary-500/20 pointer-events-none" />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={startCamera}
              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retry Camera
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 px-2">
            <AlertCircle size={16} />
            <p>Ensure good lighting and look directly at the camera.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="glass-card p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Full Name
              </label>
              <input 
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Contact size={16} className="text-primary-600" /> Unique ID
              </label>
              <input 
                type="text"
                placeholder="EMP-12345"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-sm border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle2 size={18} /> {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || capturing}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {capturing ? 'Processing...' : (
                <>
                  <Camera size={20} />
                  Capture & Register
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
