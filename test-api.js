const http = require('http');

http.get('http://localhost:3000/api/users/u-admin/locker', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Locker:', data));
});
