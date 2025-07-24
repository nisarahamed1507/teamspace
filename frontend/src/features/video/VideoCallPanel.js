import React, { useRef, useEffect, useState } from 'react';
import { useVideo } from './VideoContext';
import CallControls from './CallControls';

const VideoCallPanel = () => {
  /* pull everything (including isLoading) from context */
  const {
    callState,
    remoteUser,
    localStream,
    remoteStream,
    isLoading,
    error
  } = useVideo();

  /* local UI state */
  const [localVideoReady, setLocalVideoReady]   = useState(false);
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const [showCallOverlay, setShowCallOverlay]   = useState(false);

  const localVideoRef  = useRef();
  const remoteVideoRef = useRef();

  /* show overlay only after 300 ms to avoid flicker */
  useEffect(() => {
    let t;
    if (callState === 'calling') {
      t = setTimeout(() => setShowCallOverlay(true), 300);
    } else {
      setShowCallOverlay(false);
    }
    return () => clearTimeout(t);
  }, [callState]);

  /* attach local stream */
  useEffect(() => {
    const v = localVideoRef.current;
    if (localStream && v) {
      v.srcObject = localStream;
      v.onloadedmetadata = () => setLocalVideoReady(true);
      v.play().catch(() => {});
    } else {
      setLocalVideoReady(false);
    }
  }, [localStream]);

  /* attach remote stream */
  useEffect(() => {
    const v = remoteVideoRef.current;
    if (remoteStream && v) {
      v.srcObject = remoteStream;
      v.onloadedmetadata = () => setRemoteVideoReady(true);
      v.play().catch(() => {});
    } else {
      setRemoteVideoReady(false);
    }
  }, [remoteStream]);

  /* render only when in a call flow */
  const visible = ['calling', 'incoming', 'in-call', 'error'];
  if (!visible.includes(callState)) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1a1a1a',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ----- HEADER ----- */}
      <header
        style={{
          height: 60,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          zIndex: 2
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {callState === 'calling'  && `Calling ${remoteUser?.email}…`}
          {callState === 'incoming' && `Incoming call from ${remoteUser?.email}`}
          {callState === 'in-call'  && `Connected with ${remoteUser?.email}`}
          {callState === 'error'    && 'Call Error'}
        </span>
        {callState === 'in-call' && <span>00:00</span>}
      </header>

      {/* ----- LOADING SPINNER (optional) ----- */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 90,
            right: 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: 3
          }}
        >
          ⏳
        </div>
      )}

      {/* ----- VIDEO AREA ----- */}
      <main
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 60 /* push below header */
        }}
      >
        {/* remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#222'
          }}
        />

        {/* placeholder if remote not ready */}
        {!remoteVideoReady && callState === 'in-call' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <div style={{ fontSize: 48 }}>👤</div>
            Waiting for {remoteUser?.email}…
          </div>
        )}

        {/* local PiP */}
        <aside
          style={{
            position: 'absolute',
            top: 90,
            right: 20,
            width: 220,
            height: 160,
            overflow: 'hidden',
            borderRadius: 12,
            border: '3px solid rgba(255,255,255,0.2)',
            background: '#333'
          }}
        >
          <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            onLoadedMetadata={() => setLocalVideoReady(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: localVideoReady ? 1 : 0,
              transition: 'opacity 0.3s'
            }}
          />
          {!localVideoReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: '#333'
              }}
            >
              <span style={{ fontSize: 24 }}>📷</span>
              Your camera
            </div>
          )}
        </aside>

        {/* calling / incoming overlays */}
        {callState === 'calling' && showCallOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backdropFilter: 'blur(4px)',
              background: 'rgba(0,0,0,0.55)'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
            Calling {remoteUser?.email}
          </div>
        )}

        {callState === 'incoming' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backdropFilter: 'blur(4px)',
              background: 'rgba(0,0,0,0.55)'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📲</div>
            Incoming call from {remoteUser?.email}
          </div>
        )}
      </main>

      {/* ----- ERROR MESSAGE ----- */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 90,
            left: 20,
            right: 260,
            background: 'rgba(255,59,48,0.9)',
            color: '#fff',
            padding: 12,
            borderRadius: 6,
            fontSize: 14
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ----- CONTROLS ----- */}
      <CallControls />
    </div>
  );
};

export default VideoCallPanel;
