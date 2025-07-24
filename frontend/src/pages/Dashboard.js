import React from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../features/Chat';
import VideoCallPanel from '../features/video/VideoCallPanel';
import { VideoProvider } from '../features/video/VideoContext';

const Dashboard = () => (
  <VideoProvider>
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', background: '#f3f2f1' }}>
        <Chat />
      </div>
    </div>
    <VideoCallPanel />
  </VideoProvider>
);

export default Dashboard;
