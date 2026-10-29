import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCurrentUser } from './components/api/useCurrentUser'
import { Auth } from './components/redux/features/User/Auth';
import { useAppSelector } from './components/redux/app/hook';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { GlobalTopLoader } from './components/hooks/GlobalTopLoader';
import { ForgotPasswordView } from './components/redux/features/User/login/ForgotPasswordView';
import { ResetPasswordView } from './components/redux/features/User/login/ResetPasswordView';
import { LoginView } from './components/redux/features/User/login/LoginView';
import { ToastProvider } from './components/hooks/useToast';
import { VerifyEmailView } from './components/redux/features/User/login/VerifyEmailView';
import { AppSkeleton } from './components/hooks/AppSkeleton';


function App() {
    const user = useAppSelector(state => state.login.user)
    const { isFetched, isError, error, refetch, isFetching } = useCurrentUser();
    const [slow, setSlow] = useState(false);

    useEffect(() => {
        if (isFetched) { setSlow(false); return; }
        const t = setTimeout(() => setSlow(true), 6000);
        return () => clearTimeout(t);
    }, [isFetched]);
    const status = (error as any)?.response?.status;
    const serverDown = isFetched && isError && !user && status !== 401 && status !== 403;

    if (!isFetched) {
        return (
            <>
                <AppSkeleton />
                {slow && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black px-5 py-2.5 text-sm text-white shadow-lg">
                        Waking up the server. This can take up to a minute on the first visit.
                    </div>
                )}
            </>
        );
    }
    if (serverDown) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">We can't reach the server</h1>
                <p className="max-w-sm text-sm text-gray-500">It may be starting up or briefly unavailable. Your session is safe. Try again in a moment.</p>
                <button onClick={() => refetch()} disabled={isFetching} className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {isFetching ? "Trying…" : "Try again"}
                </button>
            </div>
        );
    }
    return (
        <>
            <ToastProvider>
                <GlobalTopLoader />
                <Routes>
                    <Route path="/" element={<Auth>
                        <LoginView />
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
                    <Route path="/verify-email" element={
                        <div className="min-h-screen flex items-center justify-center px-6"><VerifyEmailView /></div>
                    } />
                </Routes>
            </ToastProvider>
        </>
    )
}

export default App