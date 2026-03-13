import { FaGithubSquare } from 'react-icons/fa';

export default function Nav() {
  return (
    <nav className="left-0 right-0 top-0 h-16 py-5 px-12 bg-white shadow-sm mb-4 flex items-center">
      <img src="/drum.png" alt="drum logo" className="mr-8 h-full" />
      <p>Interactive Stick Control</p>
      <a
        href="https://www.github.com/cptleo92"
        target="_blank"
        rel="noreferrer"
        className="ml-auto opacity-50 hover:opacity-80 text-2xl"
      >
        <FaGithubSquare />
      </a>
    </nav>
  );
}
