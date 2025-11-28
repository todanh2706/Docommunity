import { TypeAnimation } from 'react-type-animation';
import { LuArrowLeft } from 'react-icons/lu';
import RegisterForm from '../components/Auth/RegisterForm';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();

    return (
        <div className='h-screen w-screen bg-[url(/bg.gif)] bg-cover flex justify-center items-center animate-gradient'>
            <div className='absolute top-0 left-0 p-8'>
                <img
                    className='aspect-auto w-50 h-auto'
                    src='/logo.png'
                    onClick={() => navigate('/home')}
                    alt="Go to home page"
                />
            </div>
            <div className='w-full max-w-200 h-full max-h-200 backdrop-blur-xs backdrop-grayscale border-2 border-gray-700 text-white p-2 rounded-lg shadow-lg'>
                <div className='absolute top-0 left-0 p-6'>
                    <button
                        onClick={() => navigate('/login')}
                        className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-mono text-sm group'
                    >
                        <LuArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                        Back to Login
                    </button>
                </div>
                <div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='lg:mx-auto lg:w-full lg:max-w-lg text-center'>

                        <TypeAnimation
                            sequence={[
                                `Registration`,
                                2000,
                            ]}
                            wrapper='h1'
                            speed={40}
                            className='text-4xl font-mono tracking-tight text-blue-500 bg-clip-text'
                            // [&>span:last-child]:text-white'
                            repeat={Infinity}
                            cursor={true}
                        />

                        <h2 className='mt-6 text-xl/9 font-bold tracking-tight text-gray-300'>
                            Now we need your account, please register!
                        </h2>
                    </div>

                    <RegisterForm />
                </div>
            </div>
        </div >
    )
}