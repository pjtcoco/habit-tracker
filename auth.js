// Detect which form is on the page
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        alert('Signup successful! Please login.');
        window.location.href = 'login.html';
      } else {
        const data = await res.json();
        alert('Signup failed: ' + data.message);
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Error during signup.');
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Save JWT token or session token in localStorage or cookie
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        window.location.href = 'index.html';  // Redirect to main app
      } else {
        const data = await res.json();
        alert('Login failed: ' + data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error during login.');
    }
  });
}
