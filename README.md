# Shothik AI v3

**Shothik AI** is a comprehensive, AI-powered platform designed to revolutionize digital marketing and content creation. Version 3 brings a unified suite of tools ranging from advanced marketing automation for Meta platforms to essential content utilities like plagiarism detection and humanization.

## 🚀 Key Features

### 📢 Marketing Automation
An end-to-end solution for creating, managing, and publishing Meta (Facebook/Instagram) advertising campaigns.
- **URL Analysis**: Analyze product URLs to generate tailored marketing strategies using real-time AI streaming.
- **Campaign Canvas**: Interactive workspace to visualize and refine campaign structures, ad sets, and ads.
- **AI Media Studio**: Generate ad creatives, images, and videos using AI, or manage uploaded assets.
- **Meta Integration**: Seamlessly connect Facebook Business accounts to publish campaigns directly.
- **AI Chat Assistant**: Conversational interface to refine marketing strategies and ad copy.

### ✍️ Content Tools
A suite of AI-driven utilities to enhance content quality and authenticity.
- **AI Humanizer**: Rewrite AI-generated content to bypass AI detectors and sound more natural.
- **Plagiarism Detector**: Check content uniqueness against a vast database.
- **Grammar Checker**: Advanced grammar and style corrections.
- **Translator**: Accurate multi-language translation services.
- **Summarizer**: Condense long texts into concise summaries.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), Shadcn/ui, Framer Motion
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), [React Query](https://tanstack.com/query/latest)
- **Editor**: [Tiptap](https://tiptap.dev/), Monaco Editor
- **Data Handling**: Axios, Socket.io-client
- **Testing**: Vitest

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   *Note: Adjust the API URL if your backend is running on a different port or server.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── (primary-layout)/ # Main application layout routes
│   └── ...
├── components/           # Reusable UI components
│   ├── (primary-layout)/ # Components specific to primary layout
│   └── ...
├── redux/                # Redux state management (slices, store)
├── services/             # API services and external integrations
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and helpers
├── types/                # TypeScript type definitions
└── utils/                # General utility functions
```

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

[Add License Information Here]
