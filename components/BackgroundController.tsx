
import React from 'react';
import { AppTheme } from '../types';

interface BackgroundControllerProps {
  theme: AppTheme;
}

const BackgroundController: React.FC<BackgroundControllerProps> = ({ theme }) => {
  // Common colors from theme
  const bg = theme.colors['--color-background'];
  const primary = theme.colors['--color-primary'];
  const secondary = theme.colors['--color-secondary'];
  const accent = theme.colors['--color-accent'];
  const border = theme.colors['--color-border'];

  // Render specific background based on theme ID
  const renderBackground = () => {
    switch (theme.id) {
      // --- CHEMISTRY ---
      case 'LABORATORY':
          return (
              <div className="w-full h-full relative overflow-hidden bg-[#0f172a]">
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
                    <defs>
                        <radialGradient id="lab-vignette" cx="50%" cy="50%" r="70%">
                            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
                        </radialGradient>
                        <radialGradient id="atom-red" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fca5a5" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                        <radialGradient id="atom-white" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#64748b" />
                        </radialGradient>
                        <radialGradient id="atom-black" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#475569" />
                            <stop offset="50%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#000000" />
                        </radialGradient>
                        <linearGradient id="liq-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.9"/>
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85"/>
                            <stop offset="100%" stopColor="#581c87" stopOpacity="0.95"/>
                        </linearGradient>
                        <linearGradient id="liq-green" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#86efac" stopOpacity="0.9"/>
                            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.85"/>
                            <stop offset="100%" stopColor="#14532d" stopOpacity="0.95"/>
                        </linearGradient>
                        <linearGradient id="liq-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9"/>
                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.85"/>
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95"/>
                        </linearGradient>
                        <linearGradient id="glass-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
                            <stop offset="40%" stopColor="white" stopOpacity="0.05"/>
                            <stop offset="100%" stopColor="white" stopOpacity="0.2"/>
                        </linearGradient>
                        <linearGradient id="glass-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
                            <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
                        </linearGradient>
                        <pattern id="pt-grid" x="0" y="0" width="40" height="30" patternUnits="userSpaceOnUse">
                            <rect width="38" height="28" fill="#e2e8f0" stroke="none"/>
                            <rect x="2" y="2" width="34" height="10" fill="#cbd5e1" />
                        </pattern>
                        <filter id="blur-bg" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" />
                        </filter>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    <rect x="0" y="0" width="1920" height="1080" fill="url(#bg-gradient)" />
                    
                    {/* Background Elements - Centered Range */}
                    <g transform="translate(450, 250) rotate(-8) skewX(12) scale(0.9)" opacity="0.8">
                        <rect x="0" y="0" width="550" height="400" fill="white" rx="5" filter="url(#blur-bg)" />
                        <rect x="15" y="15" width="520" height="370" fill="url(#pt-grid)" opacity="0.6" />
                    </g>

                    <g transform="translate(1100, 150) scale(0.9)" opacity="0.4" filter="url(#blur-bg)">
                        <rect x="0" y="0" width="10" height="400" fill="#64748b" />
                        <rect x="300" y="0" width="10" height="400" fill="#64748b" />
                        <rect x="0" y="100" width="310" height="10" fill="#94a3b8" />
                        <rect x="0" y="300" width="310" height="10" fill="#94a3b8" />
                        <rect x="50" y="20" width="40" height="80" fill="#0ea5e9" opacity="0.6" />
                        <rect x="120" y="120" width="30" height="90" fill="#22c55e" opacity="0.6" />
                        <rect x="200" y="220" width="50" height="80" fill="#a855f7" opacity="0.6" />
                    </g>

                    {/* Left Flask - Moved Inward to x=550 */}
                    <g transform="translate(550, 780) scale(1.4)" className="animate-float" style={{animationDuration: '7s'}}>
                        <circle cx="0" cy="50" r="95" fill="url(#liq-green)" opacity="0.85" filter="url(#glow)" />
                        <ellipse cx="0" cy="-45" rx="95" ry="15" fill="#22c55e" opacity="0.5" />
                        <path d="M -60 -20 Q -80 20 -70 80" stroke="white" strokeWidth="4" fill="none" opacity="0.5" strokeLinecap="round" />
                        <path d="M -35 -160 L 35 -160 L 35 -50 Q 100 -30 100 50 A 100 100 0 1 1 -100 50 Q -100 -30 -35 -50 Z" fill="url(#glass-body)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                        <ellipse cx="0" cy="-160" rx="35" ry="6" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
                    </g>

                    {/* Right Flask - Moved Inward to x=1380 */}
                    <g transform="translate(1380, 800) scale(1.3)" className="animate-float" style={{animationDuration: '8s', animationDelay: '1s'}}>
                        <path d="M -80 160 L 80 160 L 30 0 L -30 0 Z" fill="url(#liq-purple)" opacity="0.9" filter="url(#glow)" />
                        <ellipse cx="0" cy="0" rx="30" ry="5" fill="#a855f7" opacity="0.6" />
                        <circle cx="0" cy="100" r="5" fill="white" opacity="0.4">
                             <animate attributeName="cy" values="100; 20" dur="3s" repeatCount="indefinite" />
                             <animate attributeName="opacity" values="0.4; 0" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <path d="M -35 -120 L 35 -120 L 35 0 L 90 170 Q 100 190 0 190 Q -100 190 -90 170 L -35 0 Z" fill="url(#glass-body)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                        <ellipse cx="0" cy="-120" rx="35" ry="6" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
                        <path d="M -28 -110 L -28 10 L -80 170" stroke="url(#glass-highlight)" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
                    </g>

                    {/* Molecule - Moved Inward to x=650 */}
                    <g transform="translate(650, 320) scale(0.7)" className="animate-float" style={{animationDuration: '10s'}}>
                        <line x1="0" y1="0" x2="100" y2="-80" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                        <line x1="0" y1="0" x2="-120" y2="-50" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                        <line x1="0" y1="0" x2="40" y2="120" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                        <circle cx="0" cy="0" r="45" fill="url(#atom-black)" />
                        <circle cx="100" cy="-80" r="35" fill="url(#atom-red)" />
                        <circle cx="-120" cy="-50" r="35" fill="url(#atom-white)" />
                        <circle cx="40" cy="120" r="35" fill="url(#atom-white)" />
                        <circle cx="-15" cy="-15" r="15" fill="white" opacity="0.15" />
                    </g>

                    {/* Beaker - Moved Inward to x=1250 */}
                    <g transform="translate(1250, 520) scale(1.0)" className="animate-float" style={{animationDuration: '9s', animationDelay: '2s'}}>
                        <path d="M -65 130 L 65 130 L 70 0 L -70 0 Z" fill="url(#liq-blue)" opacity="0.8" filter="url(#glow)" />
                        <path d="M -75 -60 L -65 140 Q 0 150 65 140 L 75 -60" fill="url(#glass-body)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        <path d="M -75 -60 L 75 -60" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                        <line x1="-50" y1="0" x2="-30" y2="0" stroke="white" strokeWidth="2" opacity="0.5"/>
                        <line x1="-52" y1="50" x2="-32" y2="50" stroke="white" strokeWidth="2" opacity="0.5"/>
                    </g>

                    <rect x="0" y="900" width="1920" height="180" fill="url(#glass-body)" opacity="0.1" filter="url(#blur-bg)" />
                    <rect width="100%" height="100%" fill="url(#lab-vignette)" pointerEvents="none" />
                  </svg>
                  <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/70 pointer-events-none"></div>
              </div>
          );

      case 'WATERCOLOR':
        return (
            <div className="w-full h-full relative overflow-hidden bg-[#fdfbf7]">
                <svg className="w-full h-full absolute inset-0 opacity-70">
                    <defs>
                        <filter id="water-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
                        </filter>
                    </defs>
                    <g filter="url(#water-blur)">
                        <circle cx="20%" cy="30%" r="25%" fill={primary} className="animate-blob-1" opacity="0.3" />
                        <circle cx="80%" cy="20%" r="30%" fill={secondary} className="animate-blob-2" opacity="0.3" />
                        <circle cx="50%" cy="70%" r="35%" fill={accent} className="animate-blob-3" opacity="0.25" />
                        <circle cx="90%" cy="80%" r="25%" fill={primary} className="animate-blob-2" opacity="0.2" />
                        <circle cx="10%" cy="90%" r="30%" fill={secondary} className="animate-blob-1" opacity="0.3" />
                    </g>
                </svg>
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
            </div>
        );

      case 'NOCTURNE':
        return (
            <div className="w-full h-full relative overflow-hidden bg-[#020617]">
                <svg className="w-full h-full absolute inset-0">
                    <defs>
                        <filter id="midnight-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
                        </filter>
                    </defs>
                    <g filter="url(#midnight-blur)">
                        {/* Deep flowing pools of color */}
                        <circle cx="20%" cy="30%" r="30%" fill="#4c0519" className="animate-blob-1" opacity="0.8" /> 
                        <circle cx="80%" cy="20%" r="35%" fill="#172554" className="animate-blob-2" opacity="0.8" />
                        <circle cx="50%" cy="70%" r="40%" fill="#312e81" className="animate-blob-3" opacity="0.6" />
                        
                        {/* Brighter highlights simulating light hitting the ink */}
                        <circle cx="90%" cy="80%" r="20%" fill={primary} className="animate-blob-2" opacity="0.15" />
                        <circle cx="10%" cy="90%" r="25%" fill={secondary} className="animate-blob-1" opacity="0.15" />
                    </g>
                </svg>
                {/* Grain texture overlay for that paper/ink feel */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div>
        );

      case 'BW_WATERCOLOR':
        return (
            <div className="w-full h-full relative overflow-hidden bg-[#f8f9fa]">
                <svg className="w-full h-full absolute inset-0 opacity-80">
                    <defs>
                        <filter id="ink-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="45" />
                        </filter>
                    </defs>
                    <g filter="url(#ink-blur)">
                        <circle cx="20%" cy="20%" r="20%" fill="#000000" className="animate-blob-1" opacity="0.15" />
                        <circle cx="80%" cy="30%" r="25%" fill="#1a1a1a" className="animate-blob-2" opacity="0.1" />
                        <circle cx="40%" cy="80%" r="30%" fill="#333333" className="animate-blob-3" opacity="0.08" />
                        <circle cx="90%" cy="90%" r="20%" fill="#000000" className="animate-blob-2" opacity="0.12" />
                        <circle cx="10%" cy="70%" r="25%" fill="#4d4d4d" className="animate-blob-1" opacity="0.05" />
                    </g>
                </svg>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
            </div>
        );

      case 'BLUEPRINT':
        return (
           <div className="w-full h-full relative overflow-hidden bg-[#172554]">
               <svg className="w-full h-full absolute inset-0 opacity-20">
                   <defs>
                       <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                           <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
                       </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
                   <g transform="translate(50%, 50%)" stroke="white" fill="none" strokeWidth="1">
                       <circle r="150" strokeDasharray="5 5" className="animate-spin-slow" />
                       <path d="M-200,0 H200 M0,-200 V200" opacity="0.3" />
                       <rect x="-100" y="-60" width="200" height="120" rx="10" />
                       <circle cx="-80" cy="0" r="20" />
                       <circle cx="80" cy="0" r="20" />
                       <path d="M-60,0 H60" strokeDasharray="2 2" />
                       <path d="M-250,0 L-180,0" markerEnd="url(#arrow)" />
                       <path d="M250,0 L180,0" markerEnd="url(#arrow)" />
                   </g>
               </svg>
           </div>
        );

      case 'AQUEOUS':
          return (
              <div className="w-full h-full relative overflow-hidden bg-[#ecfeff]">
                  <svg className="w-full h-full absolute inset-0">
                      <defs>
                          <radialGradient id="water-drop" cx="30%" cy="30%">
                              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                          </radialGradient>
                      </defs>
                      {/* Bubbles focused 30-70% */}
                      {Array.from({ length: 20 }).map((_, i) => (
                          <circle key={i} r={Math.random() * 30 + 10} fill="url(#water-drop)" className="animate-float" style={{
                              cx: `${30 + Math.random() * 40}%`, 
                              cy: `${30 + Math.random() * 40}%`,
                              animationDuration: `${Math.random() * 5 + 4}s`,
                              animationDelay: `${Math.random() * 5}s`
                          }} />
                      ))}
                      <path d="M0,50% Q50%,45% 100%,50%" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                      <circle cx="50%" cy="50%" r="20%" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
                  </svg>
              </div>
          );

      case 'MOLECULAR':
          return (
              <div className="w-full h-full relative overflow-hidden bg-slate-900">
                  <svg className="w-full h-full absolute inset-0 opacity-30">
                      <pattern id="hex-grid" width="60" height="52" patternUnits="userSpaceOnUse">
                          <path d="M30 0 L60 17 L60 52 L30 69 L0 52 L0 17 Z" fill="none" stroke={primary} strokeWidth="1" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#hex-grid)" />
                      
                      <g transform="translate(50%, 50%)" className="animate-spin-slow" style={{ animationDuration: '60s' }}>
                           <circle cx="0" cy="0" r="150" fill="none" stroke={primary} strokeWidth="1" strokeDasharray="10 10" opacity="0.5" />
                      </g>

                      {/* Atoms clustered 40-60% */}
                      {Array.from({ length: 10 }).map((_, i) => (
                          <g key={i} className="animate-float">
                              <circle cx={`${40 + Math.random() * 20}%`} cy={`${40 + Math.random() * 20}%`} r="8" fill={secondary} opacity="0.6">
                                  <animate attributeName="cy" values={`${Math.random() * 100}%; ${Math.random() * 100}%`} dur={`${20 + Math.random() * 20}s`} repeatCount="indefinite" />
                              </circle>
                              <line x1={`${40 + Math.random() * 20}%`} y1={`${40 + Math.random() * 20}%`} x2={`${40 + Math.random() * 20}%`} y2={`${40 + Math.random() * 20}%`} stroke={accent} strokeWidth="2" opacity="0.4">
                                 <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
                              </line>
                          </g>
                      ))}
                  </svg>
              </div>
          );
      
      case 'ALCHEMY':
          return (
             <div className="w-full h-full relative overflow-hidden bg-[#271a2e]">
                 <svg className="w-full h-full absolute inset-0 opacity-20">
                    <g transform="translate(50%, 50%)" className="animate-spin-slow" style={{ animationDuration: '40s' }}>
                       <circle cx="0" cy="0" r="250" fill="none" stroke={primary} strokeWidth="2" />
                       <rect x="-175" y="-175" width="350" height="350" fill="none" stroke={secondary} strokeWidth="1" transform="rotate(45)" />
                    </g>
                    
                    {/* Twinkles centered 30-70% */}
                    {Array.from({ length: 25 }).map((_, i) => (
                        <circle key={i} cx={`${30 + Math.random() * 40}%`} cy={`${30 + Math.random() * 40}%`} r={Math.random() * 2 + 1} fill={accent} className="animate-twinkle" style={{animationDelay: `${Math.random() * 5}s`}} />
                    ))}
                 </svg>
                 <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#271a2e]"></div>
             </div>
          );

      case 'QUANTUM':
          return (
              <div className="w-full h-full relative overflow-hidden bg-[#0f0720]">
                  <svg className="w-full h-full absolute inset-0 opacity-50">
                      <g transform="translate(50%, 50%)">
                        <circle r="10" fill={accent} className="animate-pulse" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ellipse key={i} cx="0" cy="0" rx={150 + i * 20} ry={40 + i * 10} fill="none" stroke={i % 2 === 0 ? primary : secondary} strokeWidth="0.5" transform={`rotate(${i * 45})`}>
                                <animateTransform attributeName="transform" type="rotate" from={`${i * 45}`} to={`${i * 45 + 360}`} dur={`${8 + i}s`} repeatCount="indefinite" />
                            </ellipse>
                        ))}
                      </g>
                       {/* Particles clustered 40-60% */}
                       {Array.from({ length: 20 }).map((_, i) => (
                          <circle key={i} r="2" fill={accent} className="animate-ping-slow" style={{
                              cx: `${40 + Math.random() * 20}%`,
                              cy: `${40 + Math.random() * 20}%`,
                              animationDuration: `${2 + Math.random() * 3}s`
                          }}/>
                      ))}
                  </svg>
              </div>
          );

      case 'CELLULAR':
        return (
          <div className="w-full h-full relative overflow-hidden bg-teal-950">
             <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                {/* Cells concentrated in center 30-70% area */}
                {Array.from({ length: 15 }).map((_, i) => {
                    const size = 40 + Math.random() * 60;
                    const cx = 30 + Math.random() * 40; 
                    const cy = 30 + Math.random() * 40;
                    const duration = 10 + Math.random() * 10;
                    const delay = -(Math.random() * 20);
                    return (
                        <g key={i} opacity={0.2 + Math.random() * 0.3}>
                             <circle cx={`${cx}%`} cy={`${cy}%`} r={size} fill={primary} className="animate-blob-1">
                                 <animate attributeName="cx" values={`${cx}%; ${cx + 5}%; ${cx - 5}%; ${cx}%`} dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} />
                                 <animate attributeName="cy" values={`${cy}%; ${cy - 5}%; ${cy + 5}%; ${cy}%`} dur={`${duration * 1.2}s`} repeatCount="indefinite" begin={`${delay}s`} />
                             </circle>
                             <circle cx={`${cx}%`} cy={`${cy}%`} r={size / 3} fill={secondary} className="animate-blob-2">
                                 <animate attributeName="cx" values={`${cx}%; ${cx + 5}%; ${cx - 5}%; ${cx}%`} dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} />
                                 <animate attributeName="cy" values={`${cy}%; ${cy - 5}%; ${cy + 5}%; ${cy}%`} dur={`${duration * 1.2}s`} repeatCount="indefinite" begin={`${delay}s`} />
                             </circle>
                        </g>
                    )
                })}
             </svg>
          </div>
        );

      case 'BOKEH':
        return (
          <div className="w-full h-full relative overflow-hidden">
            <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="bokeh-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill={bg} />
              {/* Tightened to 30%-70% */}
              {Array.from({ length: 20 }).map((_, i) => {
                 const colorKey = i % 3 === 0 ? primary : i % 3 === 1 ? secondary : accent;
                 const r = 60 + Math.random() * 100;
                 const cx = 30 + Math.random() * 40; 
                 const cy = 30 + Math.random() * 40;
                 const duration = 8 + Math.random() * 7;
                 const delay = -(Math.random() * 20);
                 const startOpacity = 0.2 + Math.random() * 0.3;
                 return (
                   <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={r} fill={colorKey} opacity={startOpacity} filter="url(#bokeh-blur)">
                     <animate attributeName="cx" values={`${cx}%; ${cx + (Math.random() * 10 - 5)}%; ${cx}%`} dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} />
                     <animate attributeName="cy" values={`${cy}%; ${cy + (Math.random() * 10 - 5)}%; ${cy}%`} dur={`${duration * 1.1}s`} repeatCount="indefinite" begin={`${delay}s`} />
                     <animate attributeName="opacity" values={`${startOpacity}; ${startOpacity * 1.5}; ${startOpacity}`} dur={`${duration * 0.8}s`} repeatCount="indefinite" begin={`${delay}s`} />
                   </circle>
                 )
              })}
            </svg>
          </div>
        );

      case 'MATRIX':
        return (
          <div className="w-full h-full overflow-hidden relative">
             <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, black 100%)', zIndex: 10 }}></div>
             <div className="absolute inset-0 opacity-20" style={{ 
                 backgroundImage: `linear-gradient(0deg, transparent 24%, ${primary} 25%, ${primary} 26%, transparent 27%, transparent 74%, ${primary} 75%, ${primary} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, transparent 27%, transparent 74%, transparent 76%, transparent)`,
                 backgroundSize: '50px 50px'
             }}></div>
             {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="absolute top-0 text-xs font-mono animate-matrix-fall opacity-60" style={{
                         left: `${30 + Math.random() * 40}%`,
                         color: primary,
                         animationDuration: `${Math.random() * 3 + 1}s`,
                         animationDelay: `${Math.random() * 5}s`,
                         writingMode: 'vertical-rl',
                         textShadow: Math.abs(50 - Math.random()*100) < 20 ? `0 0 5px ${accent}` : 'none'
                     }}>
                     {Array.from({length: 20}).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
                </div>
             ))}
          </div>
        );

      // Default fallbacks for other themes (using centered particle logic)
      default:
        // Use CHALKBOARD, SKETCH, NOIR, etc. as-is from previous valid states or default to basic centered particles
        if (['CHALKBOARD', 'SKETCH', 'NOIR', 'ANCIENT', 'ATLAS', 'CIRCUIT', 'DNA', 'NEURAL', 'RETROWAVE', 'NEBULA', 'FLUX', 'FUTURISTIC', 'BLUEPRINT', 'COSMIC', 'PRISM', 'ROYAL', 'VOLCANIC', 'SUNSET', 'MIDNIGHT', 'SAKURA', 'CYBERPUNK', 'GLACIER'].includes(theme.id)) {
             return (
              <div className="w-full h-full relative overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="absolute rounded-full animate-twinkle" style={{
                      width: Math.random() * 3 + 1 + 'px',
                      height: Math.random() * 3 + 1 + 'px',
                      top: 30 + Math.random() * 40 + '%',
                      left: 30 + Math.random() * 40 + '%',
                      backgroundColor: Math.random() > 0.5 ? primary : accent,
                      opacity: Math.random(),
                      animationDuration: Math.random() * 2 + 1 + 's',
                      animationDelay: Math.random() * 5 + 's'
                    }}
                  />
                ))}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                   <pattern id="geo-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                     <path d="M0 100 L50 0 L100 100" fill="none" stroke={border} strokeWidth="0.5"/>
                   </pattern>
                   <rect width="100%" height="100%" fill="url(#geo-pattern)" />
                </svg>
              </div>
            );
        }
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes grid-scroll { 0% { transform: perspective(500px) rotateX(60deg) translateY(0); } 100% { transform: perspective(500px) rotateX(60deg) translateY(40px); } }
        @keyframes blob-1 { 0% { transform: translate(100px, 100px) scale(1) rotate(0deg); } 33% { transform: translate(110px, 90px) scale(1.1) rotate(120deg); } 66% { transform: translate(90px, 110px) scale(0.9) rotate(240deg); } 100% { transform: translate(100px, 100px) scale(1) rotate(360deg); } }
        @keyframes blob-2 { 0% { transform: translate(100px, 100px) scale(1.1) rotate(0deg); } 33% { transform: translate(90px, 110px) scale(0.9) rotate(-120deg); } 66% { transform: translate(110px, 90px) scale(1) rotate(-240deg); } 100% { transform: translate(100px, 100px) scale(1.1) rotate(-360deg); } }
        @keyframes blob-3 { 0% { transform: translate(100px, 100px) scale(0.9) rotate(0deg); } 50% { transform: translate(100px, 100px) scale(1.2) rotate(180deg); } 100% { transform: translate(100px, 100px) scale(0.9) rotate(360deg); } }
        @keyframes matrix-fall { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes wave-slow { 0% { transform: translateX(0) scaleY(1); } 50% { transform: translateX(-2%) scaleY(1.1); } 100% { transform: translateX(0) scaleY(1); } }
        @keyframes wave-medium { 0% { transform: translateX(0) scaleY(1.1); } 50% { transform: translateX(2%) scaleY(0.9); } 100% { transform: translateX(0) scaleY(1.1); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes ping-slow { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        
        .animate-grid-scroll { animation: grid-scroll 1.5s linear infinite; }
        .animate-blob-1 { animation: blob-1 12s infinite linear; transform-origin: center; }
        .animate-blob-2 { animation: blob-2 15s infinite linear; transform-origin: center; }
        .animate-blob-3 { animation: blob-3 18s infinite linear; transform-origin: center; }
        .animate-matrix-fall { animation: matrix-fall linear infinite; }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-wave-slow { animation: wave-slow 7s ease-in-out infinite; }
        .animate-wave-medium { animation: wave-medium 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; transform-origin: center; }
        .animate-spin-reverse { animation: spin-reverse 25s linear infinite; transform-origin: center; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
      <div className="absolute inset-0 -z-50 transition-colors duration-700" style={{ backgroundColor: bg }}>
        {renderBackground()}
      </div>
    </>
  );
};

export default React.memo(BackgroundController);
