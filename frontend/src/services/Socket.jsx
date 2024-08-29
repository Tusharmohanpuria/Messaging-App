import io from 'socket.io-client';

const createSocket = (email) => {
  return io('http://localhost:5000', {
    query: {
      email
    }
  });
};

export default createSocket;

