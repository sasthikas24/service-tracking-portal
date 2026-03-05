import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-blue-100">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </button>
            </div>
        </div>
    );
}
