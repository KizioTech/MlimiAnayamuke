import { Mail, Phone, MapPin, Facebook, MessageCircle} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-cover bg-center text-white py-12" style={{ backgroundImage: "url('/src/assets/hero-agriculture.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold mb-4">Mlimi Anayamuke Initiative | MAI</h3>
          <p className="text-gray-300">Empowering farmers with technology and expertise. Your trusted partner in modern agriculture.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
            <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
            <li><a href="/consultant" className="hover:text-primary transition-colors">Consultants</a></li>
            <li><a href="/training" className="hover:text-primary transition-colors">Training</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:mzungap@gmail.com">mzungap@gmail.com</a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Phone className="h-5 w-5 text-primary" />
            <a href="tel:+265894199625">+265 894 199 625</a>
          </div>
           <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <a href="https://wa.me/265996058928">+265 996 058 928</a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Facebook className="h-5 w-5 text-primary" />
            <a href="https://web.facebook.com/profile.php?id=100095065316526">Mlimi Anyamuke Initiative</a>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Dowa, Malawi</span>
          </div>
        </div>
      </div>
      <div className="mt-12 text-center text-gray-400 relative z-10">
        <p>&copy; {new Date().getFullYear()} Mlimi Anyamuke Initiative. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
