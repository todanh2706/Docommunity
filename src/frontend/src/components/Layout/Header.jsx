import { Link } from 'react-router'


export function Header() {
  return (
    <header>
      <div className="flex justify-between p-4  bg-white/3 shadow-lg z-12 ">

        {/* Logo bên trái */}

        <Link to="/" className="contents">
          <img src='logo.png' alt="Logo" className="h-12 w-auto" />
        </Link>

        {/* Nút ở góc phải */}
        <div className="flex gap-3">
          <Link to="#" className='contents'>
            <button className="px-4 py-2 font-semibold rounded hover:bg-gray-700 transition">
              Sign In
            </button>
          </Link>
          <Link to="#" className='contents'>
            <button className="px-4 py-2 font-semibold rounded
           bg-gradient-to-r from-[#062452] to-[#325C9E]
           hover:opacity-90 transition">
              Sign Up
            </button>
          </Link>
        </div>

      </div>

    </header>

  );
}