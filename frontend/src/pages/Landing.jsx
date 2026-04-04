import React from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, ShieldCheck, ArrowRight, CheckCircle, Smartphone, Zap, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col font-sans overflow-x-hidden">
            {/* Navbar (Internal to Landing for specific styling if needed, otherwise uses component) */}
            <nav className="sticky top-0 z-50 glass-morphism border-b border-white/20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
                            <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">
                            ServicePortal
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-surface-900 border border-surface-200 px-4 py-2 rounded-xl font-semibold hover:bg-surface-100 transition-all text-sm"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="btn-primary py-2 text-sm"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative flex-1 flex items-center justify-center py-24 lg:py-32 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-brand-200/20 blur-[100px] rounded-full -z-10" />

                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-8 uppercase tracking-wider"
                    >
                        <Zap className="w-3 h-3" />
                        Next-Gen Service Management
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-surface-900 mb-8 leading-[1.1] tracking-tight font-display"
                    >
                        Seamless <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600">Service</span> <br />
                        Evolution.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xl text-surface-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Empower your team and satisfy your customers with the most intuitive service tracking portal ever built. Fast, transparent, and beautiful.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={() => navigate("/register")}
                            className="btn-primary group flex items-center justify-center gap-2 px-8 py-4 text-lg"
                        >
                            Raise a Complaint
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="btn-secondary px-8 py-4 text-lg"
                        >
                            Track Status
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        <motion.div variants={itemVariants} className="p-10 rounded-3xl glass-morphism hover:bg-brand-50/50 transition-all group border-surface-100">
                            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                <Smartphone className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-surface-900 mb-4 font-display">Easy Ticketing</h3>
                            <p className="text-surface-400 leading-relaxed">Experience zero-friction reporting. Categorize, describe, and submit issues in seconds from any device.</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-10 rounded-3xl glass-morphism hover:bg-brand-50/50 transition-all group border-surface-100">
                            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                <ShieldCheck className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-surface-900 mb-4 font-display">Admin Control</h3>
                            <p className="text-surface-400 leading-relaxed">Powerful sorting and filtering for admins. Manage high volumes of requests with precision and ease.</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-10 rounded-3xl glass-morphism hover:bg-brand-50/50 transition-all group border-surface-100">
                            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                <HeartHandshake className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-surface-900 mb-4 font-display">Live Tracking</h3>
                            <p className="text-surface-400 leading-relaxed">Total transparency. Get real-time updates and peace of mind through every stage of the resolution process.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-900 text-surface-400 py-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8 filter grayscale brightness-200 opacity-50">
                        <Ticket className="w-6 h-6" />
                        <span className="text-xl font-bold font-display">ServicePortal</span>
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Service Tracking Portal. Crafted for excellence.</p>
                </div>
            </footer>
        </div>
    );
}
