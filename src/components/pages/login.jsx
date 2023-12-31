import React, {useState, useContext, useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const isInvalid = password === "" || email === "";

  
  const handleLogin = async (event) => {
    event.preventDefault();

    try{
        const user =   await login(email, password)
        navigate('/')
    }catch (error) {
        setEmail("");
        setPassword("");
        setError(error.message);
      }

    
  };
  useEffect(() => {
    document.title = 'Login - Instagram';
  }, []);

  return (<>
    <div className="container flex mx-auto max-w-screen-md items-center h-screen">
      <div className="flex w-3/5">
        <img 
          src="/images/auff.png"
          alt="iPhone with Instagram app"
        />
      </div>
      <div className="flex flex-col w-2/5">
        <div className="flex flex-col items-center bg-white p-4 border border-gray-primary mb-4 rounded-lg">
          <h1 className="flex justify-center w-full">
            <img
              src="/images/logo.png"
              alt="Instagram"
              className="mt-2 w-6/12 mb-4"
            />
          </h1>

          {error && <p className="mb-4 text-xs text-red-600">{error}</p>}

          <form onSubmit={handleLogin} method="POST">
            <input
              aria-label="Enter your email address"
              type="text"
              placeholder="Email address"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded mb-2"
              onChange={({ target }) => setEmail(target.value)}
              value={email}
            />
            <input
              aria-label="Enter your password"
              type="password"
              placeholder="Password"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded mb-2"
              onChange={({ target }) => setPassword(target.value)}
              value={password}
            />
            <button
              disabled={isInvalid}
              type="submit"
              className={`bg-blue-600 text-white w-full rounded h-8 font-bold
                    ${isInvalid && "opacity-50"}`}
            >
              Login
            </button>
          </form>
        </div>
        <div className="flex justify-center items-center flex-col w-full bg-white p-4 rounded border border-gray-primary">
          <p className="text-sm">
            Don't have an account?{` `}
            <Link to='/signup' className="font-bold text-blue-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
         
    </div>
    
    </>
  );
};

export default Login