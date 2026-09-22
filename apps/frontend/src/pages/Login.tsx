import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch('/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwt_token', data.token);
                console.log("Autenticación exitosa. Redirigiendo...");
            } else {
                alert("Credenciales incorrectas");
            }
        } catch (error) {
            console.error("Error de red", error);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                {/* Recreación del logo de la esquina superior izquierda */}
                <div className="brand-logo">
                    <span className="logo-icon">❤️🐶</span>
                    <span className="logo-text">VetConecta</span>
                </div>
                
                <div className="login-header">
                    <h2>Panel de Control</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="veterinario@clinica.cl"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="login-btn">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}