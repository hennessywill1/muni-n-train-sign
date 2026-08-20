export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const STOP_ID = '13911';
    const ROUTE = 'N';
    const AGENCY = 'sfmta';
    
    const url = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=${AGENCY}&stopId=${STOP_ID}&routeTag=${ROUTE}`;
    
    const response = await fetch(url);
    const xml = await response.text();
    
    // Simple XML parsing without external library
    const predictions = [];
    
    // Extract all prediction elements
    const predictionRegex = /<prediction\s+minutes="(\d+)"[^>]*vehicle="([^"]+)"[^>]*dirTag="([^"]+)"/g;
    let match;
    
    while ((match = predictionRegex.exec(xml)) !== null) {
      const minutes = parseInt(match[1]);
      const vehicle = match[2];
      const dirTag = match[3];
      
      // Filter for downtown direction
      const isDowntown = dirTag.toLowerCase().includes('downtown') || 
                        dirTag.toLowerCase().includes('embarcadero') ||
                        dirTag.toLowerCase().includes('inbound') ||
                        dirTag.toLowerCase().includes('dtx');
      
      if (isDowntown && !isNaN(minutes)) {
        predictions.push({
          minutes: minutes,
          vehicle: vehicle
        });
      }
    }
    
    // If no downtown trains found, get all trains
    if (predictions.length === 0) {
      const allPredRegex = /<prediction\s+minutes="(\d+)"[^>]*vehicle="([^"]+)"/g;
      while ((match = allPredRegex.exec(xml)) !== null) {
        const minutes = parseInt(match[1]);
        const vehicle = match[2];
        
        if (!isNaN(minutes)) {
          predictions.push({
            minutes: minutes,
            vehicle: vehicle
          });
        }
      }
    }
    
    // Remove duplicates and sort
    const uniquePredictions = Array.from(new Map(predictions.map(p => [p.vehicle, p])).values());
    uniquePredictions.sort((a, b) => a.minutes - b.minutes);
    
    res.status(200).json(uniquePredictions.slice(0, 4));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals', details: error.message });
  }
}
