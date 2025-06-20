import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import { useConfig } from '@forge/react';

const useSubmit = () => {
  const [error, setError] = useState();
  const [message, setMessage] = useState('');

  const submit = async (fields) => {
    const payload = { config: fields };

    try {
      await view.submit(payload);
      setError(false);
      setMessage(`Configuration saved successfully!`);
    } catch (error) {
      setError(true);
      setMessage(`Failed to save configuration: ${error.message}`);
    }
  };

  return {
    error,
    message,
    submit
  };
};

const Config = () => {
  const [spaceKey, setSpaceKey] = useState('ADPA');
  const [gitRepo, setGitRepo] = useState('https://github.com/CBA-Consult/requirements-gathering-agent');
  const [gitBranch, setGitBranch] = useState('main');
  const { error, message, submit } = useSubmit();
  const config = useConfig();

  useEffect(() => {
    setSpaceKey(config?.spaceKey || 'ADPA');
    setGitRepo(config?.gitRepo || 'https://github.com/CBA-Consult/requirements-gathering-agent');
    setGitBranch(config?.gitBranch || 'main');
  }, [config]);

  const handleSubmit = () => {
    submit({
      spaceKey,
      gitRepo,
      gitBranch
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <h2 style={{ color: '#172b4d', marginBottom: '20px' }}>🔧 Git to Confluence Publisher Configuration</h2>
      <p style={{ color: '#6b778c', marginBottom: '24px' }}>Configure the basic settings for publishing Git repository content to Confluence.</p>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="spaceKey" style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#172b4d' }}>
          Confluence Space Key
        </label>
        <input 
          type="text" 
          id="spaceKey" 
          value={spaceKey} 
          onChange={(e) => setSpaceKey(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '1px solid #dfe1e6', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="e.g., ADPA"
        />
        <small style={{ color: '#6b778c' }}>The space where documents will be published</small>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="gitRepo" style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#172b4d' }}>
          Git Repository URL
        </label>
        <input 
          type="text" 
          id="gitRepo" 
          value={gitRepo} 
          onChange={(e) => setGitRepo(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '1px solid #dfe1e6', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="https://github.com/username/repository"
        />
        <small style={{ color: '#6b778c' }}>The Git repository to read content from</small>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="gitBranch" style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#172b4d' }}>
          Git Branch
        </label>
        <input 
          type="text" 
          id="gitBranch" 
          value={gitBranch} 
          onChange={(e) => setGitBranch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '1px solid #dfe1e6', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="main"
        />
        <small style={{ color: '#6b778c' }}>The branch to read content from</small>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button 
          onClick={handleSubmit}
          style={{
            background: '#0052cc',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Save Configuration
        </button>
        <button 
          onClick={() => view.close()}
          style={{
            background: '#dfe1e6',
            color: '#172b4d',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>

      {typeof error !== 'undefined' && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '4px', 
          marginTop: '12px',
          backgroundColor: error ? '#ffebe6' : '#e3fcef',
          color: error ? '#de350b' : '#006644',
          border: error ? '1px solid #ffbdad' : '1px solid #abf5d1'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Config;
