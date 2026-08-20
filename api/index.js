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
    
    const predictions = [];
    
    // Try multiple regex patterns to catch all variations
    const predictionRegex1 = /<prediction\s+minutes="(\d+)"\s+vehicle="([^"]+)"\s+[^>]*dirTag="([^"]+)"/g;
    let match;
    
    while ((match = predictionRegex1.exec(xml)) !== null) {
      const minutes = parseInt(match[1]);
      const vehicle = match[2];
      const dirTag = match[3];
      
      const isDowntown = dirTag.toLowerCase().includes('downtown') || 
                        dirTag.toLowerCase().includes('embarcadero') ||
                        dirTag.toLowerCase().includes('inbound') ||
                        dirTag.toLowerCase().includes('dtx') ||
                        dirTag.toLowerCase().includes('civic') ||
                        dirTag.toLowerCase().includes('market');
      
      if (!isNaN(minutes)) {
        predictions.push({
          minutes: minutes,
          vehicle: vehicle,
          isDowntown: isDowntown
        });
      }
    }
    
    if (predictions.length === 0) {
      const predictionRegex2 = /<prediction[^>]*minutes="(\d+)"[^>]*vehicle="([^"]*)"[^>]*>/g;
      while ((match = predictionRegex2.exec(xml)) !== null) {
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
    
    let downtownTrains = predictions.filter(p => p.isDowntown);
    const trainsToReturn = downtownTrains.length > 0 ? downtownTrains : predictions;
    
    const seen = new Set();
    const uniqueTrains = [];
    
    trainsToReturn.sort((a, b) => a.minutes - b.minutes);
    
    for (const train of trainsToReturn) {
      const key = train.vehicle || train.minutes;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTrains.push({
          minutes: train.minutes,
          vehicle: train.vehicle || 'N/A'
        });
      }
    }
    
    res.status(200).json(uniqueTrains.slice(0, 4));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals', details: error.message });
  }
}
