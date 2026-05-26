fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: "andre.test@roomeet.cl", // El correo exacto que aparece en tu Atlas
        password: "password123"
    })
})
.then(res => res.json())
.then(data => console.log("🔑 RESPUESTA DE LOGIN:", data))
.catch(err => console.error("❌ ERROR:", err));