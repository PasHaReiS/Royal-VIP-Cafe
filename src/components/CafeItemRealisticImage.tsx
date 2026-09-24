import React from 'react';

interface CafeItemImageProps {
  itemId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Realistic handcrafted SVG illustrations for Turkish VIP Cafe items:
 * - Traditional Turkish Tea with authentic thin-waisted glass (ince belli), ruby-amber tea, saucer & sugar cubes
 * - Turkish Coffee with authentic copper cezve/porcelain fincan, rich foam, crema and coffee beans
 * - Beyoğlu Gazoz in authentic green nostalgic glass bottle with crown cap and effervescent bubbles
 * - Antep Pistachio Turkish Delight (Fıstıklı Lokum) dusted with powdered sugar, glossy pistachio emerald nuts
 * - VIP Mixed Nuts Platter (Karışık Çerez) in ornate golden bowl with pistachios, cashews, almonds, hazelnuts
 */
export const CafeItemRealisticImage: React.FC<CafeItemImageProps> = ({
  itemId,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
  }[size];

  if (itemId === 'cay') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-[#2a1309] to-[#120703] border border-[#c89d56]/40 p-1.5 shadow-lg overflow-hidden group ${sizeClasses} ${className}`}
        title="Tavşan Kanı İnce Belli Rize Çayı"
      >
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/40 pointer-events-none" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Saucer Gradient */}
            <linearGradient id="saucerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdfbf7" />
              <stop offset="45%" stopColor="#e5ded0" />
              <stop offset="100%" stopColor="#c5baa5" />
            </linearGradient>
            {/* Saucer Rim Red Pattern */}
            <linearGradient id="saucerRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            {/* Ruby Amber Tea Liquid */}
            <linearGradient id="teaLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="25%" stopColor="#b45309" />
              <stop offset="65%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            {/* Glass Highlight */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
            </linearGradient>
            {/* Brass Spoon */}
            <linearGradient id="spoonGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>

          {/* Steam Effect */}
          <path
            d="M 45 15 Q 40 8 47 3 Q 54 -2 46 -8"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M 53 14 Q 58 7 52 2"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Porcelain Saucer (Çay Tabağı) with Ottoman Red Details */}
          <ellipse cx="50" cy="85" rx="44" ry="12" fill="url(#saucerGrad)" stroke="#a89a85" strokeWidth="1" />
          <ellipse cx="50" cy="85" rx="41" ry="9.5" fill="none" stroke="url(#saucerRed)" strokeWidth="2.2" strokeDasharray="6 3" />
          <ellipse cx="50" cy="85" rx="26" ry="6" fill="#ded4c3" stroke="#b0a08a" strokeWidth="0.8" />

          {/* Small Brass Spoon on Saucer */}
          <path
            d="M 16 88 C 22 84 40 81 60 78 L 62 80 C 42 83 23 86 16 88 Z"
            fill="url(#spoonGold)"
            stroke="#78350f"
            strokeWidth="0.4"
          />
          <ellipse cx="16" cy="87.5" rx="5" ry="2.5" fill="url(#spoonGold)" stroke="#78350f" strokeWidth="0.5" />

          {/* Sugar Cubes (Kesme Şeker) */}
          <rect x="74" y="80" width="7" height="6" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" transform="rotate(-10 74 80)" />
          <rect x="80" y="81" width="7" height="6" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" transform="rotate(12 80 81)" />

          {/* Classic Ince Belli Turkish Tea Glass Body */}
          {/* Outer Glass Shell */}
          <path
            d="M 33 22 
               C 33 22, 32 40, 42 56 
               C 42 56, 33 68, 35 81
               C 35 83, 65 83, 65 81
               C 67 68, 58 56, 58 56
               C 68 40, 67 22, 67 22
               Z"
            fill="#ffffff"
            fillOpacity="0.12"
            stroke="#fef3c7"
            strokeWidth="1.2"
          />

          {/* Glowing Ruby Amber Tea Liquid */}
          <path
            d="M 34.5 32 
               C 34.5 32, 34 42, 42.5 56 
               C 42.5 56, 35 68, 36.5 80
               C 36.5 81.5, 63.5 81.5, 63.5 80
               C 65 68, 57.5 56, 57.5 56
               C 66 42, 65.5 32, 65.5 32
               Z"
            fill="url(#teaLiquid)"
          />

          {/* Tea Surface Foam & Ring */}
          <ellipse cx="50" cy="32" rx="15.5" ry="3.5" fill="#f59e0b" fillOpacity="0.8" />
          <ellipse cx="50" cy="32" rx="13" ry="2.2" fill="#78350f" />

          {/* Glass Highlights / Reflections (Göz alıcı yansıma) */}
          <path
            d="M 37 25 C 36 38 43 52 44 56 C 39 67 38 74 38 78"
            fill="none"
            stroke="url(#glassReflection)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 63 26 C 62 36 57 48 56 55 C 59 66 61 74 61 77"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Golden Rim on Glass Lip (Yaldızlı Dudak Payı) */}
          <ellipse cx="50" cy="22" rx="17" ry="3.5" fill="none" stroke="url(#spoonGold)" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }

