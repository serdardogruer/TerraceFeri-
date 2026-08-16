fetch('http://192.168.1.28:3005/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@terraceferi.com', password: 'admin123' })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Headers:', [...res.headers.entries()]);
  const text = await res.text();
  console.log('Body:', text);
}).catch(console.error);
