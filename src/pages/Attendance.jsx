import React, { useRef, useState, useEffect } from 'react';
import { Camera, ShieldCheck, UserCheck, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { loadModels, createFaceMatcher, recognizeFace } from '../utils/faceApi';
import { storage } from '../utils/storage';
import { playSuccessSound } from '../utils/sounds';

const Attendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [lastMarked, setLastMarked] = useState(null);
  const [processing, setProcessing] = useState(false);
  const isDetecting = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const modelsLoaded = await loadModels();
        const registeredUsers = await storage.getUsers();
        setUsers(registeredUsers);

        if (!modelsLoaded) {
          setError('Failed to load face recognition models.');
          setLoading(false);
          return;
        }

        if (registeredUsers.length === 0) {
          setError('No users registered. Please register a face first.');
          setLoading(false);
          return;
        }

        setFaceMatcher(createFaceMatcher(registeredUsers));
        await startCamera();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('System initialization failed.');
        setLoading(false);
      }
    };
    init();

    return () => {
      isDetecting.current = false;
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    console.log('Requesting camera permissions...');
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setLoading(false);
        isDetecting.current = true;
        detectionLoop();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or hardware error.');
      setLoading(false);
    }
  };

  const detectionLoop = async () => {
    if (!isDetecting.current || !videoRef.current || !faceMatcher || processing) {
      if (isDetecting.current) requestAnimationFrame(detectionLoop);
      return;
    }

    try {
      const results = await recognizeFace(videoRef.current, faceMatcher);
      
      if (results && results.length > 0) {
        if (results.length > 1) {
          setError('Multiple faces detected. Please stay alone in the frame.');
        } else {
          setError(''); 
          const bestResult = results[0];
          if (bestResult.label !== 'unknown' && bestResult.distance < 0.45) {
            handleAttendance(bestResult.label);
          }
        }
      }
    } catch (err) {
      console.error('Detection loop error:', err);
    }

    if (isDetecting.current) requestAnimationFrame(detectionLoop);
  };

  const handleAttendance = async (userName) => {
    const user = users.find(u => u.name === userName);
    if (!user) return;

    // Check if already marked in this session to prevent spamming
    if (lastMarked === user.id) return;

    // Check if already marked today in storage
    const markedToday = await storage.isAlreadyMarked(user.id);
    if (markedToday) {
      setLastMarked(user.id);
      return;
    }

    setProcessing(true);
    await storage.saveAttendance({
      userId: user.id,
      name: user.name
    });
    
    setLastMarked(user.id);
    
    // Play success sound
    playSuccessSound();

    setTimeout(() => setProcessing(false), 3000); // Wait 3s before next recognition
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mark Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time face recognition for automatic logging.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold border border-emerald-100 dark:border-emerald-900/30">
          <ShieldCheck size={18} />
          System Live
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video glass-card overflow-hidden bg-slate-900 group">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-900">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-medium">Warming up systems...</p>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className={`w-full h-full object-cover scale-x-[-1] ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
            
            {!loading && !error && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary-500/30 rounded-3xl" />
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/50 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
                <p className="text-slate-400 max-w-xs mb-6">{error}</p>
                {users.length === 0 && (
                  <a href="/register" className="btn-primary">Register Now</a>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 p-4 glass-card">
            <div className={`p-3 rounded-full ${processing ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-100 text-slate-500'} dark:bg-slate-800`}>
              <Camera size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold">{processing ? 'Recognition Successful!' : 'Scanning for Faces...'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {processing ? 'Attendance recorded. System will resume in 3s.' : 'Position yourself within the center frame.'}
              </p>
            </div>
            {!loading && (
              <button 
                onClick={startCamera}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                title="Retry Camera"
              >
                <RefreshCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Status / Activity Section */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-primary-600" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {lastMarked ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Success</p>
                  <p className="font-bold text-lg">{users.find(u => u.id === lastMarked)?.name}</p>
                  <p className="text-sm text-slate-500">Attendance marked at {new Date().toLocaleTimeString()}</p>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <RefreshCw className="mx-auto mb-3 opacity-20" size={32} />
                  <p className="text-sm">No recognition events yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-3 text-sm">System Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500 mb-1">Users</p>
                <p className="font-bold">{users.length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500 mb-1">Confidence</p>
                <p className="font-bold">98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
