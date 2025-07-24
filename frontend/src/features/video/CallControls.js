import React, { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { useVideo } from './VideoContext';

const CallControls = () => {
  const { 
    callState, 
    answerCall, 
    rejectCall, 
    hangUp, 
    toggleAudio, 
    toggleVideo,
    error 
  } = useVideo();
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setAudioEnabled(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  const handleHangUp = () => {
    hangUp();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
      backdropFilter: 'blur(10px)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 1002
    }}>
    
    {/* Close button in error state */}
    {callState === 'error' && (
      <Button
        appearance="primary"
        style={{
          backgroundColor: '#ff2525',
          marginBottom: '1rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '16px'
        }}
        onClick={hangUp}
      >
        Close
      </Button>
    )}

    {/* Error message */}
    {error && (
      <div style={{
        color: '#ff6b6b',
        backgroundColor: 'rgba(255,107,107,0.1)',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        {error}
      </div>
    )}

    {/* ...rest of the controls... */}

      {/* Call State Indicator */}
      <div style={{
        color: 'white',
        fontSize: '16px',
        fontWeight: 500,
        textAlign: 'center',
        opacity: 0.9
      }}>
        {callState === 'calling' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="pulse-dot" style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#007AFF',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            Calling...
          </div>
        )}
        {callState === 'incoming' && 'Incoming Call'}
        {callState === 'in-call' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#34C759',
              borderRadius: '50%'
            }}></div>
            Connected
          </div>
        )}
      </div>

      {/* Controls based on call state */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {/* INCOMING CALL CONTROLS */}
        {callState === 'incoming' && (
          <>
            <Button
              appearance="primary"
              onClick={rejectCall}
              style={{
                backgroundColor: '#FF3B30',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '28px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 59, 48, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              📵
            </Button>
            
            <Button
              appearance="primary"
              onClick={answerCall}
              style={{
                backgroundColor: '#34C759',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '28px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(52, 199, 89, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              📞
            </Button>
          </>
        )}

        {/* IN-CALL AND CALLING CONTROLS */}
        {(callState === 'in-call' || callState === 'calling') && (
          <>
            <Button
              appearance="primary"
              onClick={handleToggleAudio}
              style={{
                backgroundColor: audioEnabled ? 'rgba(255,255,255,0.2)' : '#FF3B30',
                border: audioEnabled ? '2px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                fontSize: '20px',
                color: 'white',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              {audioEnabled ? '🎤' : '🔇'}
            </Button>

            <Button
              appearance="primary"
              onClick={handleToggleVideo}
              style={{
                backgroundColor: videoEnabled ? 'rgba(255,255,255,0.2)' : '#FF3B30',
                border: videoEnabled ? '2px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                fontSize: '20px',
                color: 'white',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              {videoEnabled ? '📹' : '📷'}
            </Button>

            <Button
              appearance="primary"
              onClick={handleHangUp}
              style={{
                backgroundColor: '#FF3B30',
                border: 'none',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                fontSize: '24px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 59, 48, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              📵
            </Button>
          </>
        )}
      </div>

      {/* Control Labels (for better UX) */}
      {(callState === 'in-call' || callState === 'calling') && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.7)',
          marginTop: '0.5rem'
        }}>
          <span>{audioEnabled ? 'Mute' : 'Unmute'}</span>
          <span>{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
          <span>End Call</span>
        </div>
      )}
    </div>
  );
};

export default CallControls;
