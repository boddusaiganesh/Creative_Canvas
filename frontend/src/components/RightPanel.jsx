/**
 * Right Panel Component
 * Compliance validation and export options
 */

import React, {useState, useEffect} from 'react';
import {CheckCircle, AlertTriangle, XCircle, RefreshCw, Download} from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import {validateCompliance, exportCreative} from '../services/api';
import toast from 'react-hot-toast';
import StretchGoals from './StretchGoals';
import ProjectManager from './ProjectManager';

const RightPanel = () => {
    const {
        getCreativeData,
        complianceResult,
        setComplianceResult,
        isValidating,
        setIsValidating,
        headline,
        setHeadline,
        subhead,
        setSubhead,
        tagText,
        setTagText,
        isAlcoholCampaign,
        setIsAlcoholCampaign,
    } = useCreativeStore();

    const [activeSection, setActiveSection] = useState('compliance');

    // Auto-validate on changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleValidate();
        }, 2000);

        return () => clearTimeout(timer);
    }, [headline, subhead, tagText, isAlcoholCampaign]);

    const handleValidate = async () => {
        try {
            setIsValidating(true);
            const creativeData = getCreativeData();
            const result = await validateCompliance(creativeData);
            setComplianceResult(result);
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Validation failed');
        } finally {
            setIsValidating(false);
        }
    };

    const handleExport = async (formatType) => {
        try {
            console.log('🔽 Starting export for format:', formatType);
            toast.loading(`Exporting ${formatType}...`, {id: 'export-single'});

            const creativeData = getCreativeData();
            console.log('📦 Creative data:', creativeData);
            console.log('📊 Elements count:', creativeData.elements?.length || 0);
            console.log('🎨 Background:', creativeData.background_color);
            
            const filename = `tesco-creative-${formatType.replace(/:/g, '-')}`;
            const result = await exportCreative(
                creativeData,
                formatType,
                'JPEG',
                filename
            );

            console.log('📬 Export result:', result);

            if (result.success && result.output_path) {
                toast.success(`Exported ${formatType}! Size: ${result.file_size_kb}KB`, {id: 'export-single'});
                
                // Trigger download - fetch as blob to force download
                console.log('⬇️ Downloading from:', result.output_path);
                const downloadUrl = `http://localhost:8000${result.output_path}`;
                console.log('🔗 Download URL:', downloadUrl);
                
                // Fetch the file as a blob and create download link
                fetch(downloadUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        // Create blob URL
                        const blobUrl = window.URL.createObjectURL(blob);
                        
                        // Create temporary link with download attribute
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${filename}.jpg`;
                        link.style.display = 'none';
                        
                        // Add to document, click, and remove
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up blob URL
                        window.URL.revokeObjectURL(blobUrl);
                        
                        console.log('✅ Download triggered successfully');
                    })
                    .catch(err => {
                        console.error('❌ Download error:', err);
                        toast.error('Download failed', {id: 'export-single'});
                    });
            } else {
                console.error('❌ Export failed:', result);
                toast.error('Export failed', {id: 'export-single'});
            }
        } catch (error) {
            console.error('❌ Export error:', error);
            toast.error('Failed to export: ' + error.message, {id: 'export-single'});
        }
    };

    const getComplianceScoreClass = (score) => {
        if (score >= 90) return 'high';
        if (score >= 70) return 'medium';
        return 'low';
    };

    return (
        <aside className="right-panel">
            {/* Tabs */}
            <div className="flex" style={{borderBottom: '1px solid var(--border)'}}>
                <button
                    className={`flex-1 py-3 ${activeSection === 'compliance' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveSection('compliance')}
                    style={{
                        border: 'none',
                        background: activeSection === 'compliance' ? 'var(--bg-secondary)' : 'transparent'
                    }}
                >
                    <CheckCircle size={18} style={{display: 'inline-block', marginRight: '4px'}}/>
                    Compliance
                </button>
                <button
                    className={`flex-1 py-3 ${activeSection === 'content' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveSection('content')}
                    style={{
                        border: 'none',
                        background: activeSection === 'content' ? 'var(--bg-secondary)' : 'transparent'
                    }}
                >
                    Content
                </button>
                <button
                    className={`flex-1 py-3 ${activeSection === 'export' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveSection('export')}
                    style={{
                        border: 'none',
                        background: activeSection === 'export' ? 'var(--bg-secondary)' : 'transparent'
                    }}
                >
                    <Download size={18} style={{display: 'inline-block', marginRight: '4px'}}/>
                    Export
                </button>
            </div>

            {/* Compliance Section */}
            {activeSection === 'compliance' && (
                <div className="compliance-panel">
                    <div className="flex justify-between items-center mb-md">
                        <h3 style={{margin: 0}}>Compliance Check</h3>
                        <button
                            onClick={handleValidate}
                            className="btn-text"
                            disabled={isValidating}
                        >
                            <RefreshCw size={16} className={isValidating ? 'spinner' : ''}/>
                        </button>
                    </div>

                    {complianceResult ? (
                        <>
                            <div
                                className={`compliance-score ${getComplianceScoreClass(complianceResult.compliance_score)}`}>
                                {complianceResult.compliance_score}%
                            </div>

                            <div className="text-secondary" style={{marginBottom: 'var(--spacing-md)'}}>
                                {complianceResult.passed_rules} / {complianceResult.total_rules} rules passed
                            </div>

                            {complianceResult.is_compliant ? (
                                <div className="flex items-center gap-sm" style={{color: 'var(--success)'}}>
                                    <CheckCircle size={20}/>
                                    <span style={{fontWeight: '500'}}>All checks passed!</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-sm" style={{color: 'var(--error)'}}>
                                    <XCircle size={20}/>
                                    <span style={{fontWeight: '500'}}>
                    {complianceResult.errors.length} issues found
                  </span>
                                </div>
                            )}

                            {/* Errors */}
                            {complianceResult.errors.length > 0 && (
                                <div className="compliance-issues">
                                    <h4 style={{
                                        fontSize: '0.875rem',
                                        marginBottom: 'var(--spacing-sm)',
                                        color: 'var(--error)'
                                    }}>
                                        Errors
                                    </h4>
                                    {complianceResult.errors.map((error, index) => (
                                        <div key={index} className="compliance-issue error">
                                            <div style={{fontWeight: '600', marginBottom: '4px'}}>
                                                {error.rule}
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                                                {error.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Warnings */}
                            {complianceResult.warnings.length > 0 && (
                                <div className="compliance-issues">
                                    <h4 style={{
                                        fontSize: '0.875rem',
                                        marginBottom: 'var(--spacing-sm)',
                                        color: 'var(--warning)'
                                    }}>
                                        Warnings
                                    </h4>
                                    {complianceResult.warnings.map((warning, index) => (
                                        <div key={index} className="compliance-issue warning">
                                            <div style={{fontWeight: '600', marginBottom: '4px'}}>
                                                {warning.rule}
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                                                {warning.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-secondary" style={{padding: 'var(--spacing-xl)'}}>
                            <AlertTriangle size={48} style={{opacity: 0.3, marginBottom: 'var(--spacing-md)'}}/>
                            <p>Start creating to see compliance status</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
                <div className="panel-section">
                    <h4>Creative Content</h4>

                    <div style={{marginBottom: 'var(--spacing-md)'}}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            Headline
                        </label>
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="Enter headline..."
                            maxLength={50}
                        />
                        <small className="text-secondary">{headline.length}/50</small>
                    </div>

                    <div style={{marginBottom: 'var(--spacing-md)'}}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            Subhead
                        </label>
                        <input
                            type="text"
                            value={subhead}
                            onChange={(e) => setSubhead(e.target.value)}
                            placeholder="Enter subhead..."
                            maxLength={80}
                        />
                        <small className="text-secondary">{subhead.length}/80</small>
                    </div>

                    <div style={{marginBottom: 'var(--spacing-md)'}}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            Tesco Tag
                        </label>
                        <select
                            value={tagText}
                            onChange={(e) => setTagText(e.target.value)}
                        >
                            <option value="">No tag</option>
                            <option value="Only at Tesco">Only at Tesco</option>
                            <option value="Available at Tesco">Available at Tesco</option>
                            <option value="Selected stores. While stocks last.">Selected stores. While stocks last.
                            </option>
                        </select>
                    </div>

                    <div style={{marginBottom: 'var(--spacing-md)'}}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isAlcoholCampaign}
                                onChange={(e) => setIsAlcoholCampaign(e.target.checked)}
                            />
                            <span style={{fontSize: '0.875rem', fontWeight: '500'}}>
                This is an alcohol campaign
              </span>
                        </label>
                        <small className="text-secondary">
                            (Drinkaware lock-up required)
                        </small>
                    </div>
                </div>
            )}

            {/* Export Section */}
            {activeSection === 'export' && (
                <div className="panel-section">
                    <h4>Export Creative</h4>

                    <div className="export-options">
                        <button
                            onClick={() => handleExport('1:1')}
                            className="btn-outline"
                            style={{width: '100%', justifyContent: 'flex-start'}}
                        >
                            <Download size={16}/>
                            Square (1:1) - 1080x1080
                        </button>

                        <button
                            onClick={() => handleExport('9:16')}
                            className="btn-outline"
                            style={{width: '100%', justifyContent: 'flex-start'}}
                        >
                            <Download size={16}/>
                            Story (9:16) - 1080x1920
                        </button>

                        <button
                            onClick={() => handleExport('1.91:1')}
                            className="btn-outline"
                            style={{width: '100%', justifyContent: 'flex-start'}}
                        >
                            <Download size={16}/>
                            Landscape (1.91:1) - 1200x628
                        </button>

                        <button
                            onClick={() => handleExport('4:5')}
                            className="btn-outline"
                            style={{width: '100%', justifyContent: 'flex-start'}}
                        >
                            <Download size={16}/>
                            Portrait (4:5) - 1080x1350
                        </button>
                    </div>

                    {complianceResult && !complianceResult.is_compliant && (
                        <div style={{
                            marginTop: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            backgroundColor: '#fff9e6',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--warning)'
                        }}>
                            <AlertTriangle size={16} style={{
                                display: 'inline-block',
                                marginRight: '4px',
                                color: 'var(--warning)'
                            }}/>
                            <span style={{fontSize: '0.875rem'}}>
                Fix compliance issues before exporting
              </span>
                        </div>
                    )}
                    
                    <StretchGoals />
                    
                    <ProjectManager />
                </div>
            )}
        </aside>
    );
};

export default RightPanel;
