import { TypeAnimation } from 'react-type-animation';
import LoginForm from '../components/Auth/LoginForm';

export default function Login() {

    return (
        <div className='h-screen w-screen bg-[url(/bg.gif)] bg-cover flex justify-center items-center animate-gradient'>
            <div className='absolute top-0 left-0 p-8'>
                <img
                    className='aspect-auto w-40 h-auto'
                    src='/logo.png'
                />
            </div>
            <div className='w-full max-w-200 backdrop-blur-xs backdrop-grayscale border-2 border-gray-700 text-white p-8 rounded-lg shadow-lg'>
                <div className='flex min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='lg:mx-auto lg:w-full lg:max-w-lg text-center'>

                        <TypeAnimation
                            sequence={[
                                `Welcome to Docommunity!!!`,
                                2000,
                            ]}
                            wrapper='h1'
                            speed={40}
                            className='text-4xl font-mono tracking-tight text-blue-500 bg-clip-text'
                            repeat={Infinity}
                            cursor={true}
                        />

                        <p className='mt-3 text-lg text-gray-400'>
                            The Markdown editor you can share!
                        </p>

                        <h2 className='mt-6 text-xl/9 font-bold tracking-tight text-gray-300'>
                            Now we need your account, please log in!
                        </h2>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div >
    )
}