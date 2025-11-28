import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const message = await register(username, password, confirmPassword, fullname, phone, email);
            alert(message);
            navigate('/login');
        } catch (err) {
            console.log('An error occured: ', err);
        }
    };

    return (
        <div className='mt-6 sm:mx-auto sm:w-full sm:max-w-sm'>
            <form className='space-y-4' onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor='username'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Username
                    </label>
                    <div className='mt-2'>
                        <input
                            id='username'
                            type='text'
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

                <div>
                    <label
                        htmlFor='confirmpassword'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Confirm Password
                    </label>
                    <div className='mt-2 relative w-full'>
                        <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                            {!showConfirmPassword ? (
                                <FaEye
                                    className='h-5 w-5 text-gray-400'
                                    aria-hidden='true'
                                    onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                                />
                            ) : (
                                <FaEyeSlash
                                    className='h-5 w-5 text-gray-400'
                                    aria-hidden='true'
                                    onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                                />
                            )}
                        </div>
                        <input
                            id='confirmpassword'
                            type={showConfirmPassword ? 'text' : 'password'}
                            name='confirmpassword'
                            placeholder='Enter your Password again'
                            required
                            autoComplete='current-password'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        >
                        </input>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor='fullname'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Full Name
                    </label>
                    <div className='mt-2'>
                        <input
                            id='fullname'
                            type='text'
                            name='fullname'
                            required
                            placeholder='Enter your full name'
                            autoComplete='name'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setFullname(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor='phone'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Phone number
                    </label>
                    <div className='mt-2'>
                        <input
                            id='phone'
                            type='tel'
                            name='phone'
                            required
                            placeholder='Enter your phone number'
                            autoComplete='tel'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor='email'
                        className='w-72 h-auto block text-md/6 font-medium text-gray-100'
                    >
                        Email
                    </label>
                    <div className='mt-2'>
                        <input
                            id='email'
                            type='email'
                            name='email'
                            required
                            placeholder='Enter your email'
                            autoComplete='email'
                            className='block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className='text-center text-sm text-red-400'>
                        {error}
                    </div>
                )}

                <div className='mt-6 flex justify-center'>
                    <button
                        type='submit'
                        className='w-full max-w-96 h-full max-h-10 flex justify-center items-center bg-linear-to-r from-blue-600 to-blue-950 transition text-md text-shadow-lg/20 delay-75 duration-300 ease-in-out p-6 hover:-translate-y-1 hover:scale-110 focus:outline-1 rounded-lg'
                        disabled={isLoading}
                    >
                        {isLoading && (<svg className='mr-3 size-5 animate-spin' viewBox='0 0 24 2' />)}
                        Register
                    </button>
                </div>
            </form>
        </div>
    )
}