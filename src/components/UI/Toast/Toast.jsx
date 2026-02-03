import React, { useState, useEffect, useCallback } from 'react';
import styles from './Toast.module.css';

// 토스트 컨텍스트를 위한 전역 상태
let toastCallback = null;

// 외부에서 토스트 표시 함수
export const showToast = (message, type = 'info', duration = 3000) => {
    if (toastCallback) {
        toastCallback({ message, type, duration, id: Date.now() });
    }
};

// 토스트 컨테이너 컴포넌트
export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        toastCallback = (toast) => {
            setToasts(prev => [...prev, toast]);

            // 자동 제거
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, toast.duration);
        };

        return () => {
            toastCallback = null;
        };
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type]}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className={styles.icon}>
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'warning' && '⚠'}
                        {toast.type === 'info' && 'ℹ'}
                        {toast.type === 'achievement' && '🏆'}
                    </span>
                    <span className={styles.message}>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}

// 편의 함수들
export const showSuccess = (message, duration) => showToast(message, 'success', duration);
export const showError = (message, duration) => showToast(message, 'error', duration);
export const showWarning = (message, duration) => showToast(message, 'warning', duration);
export const showInfo = (message, duration) => showToast(message, 'info', duration);
export const showAchievement = (message, duration = 4000) => showToast(message, 'achievement', duration);
