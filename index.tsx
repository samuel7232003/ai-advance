/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import ReactDOM from 'react-dom/client';

// TODO: Replace with your ACTUAL Cloudinary cloud name
const CLOUDINARY_CLOUD_NAME_REPLACE_ME = 'df7mhs6xj';
// TODO: Replace with your ACTUAL Cloudinary unsigned upload preset
const CLOUDINARY_UPLOAD_PRESET_REPLACE_ME = 'qwertyu';

// --- SVG Icons (remain the same, will adapt with CSS currentColor) ---
const UploadCloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48px" height="48px" aria-hidden="true">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px" aria-hidden="true" style={{ marginRight: '8px' }}>
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
  </svg>
);

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px" aria-hidden="true" className="status-icon">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px" aria-hidden="true" className="status-icon">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);
// --- End SVG Icons ---

interface HeaderProps {
  appTitle: string;
  onLogout: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ appTitle, onLogout }) => {
  return (
    <header className="app-header">
      <h1 className="app-title">{appTitle}</h1>
      <button onClick={onLogout} className="logout-button">Logout</button>
    </header>
  );
};

interface LoginPageProps {
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  loginError: string | null; // For general login attempt errors
  apiKeyMissingError: string | null; // Specific error for API key
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError, apiKeyMissingError }) => {
  const isLoginDisabled = !!apiKeyMissingError;
  const displayError = apiKeyMissingError || loginError;

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back!</h2>
        <p className="login-subtitle">Sign in to process your videos.</p>
        <form onSubmit={onLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" defaultValue="demo_user" required disabled={isLoginDisabled} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" defaultValue="password" required disabled={isLoginDisabled}/>
          </div>
          {displayError && (
             <p className="status-message error login-error-message"><ErrorIcon/> {displayError}</p>
          )}
          <button type="submit" className="login-button" disabled={isLoginDisabled}>Login</button>
        </form>
      </div>
    </div>
  );
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttemptError, setLoginAttemptError] = useState<string | null>(null); // For failed login attempts (e.g. wrong password in a real scenario)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploaderError, setUploaderError] = useState<string | null>(null); // For uploader-specific errors after login
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const [apiKeyMissingError, setApiKeyMissingError] = useState<string | null>(null);
  const [cloudinaryConfigError, setCloudinaryConfigError] = useState<string | null>(null);

  // Check if Cloudinary is configured with valid values
  const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME_REPLACE_ME.length > 0 && CLOUDINARY_UPLOAD_PRESET_REPLACE_ME.length > 0;
  const isApiKeySet = !!process.env.API_KEY;

  useEffect(() => {

    if (!isCloudinaryConfigured) {
      const msg = `Cloudinary constants (CLOUDINARY_CLOUD_NAME_REPLACE_ME or CLOUDINARY_UPLOAD_PRESET_REPLACE_ME) are not configured in index.tsx. Video upload will be disabled.`;
      setCloudinaryConfigError(msg);
      // Log this error regardless of login state, as it's a setup issue.
      console.error(msg);
    } else {
      setCloudinaryConfigError(null);
    }
  }, [isApiKeySet, isCloudinaryConfigured]); // Re-check if these conditions change (e.g. hot-reloading with env changes)


  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (apiKeyMissingError) {
        // This ensures the login form's displayed error is consistent.
        // No need to setLoginAttemptError here as apiKeyMissingError takes precedence.
        return;
    }
    // Simulate a successful login for now
    setLoginAttemptError(null); // Clear previous login attempt errors
    setIsAuthenticated(true);
    // Reset uploader state upon login
    setSelectedFile(null);
    setIsLoading(false);
    setStatusMessage('');
    setUploaderError(null);
    setFinalVideoUrl(null);
    setShowVideoPlayer(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginAttemptError(null); 
    // Don't clear apiKeyMissingError or cloudinaryConfigError as they are persistent config issues.
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploaderError(null);
    setFinalVideoUrl(null);
    setShowVideoPlayer(false);
    setStatusMessage('');
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setStatusMessage(`${event.target.files[0].name} selected.`);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploaderError("Please select a video file first.");
      return;
    }
    
    setIsLoading(true);
    setUploaderError(null);
    setFinalVideoUrl(null);
    setShowVideoPlayer(false);
    setStatusMessage('Uploading to Cloudinary...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_REPLACE_ME);

    try {
      // First upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME_REPLACE_ME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed.');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const cloudinaryUrl = cloudinaryData.secure_url;
      setStatusMessage('Video uploaded. Processing video...');

      // Send video URL to local API for processing
      const processResponse = await fetch('http://localhost:5000/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: cloudinaryUrl
        })
      });

      if (!processResponse.ok) {
        throw new Error('Video processing failed. Please try again.');
      }

      const processData = await processResponse.json();
      setFinalVideoUrl(processData.cloudinary_url);
      setStatusMessage('Video processing complete! Ready to play.');
      setShowVideoPlayer(true);

    } catch (e) {
      console.error("Upload process error:", e);
      if (e instanceof Error) {
        setUploaderError(`Error: ${e.message}`);
      } else {
        setUploaderError('An unknown error occurred during the upload process.');
      }
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage 
              onLogin={handleLogin} 
              loginError={loginAttemptError} 
              apiKeyMissingError={apiKeyMissingError}
           />;
  }

  // Determine if uploader should be disabled
  const isUploaderDisabled = !!apiKeyMissingError || !!cloudinaryConfigError;
  const uploaderConfigError = apiKeyMissingError || cloudinaryConfigError;

  return (
    <>
      <HeaderComponent appTitle="Interactive Video Processor" onLogout={handleLogout} />
      <div className="container">
        <main>
          <section aria-labelledby="video-upload-heading" className="card anim-fade-in">
            <h2 id="video-upload-heading">Upload Your Video Masterpiece</h2>
            
            {uploaderConfigError && (
                <p className="status-message error anim-fade-in">
                  <ErrorIcon /> {uploaderConfigError} Upload is disabled.
                </p>
            )}

            <div className="upload-area">
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isLoading || isUploaderDisabled}
                style={{ display: 'none' }}
              />
              
              <label 
                htmlFor="video-upload" 
                className={`upload-zone ${isLoading ? 'uploading' : ''}`}
                aria-disabled={isLoading || isUploaderDisabled}
              >
                <UploadCloudIcon />
                <p>Drag and drop your video here or click to browse</p>
                <small>Supported formats: MP4, WebM, MOV</small>
              </label>

              {selectedFile && (
                <div className="selected-file">
                  <p>{selectedFile.name}</p>
                  <button 
                    onClick={handleUpload} 
                    disabled={isLoading || isUploaderDisabled}
                    className="upload-button"
                  >
                    <UploadIcon />
                    {isLoading ? 'Processing...' : 'Upload Video'}
                  </button>
                </div>
              )}

              {statusMessage && (
                <p className="status-message info">
                  {statusMessage}
                </p>
              )}

              {uploaderError && (
                <p className="status-message error">
                  <ErrorIcon /> {uploaderError}
                </p>
              )}
            </div>
          </section>

          {showVideoPlayer && finalVideoUrl && (
            <section className="video-player-section card anim-fade-in">
              <h2>Processed Video</h2>
              <div className="video-player-wrapper">
                <video 
                  controls 
                  autoPlay 
                  className="video-player"
                  src={finalVideoUrl}
                >
                  <source src={finalVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!); 
root.render(<App />);