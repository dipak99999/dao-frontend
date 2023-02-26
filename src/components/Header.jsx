import { Link } from "react-router-dom";
import { useEffect, useState } from 'react'
import { MdLightMode } from 'react-icons/md'
import { FaUserSecret, FaMoon } from 'react-icons/fa'
import { truncate, useGlobalState } from "../store";
import { connectWallet } from "../Blockchain.services";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.theme)
  const themeColor = theme === 'dark' ? 'light' : 'dark'
  const darken = theme === 'dark' ? true : false
  const [connectedAccount] = useGlobalState('connectedAccount')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(themeColor)
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [themeColor, theme])

  const toggleLight = () => {
    const root = window.document.documentElement
    root.classList.remove(themeColor)
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
    setTheme(themeColor)
  }
  return (
    <header className="sticky top-0">
      <nav
        className="navbar navbar-expand-lg shadow-md py-2 relative flex items-center w-full justify-between
      bg-white"
      >
        <div className="px-6 w-full flex flex-wrap items-center justify-between">
          <div className="grow flex flex-row justify-between items-center p-2">
            <Link to={"/"}>
              <FaUserSecret className="cursor-pointer" size={25} />
            </Link>
            
            <div className="flex flex-row justify-center items-center space-x-5">
            {darken ? (
                <MdLightMode
                  className="cursor-pointer"
                  size={25}
                  onClick={toggleLight}
                />
              ) : (
                <FaMoon
                  className="cursor-pointer"
                  size={25}
                  onClick={toggleLight}
                />
              )}

              {connectedAccount ? (
                <button
                className="px-4 py-2.5 bg-blue-600 text-white
                font-medium text-xs leading-tight uppercase
                rounded-full hover:bg-blue-700
                focus:bg-blue-700 focus:outline-none
                focus:ring-0 active:bg-blue-800 "
                >
                  {truncate(connectedAccount, 4, 4, 11)}
                </button>
              ) : (
                <button
                  className="px-4 py-2.5 bg-blue-600 text-white
                  font-medium text-xs leading-tight uppercase
                  rounded-full hover:bg-blue-700
                  focus:bg-blue-700 focus:outline-none
                  focus:ring-0 active:bg-blue-800 "
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
