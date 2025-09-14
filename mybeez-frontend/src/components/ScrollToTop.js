import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // The 'instant' behavior prevents a smooth scroll, making it feel immediate
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant',
            });
        }, 0);

        // Clean up the timer if the component unmounts before the timeout finishes
        return () => clearTimeout(timer);

    }, [pathname]);

    return null;
}

export default ScrollToTop;