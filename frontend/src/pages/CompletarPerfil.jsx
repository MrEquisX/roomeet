import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Función auxiliar para parsear el token JWT (no seguro para producción, pero sirve para este ejemplo)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const CompletarPerfil = () => {
  const navigate = useNavigate();

  // Estado del mensaje de éxito/error
  const [mensaje, setMensaje] = useState('');
  const [mostrandoExito, setMostrandoExito] = useState(false);

  // Estados controlados del formulario (universidad, carrera, teléfono, biografía, rol)
  const [universidad, setUniversidad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [biografia, setBiografia] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null); // Objeto File
  const [fotoPreview, setFotoPreview] = useState(null);

  // Otros estados si los quieres mantener visualmente
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Otros campos de ejemplo, puedes agregar más según las necesidades
  const [fuma, setFuma] = useState(false);
  const [aceptaMascotas, setAceptaMascotas] = useState(false);
  const [bebeAlcohol, setBebeAlcohol] = useState('Socialmente');
  const [tipoDieta, setTipoDieta] = useState('Omnívoro');
  const [nivelOrden, setNivelOrden] = useState(3);
  const [nivelRuido, setNivelRuido] = useState(3);
  const [visitasFrecuentes, setVisitasFrecuentes] = useState(false);
  const [aceptaParejasVisita, setAceptaParejasVisita] = useState(false);
  const [horarioPreferido, setHorarioPreferido] = useState('Indiferente');
  const [soloMismaUniversidad, setSoloMismaUniversidad] = useState(false);
  const [soloMismaCarrera, setSoloMismaCarrera] = useState(false);
  const [generoPreferido, setGeneroPreferido] = useState('Indiferente');
  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);

  // Manejador imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  // Intereses (máximo 5)
  const handleInteresToggle = (interes) => {
    setInteresesSeleccionados((prev) => {
      if (prev.includes(interes)) {
        return prev.filter((i) => i !== interes);
      }
      if (prev.length < 5) {
        return [...prev, interes];
      }
      return prev;
    });
  };

  // Submit principal
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Obtener token desde localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('No has iniciado sesión.');
      return;
    }

    // Sacar ID de usuario desde el token -- asumiendo que el ID viene en el payload como "id" o "id_usuario"
    const payload = parseJwt(token);
    const id_usuario = (payload && (payload.id_usuario || payload.id || payload.userId)) || null;
    if (!id_usuario) {
      setMensaje('No se pudo obtener el ID del usuario del token.');
      return;
    }

    // Preparamos los datos del perfil a enviar (según campos requeridos)
    const datosPerfil = {
      universidad,
      carrera,
      telefono,
      biografia,
      rol,
      // Otros datos ejemplo:
      preferencias_convivencia: {
        fuma,
        acepta_mascotas: aceptaMascotas,
        bebe_alcohol: bebeAlcohol,
        tipo_dieta: tipoDieta,
        nivel_orden: nivelOrden,
        nivel_ruido: nivelRuido,
        visitas_frecuentes: visitasFrecuentes,
        acepta_parejas_visita: aceptaParejasVisita,
        horario_preferido: horarioPreferido,
        solo_misma_universidad: soloMismaUniversidad,
        solo_misma_carrera: soloMismaCarrera,
        genero_preferido: generoPreferido
      },
      intereses: interesesSeleccionados
    };

    let respuesta;
    try {
      if (fotoPerfil) {
        // Si hay foto, usar FormData (NO poner Content-Type)
        const formData = new FormData();
        formData.append('universidad', universidad);
        formData.append('carrera', carrera);
        formData.append('telefono', telefono);
        formData.append('biografia', biografia);
        formData.append('rol', rol);
        formData.append('foto', fotoPerfil);

        // Serializar objetos anidados y arrays como string para FormData
        formData.append('preferencias_convivencia', JSON.stringify(datosPerfil.preferencias_convivencia));
        formData.append('intereses', JSON.stringify(interesesSeleccionados));

        respuesta = await fetch(`http://localhost:3000/api/usuarios/${id_usuario}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });
      } else {
        // Sin foto: enviar JSON
        respuesta = await fetch(`http://localhost:3000/api/usuarios/${id_usuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(datosPerfil)
        });
      }

      if (respuesta.status === 200) {
        setMensaje('¡Perfil actualizado correctamente!');
        setMostrandoExito(true);
        setTimeout(() => {
          setMostrandoExito(false);
          navigate('/');
        }, 1800);
      } else {
        // Extra: mostrar detalles del error si están disponibles
        let textoError = 'Error al actualizar el perfil.';
        try {
          const errJson = await respuesta.json();
          if (errJson && errJson.message) textoError = errJson.message;
        } catch {}
        setMensaje(textoError);
      }
    } catch (error) {
      setMensaje('Ocurrió un error de red al actualizar tu perfil.');
    }
  };

  const handleOmitirClick = () => setMostrarAlerta(true);
  const confirmarOmitir = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 flex flex-col relative">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">¡Casi listo! 🎉</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Completa estas preferencias para que nuestro algoritmo encuentre a tus roomies ideales.
        </p>

        {mensaje && (
          <div className={`mb-4 text-center py-2 px-4 rounded-xl font-bold transition-all ${
            mostrandoExito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-8">

          {/* UNIVERSIDAD */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Universidad</h2>
            <input
              type="text"
              required
              value={universidad}
              onChange={e => setUniversidad(e.target.value)}
              placeholder="Ej: Pontificia Universidad Católica de Chile"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </section>

          {/* CARRERA */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Carrera</h2>
            <input
              type="text"
              required
              value={carrera}
              onChange={e => setCarrera(e.target.value)}
              placeholder="Ej: Ingeniería Civil Informática"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </section>

          {/* TELÉFONO */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Teléfono</h2>
            <input
              type="text"
              required
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: +56912345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </section>

          {/* ROL */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Rol</h2>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
              <option value="egresado">Egresado</option>
              <option value="otro">Otro</option>
            </select>
          </section>

          {/* FOTO DE PERFIL */}
          <section className="flex flex-col items-center space-y-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Subir Foto</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-400">Añade una foto para dar confianza</span>
          </section>

          {/* BIOGRAFÍA */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Sobre ti</h2>
            <div>
              <textarea
                required
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                rows="3"
                placeholder="Busco un ambiente tranquilo para estudiar, me gusta armar PCs los fines de semana..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              ></textarea>
            </div>
          </section>

          {/* HÁBITOS DE VIDA (evento con los mismos handlers que antes) */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Hábitos y Convivencia</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">¿Fumas?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={fuma} onChange={() => setFuma(true)} className="accent-blue-600" /> Sí</label>
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={!fuma} onChange={() => setFuma(false)} className="accent-blue-600" /> No</label>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">Alcohol</span>
                <select value={bebeAlcohol} onChange={(e) => setBebeAlcohol(e.target.value)} className="w-full bg-transparent text-sm font-medium focus:outline-none">
                  <option value="Nunca">Nunca</option>
                  <option value="Socialmente">Socialmente</option>
                  <option value="Frecuente">Frecuente</option>
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">Dieta</span>
                <select value={tipoDieta} onChange={(e) => setTipoDieta(e.target.value)} className="w-full bg-transparent text-sm font-medium focus:outline-none">
                  <option value="Omnívoro">Omnívoro</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                  <option value="Indiferente">Indiferente</option>
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">¿Mascotas?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={aceptaMascotas} onChange={() => setAceptaMascotas(true)} className="accent-blue-600" /> Sí</label>
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={!aceptaMascotas} onChange={() => setAceptaMascotas(false)} className="accent-blue-600" /> No</label>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Nivel de Orden (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelOrden} onChange={(e) => setNivelOrden(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Relajado</span><span>Equilibrado</span><span>Estricto</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Tolerancia al Ruido (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelRuido} onChange={(e) => setNivelRuido(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Silencio total</span><span>Normal</span><span>Fiesta</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-colors ${visitasFrecuentes ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <span className="text-xs font-bold text-gray-700">Permitir visitas frecuentes de amigos</span>
                <input type="checkbox" checked={visitasFrecuentes} onChange={(e) => setVisitasFrecuentes(e.target.checked)} className="accent-blue-600 w-4 h-4" />
              </label>
              <label className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-colors ${aceptaParejasVisita ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <span className="text-xs font-bold text-gray-700">Permitir que la pareja se quede a dormir</span>
                <input type="checkbox" checked={aceptaParejasVisita} onChange={(e) => setAceptaParejasVisita(e.target.checked)} className="accent-blue-600 w-4 h-4" />
              </label>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Horario Preferido</label>
              <select value={horarioPreferido} onChange={(e) => setHorarioPreferido(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium">
                <option value="Diurno">Diurno (Activo de día, duermo de noche)</option>
                <option value="Nocturno">Nocturno (Estudio/Trabajo de noche)</option>
                <option value="Indiferente">Indiferente (Horarios flexibles)</option>
              </select>
            </div>
          </section>

          {/* INTERESES SEMILLA */}
          <section className="space-y-3">
            <div className="flex justify-between items-end border-b border-gray-100 pb-1">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Tus Intereses</h2>
              <span className="text-[10px] font-bold text-gray-400">{interesesSeleccionados.length}/5 max</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {[
                { id: 1, nombre: 'Fútbol', icono: '⚽' },
                { id: 2, nombre: 'Calistenia / Gym', icono: '💪' },
                { id: 3, nombre: 'Hardware & Gaming', icono: '💻' },
                { id: 4, nombre: 'Básquetbol', icono: '🏀' },
                { id: 5, nombre: 'Música', icono: '🎸' },
                { id: 6, nombre: 'Cine y Series', icono: '🎬' },
                { id: 7, nombre: 'Programación', icono: '🚀' },
                { id: 8, nombre: 'Cocina', icono: '🍳' },
                { id: 9, nombre: 'Automovilismo & Tuning', icono: '🚗' },
                { id: 10, nombre: 'Juegos de Mesa', icono: '🎲' }
              ].map((item) => {
                const isActive = interesesSeleccionados.includes(item.nombre);
                const isDisabled = !isActive && interesesSeleccionados.length >= 5;
                return (
                  <button
                    key={item.nombre}
                    type="button"
                    onClick={() => handleInteresToggle(item.nombre)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isDisabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span>{item.icono}</span>
                    {item.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-6 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Guardar Perfil y Entrar a Roomeet
            </button>
            <button
              type="button"
              onClick={handleOmitirClick}
              className="w-full bg-transparent border-2 border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 font-bold py-3 rounded-2xl transition-all"
            >
              Omitir por ahora
            </button>
          </div>
        </form>
      </div>

      {/* VENTANA EMERGENTE (MODAL) */}
      {mostrarAlerta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-4 mx-auto shadow-sm">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Seguro que quieres omitir?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Al tener tu perfil incompleto, el algoritmo no podrá encontrar roomies compatibles contigo. Serás menos visible en la plataforma.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarAlerta(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Volver a editar
              </button>
              <button
                onClick={confirmarOmitir}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
              >
                Sí, omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletarPerfil;