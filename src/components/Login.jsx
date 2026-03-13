import { supabase } from '../supabaseClient';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Veuillez entrer un nom d\'utilisateur et un mot de passe.');
      return;
    }

    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password) // Still simple text check as requested
        .single();

      if (sbError || !data) {
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      } else {
        onLogin(data.username);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <span className="login-icon">📚</span>
          </div>
          <h2 className="login-title">Bienvenue à la Bibliothèque</h2>
          <p className="login-subtitle">Connectez-vous pour gérer vos livres</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group login-input-group">
            <label>Nom d'utilisateur</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              className="login-input"
            />
          </div>
          
          <div className="form-group login-input-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
            />
          </div>

          <button type="submit" className="btn-primary btn-login" disabled={loading}>
            {loading ? 'Connexion...' : 'Se Connecter'}
          </button>
        </form>
      </div>
      
      {/* Decorative background elements */}
      <div className="login-bg-blob blob-1"></div>
      <div className="login-bg-blob blob-2"></div>
    </div>
  );
};

export default Login;
