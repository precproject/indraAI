export const locationService = {
  // We accept 'existingDistrict' so if the app already knows where the user is, we skip the network completely.
  async getDistrict(existingDistrict = null) {
    
    // ── Layer 1: Check if we already know the location ──
    if (existingDistrict && existingDistrict !== 'माहित नाही') {
      return existingDistrict;
    }

    // ── Layer 2: Check the Browser Cache ──
    // If we guessed the location 5 minutes ago before a refresh, just reuse it!
    const cachedLocation = sessionStorage.getItem('indra_guessed_district');
    if (cachedLocation) {
      return cachedLocation;
    }

    // ── Layer 3: Primary Free API (ipwho.is) ──
    try {
      const response = await fetch('https://ipwho.is/');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.city) {
          sessionStorage.setItem('indra_guessed_district', data.city); // Save to cache
          return data.city;
        }
      }
    } catch (error) {
      console.warn("Primary location service failed, automatically trying fallback...");
    }

    // ── Layer 4: Fallback Free API (ipinfo.io) ──
    try {
      const fallbackResponse = await fetch('https://ipinfo.io/json');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.city) {
          sessionStorage.setItem('indra_guessed_district', fallbackData.city); // Save to cache
          return fallbackData.city;
        }
      }
    } catch (error) {
      console.error("All location services failed. Defaulting to state level.");
    }

    // ── Layer 5: Safe Default ──
    return '';
  }
};