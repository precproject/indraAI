import { useState, useCallback } from 'react';

export const useSmartLocation = () => {
  // लोकेशनची सर्व माहिती एकाच Object मध्ये
  const [locationData, setLocationData] = useState({
    lat: null,
    lng: null,
    village: '',
    district: '',
    state: '',
    pincode: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(() => {
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('तुमच्या मोबाईलमध्ये लोकेशनची सुविधा नाही.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Nominatim कडून मराठी/इंग्रजी पत्ता आणणे
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&accept-language=mr,en&format=json`,
            { headers: { 'User-Agent': 'IndraAI-AgriApp/1.0' } }
          );

          if (!response.ok) throw new Error('पत्ता शोधता आला नाही');

          const data = await response.json();
          const address = data.address || {};

          const village = address.village || address.town || address.city || '';
          const rawDistrict = address.state_district || address.county || '';
          const district = rawDistrict.replace(' District', '').replace(' जिल्हा', '').trim();
          const state = address.state || 'Maharashtra';
          const pincode = address.postcode || '';

          // माहिती स्टेटमध्ये सेव्ह करणे
          setLocationData({ lat, lng, village, district, state, pincode });
          
        } catch (err) {
          setError('पत्ता शोधताना अडचण आली. कृपया माहिती हाताने भरा.');
          // जरी पत्ता मिळाला नाही, तरी Lat/Lng सेव्ह करा कारण ते महत्त्वाचे आहेत
          setLocationData(prev => ({ ...prev, lat, lng }));
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        // जर युजरने परवानगी नाकारली (Permission Denied)
        setError('लोकेशन मिळवता आले नाही. कृपया GPS चालू करा आणि परवानगी द्या.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { locationData, isLocating, error, fetchLocation };
};