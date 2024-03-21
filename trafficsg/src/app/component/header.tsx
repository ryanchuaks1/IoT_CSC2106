// Import user-defined files
import Link from "next/link";

export default function Header() {
  return (
    <div className="w-screen flex justify-between border-b-slate-100 border-b-2 p-4 shadow-sm sticky top-0 bg-white">
      <Link
        href={"/"}
        className="text-3xl font-semibold font-['Rockwell'] place-self-center"
      >
        Traffic <span className="text-primary">SG</span>
      </Link>

      <nav className="flex">
        <Link
          href={"/traffic"}
          className="p-2 mr-2 border-2 rounded-md hover:bg-slate-100"
        >
          Traffic
        </Link>
        <Link
          href={"/api/sandbox"}
          className="p-2 border-2 rounded-md hover:bg-slate-100"
        >
          API Sandbox
        </Link>
      </nav>
    </div>
  );
}
