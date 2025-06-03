console.log('🔍 Checking Ollama status...');

async function checkOllamaStatus() {
    try {
        console.log('1. Testing if Ollama server is running...');
        
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Ollama server is running!');
            console.log('📋 Available models:');
            data.models?.forEach(model => {
                console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
            });
            return true;
        } else {
            console.log('❌ Ollama server responded but with error:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Ollama server not responding:', error.message);
        console.log('\n💡 To start Ollama:');
        console.log('   1. Open a new terminal/command prompt');
        console.log('   2. Run: ollama serve');
        console.log('   3. Wait for "Ollama is running" message');
        console.log('   4. Then run this script again');
        return false;
    }
}

checkOllamaStatus();