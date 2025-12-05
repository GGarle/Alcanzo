document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Reset mensajes
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    // Validaciones básicas
    if (!nombre || !telefono || !email || !password || !confirmPassword) {
      errorMessage.textContent = 'Completá todos los campos.';
      errorMessage.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent =
        'La contraseña debe tener al menos 6 caracteres.';
      errorMessage.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Las contraseñas no coinciden.';
      errorMessage.style.display = 'block';
      return;
    }

    // Validar que no exista un usuario con el mismo email
    const key = 'usuario_' + email;
    if (localStorage.getItem(key)) {
      errorMessage.textContent =
        'Ya existe una cuenta registrada con ese email.';
      errorMessage.style.display = 'block';
      return;
    }

    // Crear objeto usuario
    const usuario = {
      nombre,
      telefono,
      email,
      password
    };

    // Guardar en localStorage (simulación de "registro")
    localStorage.setItem(key, JSON.stringify(usuario));

    // Mensaje de éxito
    successMessage.textContent =
      '¡Cuenta creada exitosamente! Redirigiendo al login...';
    successMessage.style.display = 'block';

    // Redireccionar después de 2 segundos
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  });
});
