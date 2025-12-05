function handleLogin(e) {
  e.preventDefault()

  const telefono = document.getElementById("telefono").value
  const password = document.getElementById("password").value

  const users = JSON.parse(localStorage.getItem("alcanzo_users") || "[]")
  const user = users.find((u) => u.telefono === telefono && u.password === password)

  if (user) {
    localStorage.setItem("alcanzo_user", JSON.stringify(user))
    window.location.href = "index.html"
  } else {
    alert("Teléfono o contraseña incorrectos")
  }
}
