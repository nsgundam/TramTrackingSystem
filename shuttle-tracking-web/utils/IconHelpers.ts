export const generateBusIconHtml = (id: string, bearing: number, routeId: string = "R01") => {
    const displayId = id.replace('VH', '');
    const snappedBearing = Math.round(bearing / 90) * 90;
    
    // Route accent color (R01 is Coral Orange, R02 is Blue)
    const isR01 = routeId === "R01";
    const accentColor = isR01 ? "#FF8169" : "#3B82F6";
    
    // Premium Navy Blue Gradient
    const colorStart = "#1F3A6D";
    const colorEnd = "#0C172E";
    
    return `
      <div id="bus-wrapper-${id}" style="
        position: relative;
        width: 36px;
        height: 44px;
        transform: rotate(${bearing}deg);
        transition: transform 0.4s ease-out;
      ">

        <!-- Marker Body SVG -->
        <svg viewBox="0 0 32 40" style="
          position: absolute; 
          width: 36px; 
          height: 44px; 
          top: 0; 
          left: 0;
          filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.4));
        ">
          <defs>
            <linearGradient id="bus-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${colorStart}" />
              <stop offset="100%" stop-color="${colorEnd}" />
            </linearGradient>
          </defs>
          
          <!-- Outer Teardrop Pin in Navy Blue -->
          <path 
            d="M16 0 C 5 12 0 19 0 24 C 0 32.837 7.163 40 16 40 C 24.837 40 32 32.837 32 24 C 32 19 27 12 16 0 Z" 
            fill="url(#bus-grad-${id})" 
            stroke="#ffffff" 
            stroke-width="1.8"
          />
          
          <!-- Text Label (Large, Bold, High-Contrast) -->
          <text
            id="bus-text-${id}"
            x="16.5"
            y="24"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#ffffff"
            font-weight="900"
            font-size="11"
            font-family="system-ui, -apple-system, sans-serif"
            letter-spacing="0.08em"
            transform="rotate(${-snappedBearing}, 16, 24)"
          >${displayId}</text>
        </svg>
      </div>
    `;
  };

