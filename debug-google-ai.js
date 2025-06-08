import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('=== Simple Google AI Test ===');

const apiKey = process.env.GOOGLE_AI_API_KEY;
console.log('1. API Key available:', !!apiKey);

if (apiKey) {
    try {
        console.log('2. Creating Google AI instance...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('   Model created successfully');
        
        console.log('3. Testing simple generation...');
        const result = await model.generateContent("Hello");
        const response = await result.response;
        const text = response.text();
        console.log('   Response received:', text.substring(0, 50) + '...');
        
    } catch (error) {
        console.error('   Error:', error.message);
    }
} else {
    console.log('2. No API key found');
}
