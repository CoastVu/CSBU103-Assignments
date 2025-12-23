document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            console.log('Signup form submitted');

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {

                window.location.href = '/login';
            } else {
                const errorText = await response.text();
                alert(`Signup failed: ${errorText}`);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                window.location.href = '/homepage6.html';
            } else {
                const errorText = await response.text();
                alert(`Login failed: ${errorText}`);
            }
        });
    }
});