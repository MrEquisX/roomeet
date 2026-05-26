fetch('http://localhost:3000/api/auth/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
      nombre: "André Limari",
      email: "andre.test@roomeet.cl",
      password: "password123"
  })
})
.then(res => res.json())
.then(data => console.log("🔥 RESPUESTA DE ROOMEET:", data))
.catch(err => console.error("❌ ERROR:", err));