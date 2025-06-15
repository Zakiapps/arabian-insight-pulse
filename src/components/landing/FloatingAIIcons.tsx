
import { motion } from 'framer-motion';
import { Brain, Zap, Star, Cloud, Eye, Sparkles } from 'lucide-react';

const FloatingAIIcons = () => {
  const aiFloatingIcons = [
    { Icon: Brain, delay: 0, x: "10%", y: "20%" },
    { Icon: Zap, delay: 0.5, x: "80%", y: "15%" },
    { Icon: Star, delay: 1, x: "15%", y: "70%" },
    { Icon: Cloud, delay: 1.5, x: "85%", y: "65%" },
    { Icon: Eye, delay: 2, x: "50%", y: "10%" },
    { Icon: Sparkles, delay: 2.5, x: "90%", y: "45%" }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {aiFloatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
            rotate: [0, 360, 0]
          }}
          transition={{
            delay: item.delay,
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        >
          <div className="p-4 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full backdrop-blur-sm">
            <item.Icon className="h-8 w-8 text-primary/60" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingAIIcons;
