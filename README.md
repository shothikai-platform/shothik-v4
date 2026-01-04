# Shothik AI v4

> Making AI Writing Simple & Accessible

Shothik AI is a comprehensive AI-powered SaaS platform for digital marketing automation, content creation, and academic writing. Serving users in over 150 countries, the platform provides an integrated ecosystem that eliminates the need for multiple fragmented tools.

## 🚀 Features

### 1. AI Writing & Content Tools
- **Paraphrase** - Rewrite content with multiple modes (Basic, Formal, Creative)
- **AI Humanizer** - Transform AI-generated text to bypass detection systems
- **AI Detector** - Analyze text to identify AI-generated patterns
- **Grammar Checker** - Advanced grammar and spelling correction with real-time feedback
- **Plagiarism Checker** - Scan for duplicate content across the web
- **Summarizer & Translator** - Condense and translate text efficiently

### 2. Academic Writing Studio
A PaperDebugger-inspired academic writing environment featuring:
- **Rich Text Editor** - TipTap-based editor with floating BubbleMenu for inline AI actions
- **Inline Processing** - Paraphrase, humanize, and grammar fix directly in the editor
- **Diff Preview** - Visual before/after comparison with Accept/Reject buttons
- **Real-time Analysis** - Flesch-Kincaid readability scoring, passive voice detection, writing statistics
- **Citation Tools** - CrossRef and Open Library integration with APA, MLA, and Chicago formatting
- **Reference Manager** - Build and export bibliographies
- **Writing Templates** - Pre-built structures for research papers, essays, thesis chapters, lab reports
- **Guided Onboarding** - 5-step tour using Driver.js for new users

### 3. Shothik Agents (Automation)
- **AI Slides** - Automated presentation generation
- **AI Sheets** - Spreadsheet automation and data analysis
- **Deep Research** - In-depth research with real-time streaming and web scraping
- **Browse for Me** - (Coming Soon) Autonomous web navigation and information retrieval

### 4. Vibe Meta Automation (Business)
End-to-end Meta (Facebook/Instagram) advertising automation:
- **AI Strategy Generation** - Analyze products/services to create marketing strategies
- **Creative Automation** - Generate ad copy and creatives
- **Campaign Management** - Launch and optimize Meta ad campaigns
- **Brand Voice Consistency** - Maintain consistent persona across all content

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - App Router with Server Components and React 19
- **TypeScript** - Type-safe development with relaxed strict mode
- **Tailwind CSS v4** - Utility-first styling with CSS variables for theming
- **Redux Toolkit** - Global state management for auth, analytics, and feature slices
- **React Query (TanStack Query)** - Server state and API data caching
- **Radix UI + shadcn/ui** - Accessible component primitives (new-york style)
- **Tiptap** - Rich text editing framework
- **Framer Motion** - Animation library
- **Monaco Editor** - Code editing capabilities

### Backend Services
- **Python 3.11** - NLP inference service with FastAPI/Uvicorn
- **PyTorch** - Deep learning models for paraphrasing and NLP
- **spaCy** - Natural language processing and dependency parsing
- **Docker** - Containerization for backend services

### Backend API Integration
- **Node.js/TypeScript** - API services and business logic
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time streaming for research and AI features
- **Redis (ioredis)** - Caching and session management

### Third-Party Integrations
- **Meta/Facebook Business API** - OAuth, ad publishing, page management, pixel tracking
- **Stripe** - Payment processing
- **Cloudinary & ImageKit** - Image hosting and CDN
- **Google OAuth** - Authentication via `@react-oauth/google`
- **Google Vertex AI Search** - Deep research grounding

## 📁 Project Structure

```
shothik-v4/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components (ui/, tools/, presentation/)
│   ├── hooks/            # Custom React hooks
│   ├── redux/            # Redux store, slices, and RTK Query APIs
│   ├── services/         # API communication and business logic
│   ├── lib/              # Utility libraries
│   ├── types/            # TypeScript type definitions
│   ├── adapters/         # Data transformation adapters
│   └── config/           # Configuration constants and routes
├── backend-services/
│   ├── nlp-inference-service/   # Python-based NLP and grammar service
│   └── paraphrase-service/      # Paraphrasing microservice
├── public/               # Static assets
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** 20+ and npm/pnpm
- **Docker** (for backend services)
- **Python 3.11** (for local backend development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shothikai-platform/shothik-v4.git
   cd shothik-v4
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_key
   # Add other required environment variables
   ```

4. **Start the NLP backend service**
   
   Use the master setup script to start the NLP inference service:
   ```bash
   ./MASTER-SETUP.sh
   ```
   
   This will:
   - Clear port 8080
   - Pull or run the NLP Docker image
   - Start the service at `http://localhost:3000`

   Alternatively, build and run manually:
   ```bash
   cd backend-services/nlp-inference-service
   docker build -t nlp-inference-service .
   docker run -d -p 8080:8080 nlp-inference-service
   ```

5. **Start the Next.js development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Architecture Patterns

1. **Service Layer Pattern** - Business logic separated in `/src/services/`
2. **Custom Hooks** - Complex features encapsulated in hooks (e.g., `useWritingStudioLimits`)
3. **Redux Slices per Feature** - Each major feature has its own Redux slice
4. **Backend-for-Frontend** - Next.js API routes proxy requests to Python backend
5. **Real-time Streaming** - Socket.io for live updates in research and AI features

### Code Standards

- Use TypeScript for all new code with explicit types
- Follow functional programming patterns where appropriate
- Implement proper error handling with custom error classes
- Use async/await for asynchronous operations
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions

## 🔐 Authentication

- JWT token-based authentication stored in cookies
- Google OAuth integration
- Middleware protects `/dashboard/*` routes
- Unauthenticated users redirected to `/auth/login`

## 💳 Pricing Tiers

- **Free** - Basic usage with limited AI actions
- **Starter** - For students ($9/month)
- **Pro** - For creators/professionals with unlimited AI actions
- **Business** - For agencies with Meta automation ($99/month)

## 🧪 Testing

```bash
# Run E2E tests with Playwright
npx playwright test
```

## 🐳 Docker

The NLP inference service is containerized with multi-stage Docker builds:
- Stage 1: Build dependencies and download ML models
- Stage 2: Slim runtime with Python 3.11

## 📝 License

Private - Proprietary software for Shothik AI platform

## 🤝 Contributing

This is a private repository. For team members:
1. Create a feature branch from `main`
2. Make your changes following the code standards
3. Submit a pull request with a clear description
4. Ensure all tests pass and linting is clean

## 📧 Support

For issues or questions, contact the development team or refer to internal documentation.

---

**Shothik AI** - Empowering users worldwide with accessible, intelligent content tools.
