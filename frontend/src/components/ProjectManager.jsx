/**
 * Project Manager Component
 * Save and load creative projects
 */

import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, FileText } from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const ProjectManager = () => {
  const { getCreativeData } = useCreativeStore();
  const [savedProjects, setSavedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('tesco_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [projectName, setProjectName] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const saveProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const creativeData = getCreativeData();
    const project = {
      id: Date.now(),
      name: projectName.trim(),
      data: creativeData,
      createdAt: new Date().toISOString(),
      thumbnail: null, // Could add canvas screenshot here
    };

    const updated = [...savedProjects, project];
    setSavedProjects(updated);
    localStorage.setItem('tesco_projects', JSON.stringify(updated));

    // Also save as JSON file
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.trim()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Project "${projectName}" saved!`);
    setProjectName('');
    setShowDialog(false);
  };

  const loadProject = (project) => {
    if (confirm(`Load project "${project.name}"? Current work will be lost if not saved.`)) {
      // Reload the page with project data in sessionStorage
      sessionStorage.setItem('tesco_load_project', JSON.stringify(project.data));
      window.location.reload();
    }
  };

  const deleteProject = (projectId) => {
    const project = savedProjects.find(p => p.id === projectId);
    if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      const updated = savedProjects.filter(p => p.id !== projectId);
      setSavedProjects(updated);
      localStorage.setItem('tesco_projects', JSON.stringify(updated));
      toast.success('Project deleted');
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>
        <FileText size={18} style={{ display: 'inline', marginRight: '8px' }} />
        Projects
      </h4>

      <button
        onClick={() => setShowDialog(true)}
        className="btn-primary"
        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
      >
        <Save size={16} />
        Save Project
      </button>

      {showDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%',
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Save Project</h3>

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              style={{ width: '100%', marginBottom: '16px' }}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && saveProject()}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowDialog(false)}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {savedProjects.length > 0 && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          maxHeight: '300px',
          overflow: 'auto',
        }}>
          <h5 style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-sm)',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Saved Projects ({savedProjects.length})
          </h5>

          {savedProjects.map(project => (
            <div
              key={project.id}
              style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <strong style={{ fontSize: '14px' }}>{project.name}</strong>
                <button
                  onClick={() => deleteProject(project.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                {new Date(project.createdAt).toLocaleDateString()} at {new Date(project.createdAt).toLocaleTimeString()}
              </div>

              <button
                onClick={() => loadProject(project)}
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: '12px'
                }}
              >
                <FolderOpen size={14} />
                Load Project
              </button>
            </div>
          ))}
        </div>
      )}

      {savedProjects.length === 0 && (
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)'
        }}>
          No saved projects yet
        </p>
      )}
    </div>
  );
};

export default ProjectManager;
