export default function Footer() {
  return (
    <footer className="text-center">
      <hr />
      <div className="flex justify-center flex-wrap text-gray-500 py-3">
        <a
          className="text-blue-500 hover:text-blue-700 pr-2"
          target="_blank"
          rel="noreferrer"
          href="https://www.flaticon.com/free-icons/drum"
          title="drum icons"
        >
          Drum icons created by Freepik - Flaticon
        </a>
        <p className="pl-2 min-[456px]:border-l border-gray-300">
          Based on{' '}
          <a
            className="text-blue-500 hover:text-blue-700"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/cptleo92/StickControl"
          >
            cptleo92/StickControl
          </a>
        </p>
      </div>
    </footer>
  );
}
