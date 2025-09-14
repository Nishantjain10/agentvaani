# AgentVaani - Consent-First Voice Agent Platform

A comprehensive voice agent platform built with Next.js and Appwrite, designed for verified insurance workers to create AI voice agents that call only opted-in customers with high-quality Hindi voice synthesis.

## 🚀 Features

- **Consent-First Architecture**: Only calls customers who have explicitly opted in
- **Hindi Voice Agents**: High-quality TTS with natural conversation flow
- **Appwrite-Only Backend**: Serverless functions for all processing
- **Gemini AI Integration**: Advanced text processing and conversation analysis
- **Real-time Transcription**: Web Speech API for live call transcription
- **Compliance Built-in**: Suppression lists, consent tracking, and audit trails
- **File Processing**: PDF parsing and web scraping for agent context
- **Customer Management**: CSV import with phone validation and consent collection

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Appwrite SDK** for backend integration

### Backend (Appwrite Only)
- **Authentication**: Email/password with phone OTP verification
- **Database**: Collections for workers, agents, customers, calls, uploads
- **Storage**: File uploads and call recordings
- **Functions**: Serverless processing for all business logic

### AI & Voice
- **Gemini AI**: Text processing, keyword extraction, transcript analysis
- **ElevenLabs**: High-quality Hindi TTS
- **Web Speech API**: Real-time speech recognition
- **Twilio**: SMS and voice call orchestration

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Appwrite Cloud account or self-hosted instance
- Google AI Studio account (Gemini API)
- ElevenLabs account
- Twilio account

### Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd agentvaani
   npm install
   ```

2. **Set up Appwrite database**
   ```bash
   npm install node-appwrite
   node scripts/setup-appwrite.js
   node scripts/fix-boolean-attributes.js
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Deploy Appwrite Functions**
   ```bash
   node scripts/deploy-functions.js
   # Then upload function code via Appwrite Console
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [APPWRITE_SETUP.md](./APPWRITE_SETUP.md).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── (marketing)/   # Landing page
│   │   └── consent/       # Consent collection
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── agents/           # Voice agent management
│   ├── calls/            # Call interface and management
│   ├── customers/        # Customer management
│   ├── dashboard/        # Dashboard components
│   └── uploads/          # File upload components
├── libs/                 # Utility libraries
│   ├── appwrite.ts       # Appwrite configuration
│   ├── auth.ts           # Authentication service
│   ├── gemini.ts         # Gemini AI integration
│   └── speechRecognition.ts # Speech recognition
└── types/                # TypeScript type definitions

appwrite-functions/       # Serverless functions
├── parse-file/          # PDF/URL parsing with Gemini
├── consent-manager/     # SMS/call consent collection
├── call-orchestrator/   # Voice call orchestration
└── transcript-analyzer/ # Call transcript analysis
```

## 🔧 Key Components

### Authentication Flow
1. Worker signup with email/password
2. Phone OTP verification via Appwrite
3. Profile completion with role and location
4. Dashboard access with proper permissions

### Agent Creation
1. Choose voice profile (Hindi TTS)
2. Upload context documents (PDFs/URLs)
3. Configure script templates
4. Set up conversation parameters

### Customer Management
1. Import customers via CSV
2. Validate phone numbers and check suppression list
3. Send consent requests via SMS or verification calls
4. Track consent status and compliance

### Call Orchestration
1. Select opted-in customer and voice agent
2. Generate context-aware script using Gemini AI
3. Initiate call via Twilio with real-time transcription
4. Analyze transcript and determine outcome
5. Store recording and compliance data

## 🔒 Compliance Features

- **Explicit Opt-in Only**: No cold calling allowed
- **Consent Tracking**: Detailed logs of all consent interactions
- **Suppression Lists**: Automatic filtering of do-not-call numbers
- **Call Recording**: All calls recorded with proper disclaimers
- **Audit Trails**: Complete history of all customer interactions
- **Data Privacy**: Secure storage and user data isolation

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
1. Deploy to Vercel/Netlify
2. Configure production Appwrite instance
3. Set up Twilio webhooks
4. Configure monitoring and logging

## 📊 Monitoring

- **Appwrite Console**: Function logs and database metrics
- **Twilio Console**: Call analytics and delivery reports
- **Dashboard**: Business metrics and compliance reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For setup help and troubleshooting:
1. Check [APPWRITE_SETUP.md](./APPWRITE_SETUP.md)
2. Review Appwrite function logs
3. Test individual components
4. Verify environment variables

## 🔮 Roadmap

- [ ] Multi-language support beyond Hindi
- [ ] Advanced analytics and reporting
- [ ] Integration with more TTS providers
- [ ] Automated compliance monitoring
- [ ] Enterprise features and scaling
