// Ticker drag functionality
(function() {
  'use strict';

  const tickerTrack = document.getElementById('tickerTrack');
  if (!tickerTrack) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let wasAnimating = false;
  let animationFrameId = null;
  let animationStartTime = 0;
  let animationStartPos = 0;
  const ANIMATION_DURATION = 60000; // 60 seconds, matching CSS
  const ANIMATION_DISTANCE = 0; // Will be calculated from track width

  // Get current transform value from computed style
  function getCurrentTransform() {
    const style = window.getComputedStyle(tickerTrack);
    if (style.transform === 'none') return 0;
    const matrix = new DOMMatrix(style.transform);
    return matrix.e; // e is the translateX value
  }

  // Set transform
  function setTransform(value) {
    tickerTrack.style.transform = `translateX(${value}px)`;
  }

  // Start JavaScript animation from current position
  function startAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    const trackWidth = tickerTrack.scrollWidth / 2; // Half because we duplicate content
    const pixelsPerSecond = trackWidth / (ANIMATION_DURATION / 1000); // Speed: trackWidth pixels per ANIMATION_DURATION
    
    // Get current position and normalize it to be within [0, -trackWidth)
    let currentPos = getCurrentTransform();
    let normalizedStart = currentPos % trackWidth;
    if (normalizedStart > 0) normalizedStart -= trackWidth;
    
    animationStartPos = normalizedStart;
    animationStartTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = (currentTime - animationStartTime) / 1000; // elapsed in seconds
      
      // Calculate new position: move left at constant speed
      let newPos = animationStartPos - (pixelsPerSecond * elapsed);
      
      // Handle seamless looping: when position goes beyond -trackWidth, wrap around
      // Since content is duplicated, -trackWidth and 0 show the same content
      while (newPos <= -trackWidth) {
        newPos += trackWidth;
        animationStartPos += trackWidth;
      }
      
      setTransform(newPos);
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);
  }

  // Stop JavaScript animation
  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Handle mouse down
  tickerTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    tickerTrack.style.cursor = 'grabbing';
    
    // Check if animation is running
    const animationState = window.getComputedStyle(tickerTrack).animationPlayState;
    wasAnimating = animationState === 'running';
    
    // Stop CSS animation and switch to manual control
    tickerTrack.style.animationPlayState = 'paused';
    tickerTrack.style.animation = 'none';
    stopAnimation();
    
    startX = e.pageX;
    scrollLeft = getCurrentTransform();
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Handle mouse move
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const walk = (e.pageX - startX) * 1.5; // 1.5x scroll speed for better control
    const newTransform = scrollLeft + walk;
    
    setTransform(newTransform);
  });

  // Handle mouse up
  function handleMouseUp() {
    if (!isDragging) return;
    
    isDragging = false;
    tickerTrack.style.cursor = 'grab';
    
    // Restore animation if it was running before
    if (wasAnimating) {
      // Start JavaScript animation from current position
      startAnimation();
    }
  }

  document.addEventListener('mouseup', handleMouseUp);

  // Handle mouse leave
  tickerTrack.addEventListener('mouseleave', () => {
    if (isDragging) {
      handleMouseUp();
    }
  });

  // Add grab cursor on hover
  tickerTrack.style.cursor = 'grab';
  
  // Prevent text selection while dragging
  tickerTrack.addEventListener('selectstart', (e) => {
    if (isDragging) {
      e.preventDefault();
    }
  });

  // Arrow button navigation
  const navLeft = document.getElementById('tickerNavLeft');
  const navRight = document.getElementById('tickerNavRight');
  
  if (navLeft && navRight) {
    const scrollAmount = 400; // pixels to scroll per click
    
    // Helper function to scroll smoothly
    function scrollTicker(direction) {
      // Stop any running animation
      tickerTrack.style.animationPlayState = 'paused';
      tickerTrack.style.animation = 'none';
      stopAnimation();
      
      // Get current position
      let currentPos = getCurrentTransform();
      const trackWidth = tickerTrack.scrollWidth / 2;
      
      // Calculate new position
      let newPos = currentPos + (direction * scrollAmount);
      
      // Handle seamless looping
      let normalizedStart = newPos % trackWidth;
      if (normalizedStart > 0) normalizedStart -= trackWidth;
      newPos = normalizedStart;
      
      // Smooth scroll animation
      const startPos = currentPos;
      const distance = newPos - startPos;
      const duration = 300; // ms
      const startTime = performance.now();
      
      function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentPos = startPos + (distance * easeProgress);
        
        setTransform(currentPos);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Restart auto-scroll animation after scroll completes
          setTimeout(() => {
            startAnimation();
          }, 100);
        }
      }
      
      requestAnimationFrame(animateScroll);
    }
    
    // Scroll left (show earlier content)
    navLeft.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollTicker(1); // Positive direction = scroll right visually = show earlier content
    });
    
    // Scroll right (show later content)
    navRight.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollTicker(-1); // Negative direction = scroll left visually = show later content
    });
  }

  // Initialize: if CSS animation is running, switch to JS animation for drag support
  // Wait for page load to ensure CSS is applied
  window.addEventListener('load', () => {
    // Check if we should start JS animation (if CSS animation was running)
    // For now, let CSS animation run initially, we'll switch to JS when user interacts
  });
})();

