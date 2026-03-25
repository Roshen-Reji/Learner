import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <nav className="flex justify-between items-center mb-12 border-b border-gray-200 pb-4 max-w-5xl mx-auto">
        <div className="text-xl font-bold">
          Learn_Studio
        </div>
        <div className="flex items-center gap-6 font-medium">
          <Link href="/aptitude" className="hover:text-blue-600">Aptitude</Link>
          <Link href="/placement" className="hover:text-blue-600">Placements</Link>
          <Link href="/roadmap" className="hover:text-blue-600">Roadmaps</Link>
          <Link href="/login" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Login</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Learn Studio</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Access your modules below to start learning.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Link href="/aptitude" className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h2 className="font-bold text-xl mb-2 text-black">Aptitude Engine</h2>
            <p className="text-sm text-gray-600">Practice your logical reasoning with quick 5-minute sprints.</p>
          </Link>
          
          <Link href="/placement" className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h2 className="font-bold text-xl mb-2 text-black">Placements</h2>
            <p className="text-sm text-gray-600">Find hand-curated internships and fresher roles easily.</p>
          </Link>
          
          <Link href="/roadmap" className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h2 className="font-bold text-xl mb-2 text-black">Interactive Roadmaps</h2>
            <p className="text-sm text-gray-600">Explore AI-generated customized learning pathways updated daily.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
