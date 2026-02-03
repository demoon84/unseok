import React from 'react';
import { t } from '../../../utils/i18n';
import styles from './ShareButton.module.css';

export function ShareButton({ score, onShare }) {
    const shareText = t('shareText', { score: score.toLocaleString() });
    const shareTitle = t('shareTitle', { score: score.toLocaleString() });
    const shareUrl = window.location.origin;

    const handleShare = async () => {
        // Web Share API 지원 시
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
                return;
            } catch (e) {
                // 취소 시 무시
                if (e.name === 'AbortError') return;
            }
        }

        // 폴백: 클립보드 복사
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            onShare?.('copied');
        } catch (e) {
            console.error('Share failed:', e);
        }
    };

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    const handleKakaoShare = () => {
        // 카카오 공유는 SDK 필요 - URL로 폴백
        handleShare();
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.shareBtn}
                onClick={handleShare}
                onTouchEnd={(e) => { e.preventDefault(); handleShare(); }}
            >
                📤 {t('share')}
            </button>

            <div className={styles.socialButtons}>
                <button
                    className={`${styles.socialBtn} ${styles.twitter}`}
                    onClick={handleTwitterShare}
                    onTouchEnd={(e) => { e.preventDefault(); handleTwitterShare(); }}
                    title="Twitter/X"
                >
                    𝕏
                </button>
            </div>
        </div>
    );
}
