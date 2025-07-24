const User = require('../models/User'); // Add this import

module.exports = function(io) {
  const videoNamespace = io.of('/video');
  const connectedUsers = new Map(); // email -> socket.id
  
  // Increase max listeners to prevent warnings
  videoNamespace.setMaxListeners(50);
  
  videoNamespace.on('connection', (socket) => {
    console.log('User connected to /video:', socket.id);

    // Register user when they connect
    socket.on('register-user', (userEmail) => {
      connectedUsers.set(userEmail, socket.id);

      socket.userEmail = userEmail;
      console.log(`User registered: ${userEmail} -> ${socket.id}`);
    });

    // Handle call initiation with user validation
    socket.on('call-user', async ({ calleeEmail, callerEmail, offer }) => {
      try {
        console.log(`Call attempt: ${callerEmail} -> ${calleeEmail}`);
        
        // Check if target user exists in database
        const targetUser = await User.findOne({ email: calleeEmail });
        if (!targetUser) {
          socket.emit('call-error', { 
            message: `User ${calleeEmail} not found` 
          });
          return;
        }

        // Check if target user is online
        const targetSocketId = connectedUsers.get(calleeEmail);
        if (!targetSocketId) {
          socket.emit('call-error', { 
            message: `User ${calleeEmail} is not online` 
          });
          return;
        }

        // Send incoming call to target user
        videoNamespace.to(targetSocketId).emit('incoming-call', {
          callerEmail: callerEmail,
          callerSocketId: socket.id,
          offer: offer
        });

        console.log(`Incoming call sent to ${calleeEmail} (${targetSocketId})`);
      } catch (error) {
        console.error('Error in call-user:', error);
        socket.emit('call-error', { 
          message: 'Failed to initiate call' 
        });
      }
    });

    // Handle call answer
    socket.on('answer-call', ({ callerSocketId, answer }) => {
      console.log(`Call answered by ${socket.userEmail}`);
      videoNamespace.to(callerSocketId).emit('call-answered', { 
        answer: answer,
        answererEmail: socket.userEmail
      });
    });

    // Handle call rejection
    socket.on('reject-call', ({ callerSocketId }) => {
      console.log(`Call rejected by ${socket.userEmail}`);
      videoNamespace.to(callerSocketId).emit('call-rejected', {
        rejectorEmail: socket.userEmail
      });
    });

    // Handle offer
    socket.on('offer', ({ targetSocketId, offer }) => {
      videoNamespace.to(targetSocketId).emit('receive-offer', { 
        offer: offer, 
        from: socket.id 
      });
    });

    // Handle answer
    socket.on('answer', ({ targetSocketId, answer }) => {
      videoNamespace.to(targetSocketId).emit('receive-answer', { 
        answer: answer 
      });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      videoNamespace.to(targetSocketId).emit('ice-candidate', { 
        candidate: candidate 
      });
    });

    // Handle call end
    socket.on('end-call', ({ targetSocketId }) => {
      if (targetSocketId) {
        videoNamespace.to(targetSocketId).emit('call-ended');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from /video:', socket.id);
      if (socket.userEmail) {
        connectedUsers.delete(socket.userEmail);
        console.log(`User unregistered: ${socket.userEmail}`);
      }
    });
  });
};
