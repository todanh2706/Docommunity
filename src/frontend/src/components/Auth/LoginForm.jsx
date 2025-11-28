import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login, isLoading, error } = useAuth();
    const { success } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const message = await login(username, password);
            success("Login successfully!");
            navigate('/home');
        } catch (err) {
            console.log('An error occured: ', err);
        }
    };

    return (
        <div className='mt-6 sm:mx-auto sm:w-full sm:max-w-sm'>
            <form className='space-y-4' onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor='email'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Username
                    </label>
                    <div className='mt-2'>
                        <input
                            id='username'
                            type='username'
                            name='username'
                            required
                            placeholder='Enter your Username'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor='password'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Password
                    </label>
                    <div className='mt-2 relative w-full'>
                        <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                            {!showPassword ? (
                                <FaEye
                                    className='h-5 w-5 text-gray-400'
                                    aria-hidden='true'
                                    onClick={() => { setShowPassword(!showPassword) }}
                                />
                            ) : (
                                <FaEyeSlash
                                    className='h-5 w-5 text-gray-400'
                                    aria-hidden='true'
                                    onClick={() => { setShowPassword(!showPassword) }}
                                />
                            )}
                        </div>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Enter your Password'
                            required
                            autoComplete='current-password'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setPassword(e.target.value)}
                        >
                        </input>
                    </div>
                </div>

                {error && (
                    <div className='text-center text-sm text-red-400'>
                        {error}
                    </div>
                )}

                <div className='text-center text-sm text-gray-400 mt-6'>
                    <p>
                        Or if you don't have an account, you can{' '}
                        <a
                            href='/register'
                            className='font-medium text-indigo-400 hover:text-indigo-300'
                        >
                            Register
                        </a>
                        {' '}now!
                    </p>
                </div>
                <div className='mt-6 flex justify-center'>
                    <button
                        type='submit'
                        className='w-full max-w-96 h-full max-h-10 flex justify-center items-center bg-linear-to-r from-blue-600 to-blue-950 transition text-md text-shadow-lg/20 delay-75 duration-300 ease-in-out p-6 hover:-translate-y-1 hover:scale-110 focus:outline-1 rounded-lg'
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        Log In
                    </button>
                </div>
            </form>
        </div>

    )
}