/**
 * Main App Component - Premium World-Class UI
 * Tesco Creative Studio
 */

import React, {useEffect, useState} from 'react';
import {Toaster} from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import RightPanel from './components/RightPanel';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingOverlay from './components/LoadingOverlay';
import {checkHealth} from './services/api';
import toast from 'react-hot-toast';
import './styles/App.css';

function App() {
    const [isInitializing, setIsInitializing] = useState(true);
    const [backendStatus, setBackendStatus] = useState('checking');

    useEffect(() => {
        document.title = 'Tesco Creative Studio - AI-Powered Creative Tool';
        
        // Check backend connection
        const checkBackend = async () => {
            try {
                await checkHealth();
                setBackendStatus('connected');
                toast.success('Connected to backend successfully');
            } catch (error) {
                setBackendStatus('error');
                toast.error('Backend connection failed. Please start the backend server.');
                console.error('Backend check failed:', error);
            } finally {
                setTimeout(() => setIsInitializing(false), 500);
            }
        };
        
        checkBackend();
    }, []);

    return (
        <ErrorBoundary>
            <div className="app">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '16px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            fontWeight: '600',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                        loading: {
                            iconTheme: {
                                primary: '#3B82F6',
                                secondary: '#fff',
                            },
                        },
                    }}
                />

                {isInitializing && (
                    <LoadingOverlay 
                        isLoading={isInitializing} 
                        message="Initializing Tesco Creative Studio..."
                    />
                )}

                {!isInitializing && (
                    <>
                        <Header backendStatus={backendStatus} />

                        <main className="main-content">
                            <Sidebar/>
                            <CanvasArea/>
                            <RightPanel/>
                        </main>
                    </>
                )}
            </div>
        </ErrorBoundary>
    );
}

export default App;