  if (itemId === 'kahve') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-[#2a1309] to-[#120703] border border-[#c89d56]/40 p-1.5 shadow-lg overflow-hidden group ${sizeClasses} ${className}`}
        title="Közde Okkalı Türk Kahvesi"
      >
        <div className="absolute inset-0 bg-radial from-amber-600/10 via-transparent to-black/40 pointer-events-none" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Copper Cezve Gradient */}
            <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="35%" stopColor="#c2410c" />
              <stop offset="70%" stopColor="#7c2d12" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
            {/* Coffee Foam Crema Gradient */}
            <radialGradient id="cremaGrad" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="75%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#3c1e08" />
            </radialGradient>
            {/* Porcelain Fincan Gold */}
            <linearGradient id="goldFiligree" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>

          {/* Steaming Coffee Aroma */}
          <path
            d="M 52 24 Q 48 16 54 11 Q 60 6 52 1"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Copper Cezve in Background */}
          <path
            d="M 12 40 L 26 68 C 26 73 38 73 38 68 L 30 38 Z"
            fill="url(#copperGrad)"
            stroke="#451a03"
            strokeWidth="0.8"
          />
          {/* Cezve Brass Handle */}
          <path
            d="M 28 42 L 6 30"
            fill="none"
            stroke="url(#goldFiligree)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Ornate Ottoman Saucer */}
          <ellipse cx="62" cy="83" rx="34" ry="11" fill="#fdfbf7" stroke="#b09e8a" strokeWidth="1" />
          <ellipse cx="62" cy="83" rx="30" ry="8" fill="none" stroke="url(#goldFiligree)" strokeWidth="1.8" />
          <ellipse cx="62" cy="83" rx="18" ry="4.5" fill="#e7ded0" />

          {/* Coffee Fincan Handle */}
          <path
            d="M 82 52 C 92 53 92 68 81 70"
            fill="none"
            stroke="url(#goldFiligree)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* White Porcelain Fincan Body */}
          <path
            d="M 42 46 C 42 46 44 75 62 75 C 80 75 82 46 82 46 Z"
            fill="#fcfaf6"
            stroke="#d5cbba"
            strokeWidth="1"
          />

          {/* Ottoman Gold Filigree Motif on Fincan */}
          <path
            d="M 46 56 C 54 62 70 62 78 56"
            fill="none"
            stroke="url(#goldFiligree)"
            strokeWidth="1.6"
          />
          <circle cx="62" cy="62" r="2.2" fill="url(#goldFiligree)" />

          {/* Fincan Lip */}
          <ellipse cx="62" cy="46" rx="20" ry="6" fill="#ede5d8" stroke="url(#goldFiligree)" strokeWidth="1.4" />

          {/* Thick Coffee Crema / Foam (Bol Köpük) */}
          <ellipse cx="62" cy="46" rx="17.5" ry="5" fill="url(#cremaGrad)" />
          {/* Bubbles in foam */}
          <circle cx="56" cy="45" r="1.4" fill="#fef3c7" opacity="0.8" />
          <circle cx="67" cy="47" r="1.2" fill="#fde68a" opacity="0.7" />
          <circle cx="61" cy="46.5" r="0.9" fill="#fef3c7" opacity="0.9" />

          {/* Roasted Coffee Beans on table */}
          <ellipse cx="26" cy="82" rx="4.5" ry="3" fill="#3b1b0b" transform="rotate(-25 26 82)" />
          <path d="M 23.5 83 Q 26 82 28.5 81" fill="none" stroke="#602d13" strokeWidth="0.8" />

          <ellipse cx="34" cy="85" rx="4" ry="2.6" fill="#451a03" transform="rotate(35 34 85)" />
          <path d="M 32 84 Q 34 85 36 86" fill="none" stroke="#78350f" strokeWidth="0.7" />
        </svg>
      </div>
    );
  }

  if (itemId === 'gazoz') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-[#102213] to-[#051109] border border-emerald-500/40 p-1.5 shadow-lg overflow-hidden group ${sizeClasses} ${className}`}
        title="Beyoğlu Zencefilli Cam Şişe Gazozu"
      >
        <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-black/40 pointer-events-none" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Nostalgic Green Glass */}
            <linearGradient id="gazozGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="35%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            {/* Crown Bottle Cap */}
            <linearGradient id="crownCap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            {/* Retro Label */}
            <linearGradient id="retroLabel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>

          {/* Ice Cubes with condensation */}
          <rect x="62" y="70" width="16" height="15" rx="3" fill="#e0f2fe" fillOpacity="0.4" stroke="#bae6fd" strokeWidth="1" transform="rotate(15 62 70)" />
          <rect x="18" y="72" width="14" height="13" rx="2.5" fill="#e0f2fe" fillOpacity="0.35" stroke="#bae6fd" strokeWidth="0.8" transform="rotate(-18 18 72)" />

          {/* Gazoz Bottle Silhouette */}
          {/* Bottle Neck & Mouth */}
          <path
            d="M 46 8 L 54 8 L 55 14 L 53 30 C 53 30 63 38 65 48 L 65 84 C 65 88 35 88 35 84 L 35 48 C 37 38 47 30 47 30 L 45 14 Z"
            fill="url(#gazozGlass)"
            stroke="#a7f3d0"
            strokeWidth="1"
          />

          {/* Red Crown Metal Cap (Tırtıklı Taç Kapak) */}
          <rect x="44" y="5" width="12" height="4.5" rx="1.2" fill="url(#crownCap)" stroke="#991b1b" strokeWidth="0.5" />
          <path d="M 43 9.5 L 57 9.5" stroke="#fca5a5" strokeWidth="1" strokeDasharray="1.5 1" />

          {/* Retro Beyoğlu Label Banner */}
          <rect x="36" y="50" width="28" height="24" rx="2" fill="url(#retroLabel)" stroke="#d97706" strokeWidth="1" />
          <text x="50" y="59" fontSize="6.5" fontWeight="900" fill="#991b1b" textAnchor="middle" fontFamily="serif">
            BEYOĞLU
          </text>
          <text x="50" y="66" fontSize="4.5" fontWeight="bold" fill="#047857" textAnchor="middle">
            GAZOZ
          </text>
          <circle cx="50" cy="70" r="1.5" fill="#d97706" />

          {/* Effervescent Rising Carbonation Bubbles (Fokurdayan Gaz Kabarcıkları) */}
          <circle cx="42" cy="78" r="1.6" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="57" cy="80" r="1.3" fill="#ffffff" fillOpacity="0.75" />
          <circle cx="48" cy="44" r="1.2" fill="#ffffff" fillOpacity="0.7" />
          <circle cx="54" cy="38" r="1.5" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="50" cy="24" r="1.2" fill="#ffffff" fillOpacity="0.9" />

          {/* Glass Condensation Light Reflections */}
          <path
            d="M 37 49 L 37 83"
            stroke="#ffffff"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M 47 18 L 47 28"
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (itemId === 'lokum') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-[#2a1708] to-[#140803] border border-amber-500/40 p-1.5 shadow-lg overflow-hidden group ${sizeClasses} ${className}`}
        title="Fıstıklı Hacı Bekir Saray Lokumu"
      >
        <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-black/40 pointer-events-none" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Antique Silver Tray (Gümüş Lokumluk) */}
            <linearGradient id="silverPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="80%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            {/* Pistachio Green Kernel (Antep Fıstığı İçi) */}
            <radialGradient id="pistachioNut" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="50%" stopColor="#4d7c0f" />
              <stop offset="100%" stopColor="#1a3408" />
            </radialGradient>
            {/* Translucent Lokum Jelly Cube (Kıvamlı Lokum Harcı) */}
            <linearGradient id="lokumJelly" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="40%" stopColor="#fde68a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            {/* Powdered Sugar Texture */}
            <linearGradient id="sugarDust" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Ottoman Embossed Silver Filigree Tray (Gümüş Tepsi) */}
          <ellipse cx="50" cy="74" rx="44" ry="16" fill="url(#silverPlate)" stroke="#64748b" strokeWidth="1" />
          <ellipse cx="50" cy="74" rx="40" ry="13" fill="none" stroke="#f1f5f9" strokeWidth="1.2" strokeDasharray="3 2" />
          <ellipse cx="50" cy="73.5" rx="35" ry="10" fill="#94a3b8" fillOpacity="0.4" />

          {/* Center Left Pistachio Lokum Cube (Çifte Kavrulmuş Lokum Küpü 1) */}
          {/* Base Cube */}
          <polygon points="20,56 46,51 46,74 20,78" fill="#d97706" />
          <polygon points="46,51 66,45 66,66 46,74" fill="#b45309" />
          <polygon points="20,56 40,43 66,45 46,51" fill="url(#lokumJelly)" stroke="#fde68a" strokeWidth="0.6" />

          {/* Embedded Emerald Pistachios Inside Cube 1 */}
          <ellipse cx="32" cy="64" rx="5" ry="3.5" fill="url(#pistachioNut)" transform="rotate(-15 32 64)" stroke="#365314" strokeWidth="0.6" />
          <ellipse cx="40" cy="70" rx="4" ry="2.8" fill="url(#pistachioNut)" transform="rotate(25 40 70)" stroke="#365314" strokeWidth="0.5" />
          <ellipse cx="54" cy="58" rx="4.8" ry="3.2" fill="url(#pistachioNut)" transform="rotate(10 54 58)" stroke="#365314" strokeWidth="0.6" />

          {/* Powdered Sugar Dusting (Pudra Şekeri Katmanı) */}
          <path d="M 20 56 Q 34 50 46 51 Q 56 47 66 45" stroke="url(#sugarDust)" strokeWidth="3" fill="none" />
          {/* Sprinkled Sugar Flakes */}
          <circle cx="34" cy="48" r="1.2" fill="#ffffff" />
          <circle cx="48" cy="46" r="1.4" fill="#ffffff" />
          <circle cx="28" cy="52" r="1" fill="#ffffff" />
          <circle cx="58" cy="50" r="1.1" fill="#ffffff" />

          {/* Stacked Top Lokum Cube (Üstteki İkinci Lokum Küpü) */}
          <polygon points="38,36 64,30 64,52 38,57" fill="#b45309" />
          <polygon points="64,30 82,26 82,46 64,52" fill="#92400e" />
          <polygon points="38,36 56,25 82,26 64,30" fill="url(#lokumJelly)" stroke="#fef08a" strokeWidth="0.6" />

          {/* Whole Green Antep Pistachio on Top of Second Cube */}
          <ellipse cx="52" cy="42" rx="5.5" ry="3.8" fill="url(#pistachioNut)" transform="rotate(-20 52 42)" stroke="#365314" strokeWidth="0.8" />
          {/* Pistachio Texture Split */}
          <path d="M 48 42 Q 52 41 56 42" stroke="#a3e635" strokeWidth="0.8" fill="none" />

          <ellipse cx="72" cy="38" rx="4.5" ry="3.2" fill="url(#pistachioNut)" transform="rotate(20 72 38)" stroke="#365314" strokeWidth="0.7" />

          {/* Heavy Sugar Snow on top */}
          <path d="M 38 36 Q 52 29 64 30 Q 74 27 82 26" stroke="#ffffff" strokeWidth="3.2" fill="none" opacity="0.9" />
          <circle cx="58" cy="27" r="1.4" fill="#ffffff" />
          <circle cx="68" cy="28" r="1.2" fill="#ffffff" />

          {/* Scattered Powdered Sugar & Pistachio Flakes on Tray */}
          <ellipse cx="76" cy="72" rx="4" ry="2.5" fill="url(#pistachioNut)" transform="rotate(30 76 72)" />
          <circle cx="24" cy="74" r="1.3" fill="#ffffff" opacity="0.9" />
          <circle cx="28" cy="76" r="1.1" fill="#ffffff" opacity="0.9" />
          <circle cx="70" cy="78" r="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (itemId === 'cerez') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-[#29170a] to-[#120803] border border-amber-600/40 p-1.5 shadow-lg overflow-hidden group ${sizeClasses} ${className}`}
        title="VIP Karışık Lüks Çerez Tabağı"
      >
        <div className="absolute inset-0 bg-radial from-amber-600/15 via-transparent to-black/40 pointer-events-none" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Golden Bowl Gradient */}
            <linearGradient id="goldBowl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            {/* Almond Brown */}
            <linearGradient id="almondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="60%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            {/* Cashew Cream */}
            <linearGradient id="cashewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="60%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            {/* Hazelnut / Fındık */}
            <radialGradient id="hazelnutGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Golden Carved Bowl Base */}
          <ellipse cx="50" cy="74" rx="42" ry="15" fill="url(#goldBowl)" stroke="#78350f" strokeWidth="1" />
          <ellipse cx="50" cy="73" rx="38" ry="12" fill="#3f1c09" />

          {/* Salted Roasted Pistachio with Split Shell (Açık Çitlek Antep Fıstığı) */}
          <ellipse cx="36" cy="58" rx="8" ry="5.5" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" transform="rotate(-25 36 58)" />
          <ellipse cx="36" cy="58" rx="5" ry="3.5" fill="#65a30d" stroke="#3f6212" strokeWidth="0.6" transform="rotate(-25 36 58)" />
          <path d="M 31 59 L 41 57" stroke="#78350f" strokeWidth="0.8" />

          {/* Golden Roasted Cashew (Hilal Kaju) */}
          <path
            d="M 52 48 C 62 45 68 56 63 64 C 59 70 52 66 54 60 C 56 55 52 52 50 51 Z"
            fill="url(#cashewGrad)"
            stroke="#b45309"
            strokeWidth="0.8"
          />

          {/* Roasted Giresun Hazelnut (Kavrulmuş Fındık) */}
          <circle cx="48" cy="62" r="6.5" fill="url(#hazelnutGrad)" stroke="#451a03" strokeWidth="0.8" />
          <ellipse cx="46.5" cy="59.5" rx="2" ry="1.2" fill="#fef3c7" opacity="0.6" />

          {/* Roasted Almond with Striped Skin (Datça Bademi) */}
          <path
            d="M 22 66 C 20 62 25 54 32 55 C 38 56 36 67 29 69 C 25 70 23 68 22 66 Z"
            fill="url(#almondGrad)"
            stroke="#451a03"
            strokeWidth="0.7"
          />
          <path d="M 25 60 Q 28 62 31 64" stroke="#fbbf24" strokeWidth="0.6" fill="none" opacity="0.8" />

          {/* White Double-Roasted Chickpea (Beyaz Çifte Kavrulmuş Leblebi) */}
          <circle cx="68" cy="62" r="5" fill="#fefce8" stroke="#cbd5e1" strokeWidth="0.7" />
          <circle cx="66" cy="60" r="1.2" fill="#78350f" opacity="0.6" />

          {/* Second Pistachio on the right */}
          <ellipse cx="76" cy="56" rx="7.5" ry="5" fill="#fde68a" stroke="#d97706" strokeWidth="0.7" transform="rotate(30 76 56)" />
          <ellipse cx="76" cy="56" rx="4.8" ry="3.2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.6" transform="rotate(30 76 56)" />

          {/* Crystal Sea Salt Grains glistening on nuts */}
          <rect x="34" y="54" width="1.2" height="1.2" fill="#ffffff" />
          <rect x="49" y="58" width="1.4" height="1.4" fill="#ffffff" />
          <rect x="62" y="58" width="1.2" height="1.2" fill="#ffffff" />
          <rect x="28" y="62" width="1.2" height="1.2" fill="#ffffff" />

          {/* Front Golden Rim of Bowl with Carved Pattern */}
          <path
            d="M 12 70 C 20 83 80 83 88 70"
            fill="none"
            stroke="url(#goldBowl)"
            strokeWidth="2.8"
          />
        </svg>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`flex items-center justify-center rounded-xl bg-[#26150b] text-xl ${sizeClasses} ${className}`}>
      ☕
    </div>
  );
};
