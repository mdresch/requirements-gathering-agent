import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { useConfig } from '@forge/react';

function App() {
  const [data, setData] = useState(null);
  const config = useConfig();

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  return (
    <div>
      <p>{data ? data : 'Loading...'} </p>
      <p>Macro configuration data:</p>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

export default App;
