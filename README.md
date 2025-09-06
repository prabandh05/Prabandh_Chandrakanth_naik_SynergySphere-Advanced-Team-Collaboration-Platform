# SynergySphere - Advanced Team Collaboration Platform

A modern, full-stack team collaboration platform built with React, TypeScript, and Supabase. Features include project management, real-time chat, task tracking with Kanban boards, and a unique synergy scoring system.

## 🚀 Features

- **Project Management**: Create, manage, and collaborate on projects
- **Task Management**: Kanban board with drag-and-drop functionality
- **Real-time Chat**: Project-specific discussion channels
- **Synergy Scoring**: Gamified collaboration tracking system
- **User Authentication**: Secure login/signup with Supabase Auth
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/prabandh05/Prabandh_Chandrakanth_naik_SynergySphere-Advanced-Team-Collaboration-Platform.git
   cd Prabandh_Chandrakanth_naik_SynergySphere-Advanced-Team-Collaboration-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL schema from `SETUP.md` in your Supabase SQL editor

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── KanbanBoard.tsx # Task management board
│   ├── ProjectCard.tsx # Project display component
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:
- `projects` - Project information
- `project_members` - Project team members
- `tasks` - Task management
- `messages` - Real-time chat
- `notifications` - User notifications
- `synergy_scores` - Collaboration scoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prabandh Chandrakanth Naik**
- GitHub: [@prabandh05](https://github.com/prabandh05)

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
