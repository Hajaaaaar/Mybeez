import React from 'react';
import { Link } from 'react-router-dom';

// --- Placeholder Social Icons ---
const SocialIcon = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors duration-300">
        {children}
    </a>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Branding */}
                    <div>
                        <h3 className="text-2xl font-black text-indigo-800">MyBeez</h3>
                        <p className="mt-2 text-slate-500 text-sm">&copy; {currentYear} MyBeez Inc. All rights reserved.</p>
                    </div>
                    {/* Links */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="font-bold text-slate-800">Company</h4>
                        <Link to="/about" className="text-slate-600 hover:text-indigo-600">About</Link>
                        <Link to="/contact" className="text-slate-600 hover:text-indigo-600">Contact</Link>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <h4 className="font-bold text-slate-800">Legal</h4>
                        <Link to="/privacy" className="text-slate-600 hover:text-indigo-600">Privacy Policy</Link>
                        <Link to="/terms" className="text-slate-600 hover:text-indigo-600">Terms & Conditions</Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t flex justify-center space-x-6">
                    <SocialIcon href="#">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                    </SocialIcon>
                    <SocialIcon href="#">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 4.22c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.002 6.363a4.734 4.734 0 100 9.468 4.734 4.734 0 000-9.468zm3.992-1.16a1.404 1.404 0 100 2.808 1.404 1.404 0 000-2.808z" clipRule="evenodd"></path></svg>
                    </SocialIcon>
                    <SocialIcon href="#">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                    </SocialIcon>
                </div>
            </div>
        </footer>
    );
};

export default Footer;