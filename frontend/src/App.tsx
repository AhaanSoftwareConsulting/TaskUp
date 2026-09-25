import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useCurrentUser } from './components/api/useCurrentUser'
import { Auth } from './components/redux/features/User/Auth';
import { useAppSelector, useAppDispatch } from './components/redux/app/hook';
import { logout } from './components/redux/features/User/login/loginSlice';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { GlobalTopLoader } from './components/hooks/GlobalTopLoader';
import { ForgotPasswordView } from './components/redux/features/User/login/ForgotPasswordView';
import { ResetPasswordView } from './components/redux/features/User/login/ResetPasswordView';
import { LoginView } from './components/redux/features/User/login/LoginView';
import { ToastProvider } from './components/hooks/useToast';


function App() {
    const user = useAppSelector(state => state.login.user)
    const dispatch = useAppDispatch();

    const { isFetched } = useCurrentUser();

    useEffect(() => {
        const handleSessionExpired = () => dispatch(logout());
        window.addEventListener('auth:sessionExpired', handleSessionExpired);
        return () => window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    }, [dispatch]);

    if (!isFetched) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Loading Application Session...
            </div>
        );
    }
    return (
        <>
        <ToastProvider>
            <GlobalTopLoader />
            <Routes>
                <Route path="/" element={<Auth>
                    <LoginView/>
                </Auth>} />
                <Route
                    path="/:role/dashboard/*"
                    element={
                        user?.full_name ? (
                            <AdminDashboard />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route path="/forgot-password" element={
                    <div className="min-h-screen flex items-center justify-center px-6">
                        <Auth>
                            <ForgotPasswordView />
                        </Auth>
                        
                    </div>
                } />
                <Route path="/reset-password" element={
                    <div className="min-h-screen flex items-center justify-center px-6">
                        <Auth><ResetPasswordView /></Auth>
                    </div>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ToastProvider>
        </>
    )
}

export default App