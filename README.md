# MerDiagram
    USUARIOS ||--o{ ALOJAMIENTOS : "ofrece (Anfitrion)"
    USUARIOS ||--|| PREFERENCIAS_CONVIVENCIA : "define"
    USUARIOS ||--o{ USUARIO_INTERESES : "registra"
    INTERESES_CATALOGO ||--o{ USUARIO_INTERESES : "es elegido en"
    USUARIOS ||--o{ MATCHES : "envia (interesado)"
    USUARIOS ||--o{ MATCHES : "recibe (objetivo)"

    USUARIOS {
        int id_usuario PK
        varchar nombre_completo
        varchar email
        varchar password
        varchar telefono
        varchar foto_perfil
        date fecha_nacimiento
        enum sexo_biologico
        varchar identidad_genero
        varchar universidad
        varchar carrera
        int anio_ingreso
        text biografia
        enum rol
    }

    ALOJAMIENTOS {
        int id_alojamiento PK
        int id_anfitrion FK
        varchar direccion
        decimal precio_mensual
        int habitaciones_disponibles
        text reglas_casa
    }

    PREFERENCIAS_CONVIVENCIA {
        int id_preferencia PK
        int id_usuario FK
        boolean fuma
        boolean acepta_mascotas
        int nivel_orden
        int nivel_ruido
        boolean visitas_frecuentes
        enum horario_preferido
    }

    INTERESES_CATALOGO {
        int id_interes PK
        varchar nombre_interes
    }

    USUARIO_INTERESES {
        int id_usuario PK, FK
        int id_interes PK, FK
    }

    MATCHES {
        int id_match PK
        int id_usuario_interesado FK
        int id_usuario_objetivo FK
        enum estado
        timestamp fecha_creacion
    }
