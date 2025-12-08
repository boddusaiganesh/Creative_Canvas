/**
 * Premium Header Component - World Class UI
 */

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Download, Save, Sparkles, Wifi, WifiOff, AlertCircle} from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import {exportMultipleFormats} from '../services/api';
import toast from 'react-hot-toast';

const Header = ({backendStatus}) => {
    const {getCreativeData, complianceResult} = useCreativeStore();
    const [isExporting, setIsExporting] = useState(false);
    
    // Use default value
    const status = backendStatus ?? 'unknown';

    const handleExportAll = async () => {
        if (isExporting) return;
        
        try {
            setIsExporting(true);
            toast.loading('Exporting all formats...', {id: 'export'});

            const creativeData = getCreativeData();
            const result = await exportMultipleFormats(creativeData, `tesco-creative-${Date.now()}`);

            if (result.success) {
                const successCount = Object.values(result.formats).filter(f => f.success).length;
                toast.success(`Exported ${successCount} formats successfully!`, {id: 'export'});
                
                // Download each format
                const formats = result.formats;
                for (const [formatKey, formatResult] of Object.entries(formats)) {
                    if (formatResult.success && formatResult.output_path) {
                        const downloadUrl = `http://localhost:8000${formatResult.output_path}`;
                        
                        // Fetch and download each file
                        try {
                            const response = await fetch(downloadUrl);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = `tesco-creative-${formatKey.replace(/:/g, 'x')}.jpg`;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                        } catch (err) {
                            console.error(`Download failed for ${formatKey}:`, err);
                            toast.error(`Failed to download ${formatKey}`, {duration: 2000});
                        }
                        
                        // Small delay between downloads
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                }
            } else {
                toast.error('Export failed', {id: 'export'});
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export creatives: ' + error.message, {id: 'export'});
        } finally {
            setIsExporting(false);
        }
    };

    const handleSave = () => {
        const creativeData = getCreativeData();
        const dataStr = JSON.stringify(creativeData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tesco-creative-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Creative saved!');
    };

    const complianceScore = complianceResult?.compliance_score || 0;
    
    const getStatusIcon = () => {
        switch (status) {
            case 'connected':
                return <Wifi size={16} style={{color: '#10B981'}} />;
            case 'error':
                return <WifiOff size={16} style={{color: '#EF4444'}} />;
            case 'checking':
                return <AlertCircle size={16} style={{color: '#F59E0B'}} />;
            default:
                return <AlertCircle size={16} style={{color: '#9CA3AF'}} />;
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="header-logo">
                        <Sparkles size={32} style={{color: '#E31837'}} />
                        <h1>Tesco Creative Studio</h1>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: status === 'connected' ? '#ECFDF5' : status === 'error' ? '#FEE2E2' : '#FEF3C7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                    }}>
                        {getStatusIcon()}
                        <span style={{
                            color: status === 'connected' ? '#065F46' : status === 'error' ? '#991B1B' : '#92400E'
                        }}>
                            {status === 'connected' ? 'Connected' : status === 'error' ? 'Offline' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    <button onClick={handleSave} disabled={status !== 'connected'}>
                        <Save size={18}/>
                        Save
                    </button>

                    <button
                        onClick={handleExportAll}
                        className="btn-primary"
                        disabled={isExporting || status !== 'connected'}
                        style={{
                            opacity: (isExporting || status !== 'connected') ? 0.6 : 1,
                            cursor: (isExporting || status !== 'connected') ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Download size={18}/>
                        {isExporting ? 'Exporting...' : 'Export All Formats'}
                    </button>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    backendStatus: PropTypes.oneOf(['connected', 'error', 'checking', 'unknown']),
};

export default Header;
