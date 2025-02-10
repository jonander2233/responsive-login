document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    if (username === 'usuario' && password === 'contraseña') {
        window.location.href = 'success.html'; // Redirigir a otra página en caso de éxito
    } else {
        message.textContent = 'Usuario o contraseña incorrectos';
        message.style.color = 'red';
    }
});

