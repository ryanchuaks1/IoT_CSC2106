import Link from "next/link";

export default function Header() {
  return (
    <div className="w-screen flex justify-between border-b-slate-200 border-b-2 p-4 shadow-sm sticky top-0">
      <div className="text-3xl font-semibold font-['Rockwell'] place-self-center">Traffic SG</div>
      <Link href={"/api/sandbox"} className="p-2 border-2 rounded-md hover:bg-slate-100">
        Api Sandbox
      </Link>
    </div>
  );
}
