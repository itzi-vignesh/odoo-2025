import { Heart, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-primary">SkillSwap</h3>
            <p className="text-sm text-muted-foreground">
              Connect, learn, and grow through peer-to-peer skill exchange.
            </p>
            <div className="flex space-x-2">
              <Github className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
              <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">How it Works</li>
              <li className="hover:text-foreground cursor-pointer">Browse Skills</li>
              <li className="hover:text-foreground cursor-pointer">Success Stories</li>
              <li className="hover:text-foreground cursor-pointer">Safety Guidelines</li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">Help Center</li>
              <li className="hover:text-foreground cursor-pointer">Community Guidelines</li>
              <li className="hover:text-foreground cursor-pointer">Report Issue</li>
              <li className="hover:text-foreground cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">Terms of Service</li>
              <li className="hover:text-foreground cursor-pointer">Privacy Policy</li>
              <li className="hover:text-foreground cursor-pointer">Cookie Policy</li>
              <li className="hover:text-foreground cursor-pointer">Disclaimer</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 SkillSwap Platform. Built for Odoo Hackathon 2025.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 sm:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}