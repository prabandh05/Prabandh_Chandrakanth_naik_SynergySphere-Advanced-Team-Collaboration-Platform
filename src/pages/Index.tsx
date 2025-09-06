import { SplashCursor } from "@/components/ui/splash-cursor";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <SplashCursor />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SynergySphere
        </div>
        <div className="flex items-center gap-6">
          <a href="#concepts" className="text-muted-foreground hover:text-foreground transition-colors">
            Concepts
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </a>
          <Button variant="outline" size="sm">
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Stop Juggling Tools.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Start Building Synergy.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The intelligent platform that organizes your projects, streamlines communication, 
            and measures team collaboration with our unique Synergy Score system.
          </p>
          
          <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground group">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>

      {/* Concepts Section */}
      <section id="concepts" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why SynergySphere?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border border-border">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Unified Hub</h3>
              <p className="text-muted-foreground">
                All your tasks, files, and chats in one place. No more switching between tools.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border border-border">
              <Target className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Clear Visibility</h3>
              <p className="text-muted-foreground">
                Track progress with an intuitive dashboard that shows what matters most.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border border-border">
              <TrendingUp className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Synergy Score</h3>
              <p className="text-muted-foreground">
                Gamify teamwork and identify top collaborators with our unique scoring system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">Our Vision</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At SynergySphere, we believe that great teams aren't just groups of talented individuals—
            they're ecosystems where collaboration creates exponential value. Our platform transforms 
            the chaos of scattered tools into a unified workspace where synergy isn't just measured, 
            it's cultivated.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
